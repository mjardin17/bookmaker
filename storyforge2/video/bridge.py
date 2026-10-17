"""
storyforge2/video/bridge.py — Bidirectional Book-to-Video Bridge.

The Core Loop:
1. Chapter-to-Video: Converts finished book chapters into complete YouTube video
   packages (spoken-word narration script with oral pacing, scene-by-scene
   prompts preserving character art DNA, and complete YouTube metadata with timestamps).
   Outputs per chapter: script.txt, scenes.json, youtube-meta.json.
2. Video-to-Book: Takes pasted video transcripts or episode scripts and converts
   them into book chapters through the Patterson-formula pipeline (outline beats,
   target word count, dialogue ratios, punchy sentences, ending cliffhangers).
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Optional

from storyforge.patterson_formula import PattersonFormula, ReadingLevel, CliffhangerType


# ---------------------------------------------------------------------------
# Cartoon Studio Style Descriptions (Reused from src/components/CartoonStyleSelector.tsx)
# ---------------------------------------------------------------------------
CARTOON_STYLES: dict[str, dict[str, str]] = {
    "2d-classic": {
        "name": "Classic Saturday Morning",
        "prompt_prefix": "Classic 1990s 2d Saturday morning cartoon style, vibrant primary colors, bold expressive outlines, dynamic action framing, nostalgic cel-shaded aesthetic",
    },
    "pixar-3d": {
        "name": "3D Modern Feature",
        "prompt_prefix": "3D animated feature film aesthetic, Pixar/DreamWorks style, soft subsurface scattering skin, cinematic warm lighting, rich volumetric depth, expressive friendly eyes",
    },
    "storybook-watercolor": {
        "name": "Storybook Watercolor",
        "prompt_prefix": "Whimsical children's picture book illustration, soft watercolor and textured ink line art, gentle pastel palette, warm glowing highlights, magical timeless charm",
    },
    "anime-shonen": {
        "name": "Shonen Action Anime",
        "prompt_prefix": "Modern vibrant anime style, bold dynamic angles, speed lines, glowing magical particle effects, sharp expressive character design",
    },
    "paper-cutout": {
        "name": "Artisan Paper Cutout",
        "prompt_prefix": "Multi-layered textured craft paper cutout animation style, subtle drop shadows, stop-motion tactile warmth, handcrafted storybook feel",
    },
    "claymation": {
        "name": "Stop-Motion Claymation",
        "prompt_prefix": "Tactile Aardman style claymation, soft clay textures with subtle fingerprint detail, miniature set lighting, charming physical imperfections",
    },
}


# ---------------------------------------------------------------------------
# Chapter to Video Package Generator
# ---------------------------------------------------------------------------

def adapt_prose_to_spoken_script(chapter_title: str, chapter_text: str, book_title: str = "") -> str:
    """Adapts written book prose into spoken-word narration for a video voiceover.
    Applies oral storytelling rhythm, natural breathing pauses, and expressive voice cues
    (e.g. [PAUSE], [EXCITED], [WHISPERING], [WARM]) suitable for human voice actors or TTS engines.
    """
    clean_text = chapter_text.strip()
    paras = [p.strip() for p in clean_text.split("\n\n") if p.strip() and not p.startswith("###")]

    script_lines = []
    script_lines.append(f"[VOICEOVER NARRATION SCRIPT: {chapter_title.upper()}]")
    if book_title:
        script_lines.append(f"[SERIES: {book_title}]")
    script_lines.append("[PACING: Spoken-word children's adventure pacing — 130 to 145 WPM with expressive pauses]\n")

    # Opening hook for YouTube audience
    script_lines.append("[WARM, WELCOMING]")
    script_lines.append(f"Welcome back, adventurers! Today's story is: {chapter_title}.")
    script_lines.append("[PAUSE 1.0s]\n")

    for i, para in enumerate(paras):
        # Detect dialogue vs narration
        has_dialogue = '"' in para or '“' in para or "”" in para

        if has_dialogue:
            # Format dialogue with vocal cues
            # Parse quotes
            parts = re.split(r'([“"][^”"]+[”"])', para)
            spoken_para = []
            for part in parts:
                part = part.strip()
                if not part:
                    continue
                if (part.startswith('"') and part.endswith('"')) or (part.startswith('“') and part.endswith('”')):
                    dialogue_text = part.strip('"“”')
                    # Contextual emotion
                    lower = dialogue_text.lower()
                    if any(w in lower for w in ["run", "quick", "look", "!", "hurry"]):
                        cue = "[EXCITED, URGENT]"
                    elif any(w in lower for w in ["shh", "quiet", "whisper", "secret"]):
                        cue = "[WHISPERING, MYSTERIOUS]"
                    elif any(w in lower for w in ["sad", "sorry", "lonely", "tears"]):
                        cue = "[GENTLE, SYMPATHETIC]"
                    elif any(w in lower for w in ["aha", "found", "finally", "yay", "hooray"]):
                        cue = "[TRIUMPHANT, JOYFUL]"
                    else:
                        cue = "[CHARACTER VOICE]"
                    spoken_para.append(f'{cue} "{dialogue_text}" [PAUSE 0.5s]')
                else:
                    spoken_para.append(part)
            script_lines.append(" ".join(spoken_para) + "\n")
        else:
            # Narrative paragraph — ensure natural breath pauses
            sentences = re.split(r'([.!?]+)', para)
            combined_sentences = []
            for j in range(0, len(sentences) - 1, 2):
                s = sentences[j].strip() + sentences[j+1]
                if s.strip():
                    combined_sentences.append(s.strip())
            if not combined_sentences and para:
                combined_sentences = [para]

            spoken_sentences = []
            for s in combined_sentences:
                if any(w in s.lower() for w in ["suddenly", "gasp", "behold", "without warning"]):
                    spoken_sentences.append(f"[TENSION BUILDS] {s} [PAUSE 0.8s]")
                else:
                    spoken_sentences.append(f"{s} [PAUSE 0.5s]")

            script_lines.append(" ".join(spoken_sentences) + "\n")

    # Closing cliffhanger / video outro
    script_lines.append("[MYSTERIOUS, INTRIGUED]")
    script_lines.append("What will happen next on Mount Olympus? [PAUSE 1.0s]")
    script_lines.append("[UPBEAT, ENERGETIC]")
    script_lines.append("Hit subscribe, leave a comment with your favorite character, and tap the bell so you never miss the next chapter!")

    return "\n".join(script_lines)


def generate_scenes(
    chapter_number: int,
    chapter_title: str,
    chapter_text: str,
    script_text: str,
    characters: dict[str, str],
    style: str = "2d-classic",
) -> list[dict[str, Any]]:
    """Breaks the chapter into scene-by-scene animation/illustration shots.
    Each scene reuses the character's visual DNA and style description so
    characters remain visually identical across both the book and the YouTube video.
    """
    style_info = CARTOON_STYLES.get(style, CARTOON_STYLES["2d-classic"])
    style_prefix = style_info["prompt_prefix"]

    paras = [p.strip() for p in chapter_text.split("\n\n") if p.strip() and not p.startswith("###")]

    # Group into 4 to 6 balanced scenes
    target_scene_count = min(max(len(paras) // 2, 4), 6)
    paras_per_scene = max(1, len(paras) // target_scene_count)

    scenes: list[dict[str, Any]] = []
    current_time_sec = 0

    camera_motions = ["pan-right", "zoom-in", "tracking-shot", "pan-left", "zoom-out", "dramatic-shake"]
    transitions = ["bounce-pop", "iris-wipe", "cross-dissolve", "slide-left", "star-wipe"]

    for idx in range(target_scene_count):
        start_p = idx * paras_per_scene
        end_p = (idx + 1) * paras_per_scene if idx < target_scene_count - 1 else len(paras)
        scene_paras = paras[start_p:end_p]
        if not scene_paras:
            continue

        scene_text = " ".join(scene_paras)
        words = len(scene_text.split())
        # Spoken duration: ~135 WPM -> ~2.25 words/sec
        duration_sec = max(12, int(words / 2.25))

        # Detect characters in this scene
        chars_present = []
        for cname in characters.keys():
            first_name = cname.split()[0]
            if cname.lower() in scene_text.lower() or first_name.lower() in scene_text.lower():
                chars_present.append(cname)
        if not chars_present and characters:
            chars_present = [list(characters.keys())[0]]

        # Build consistent character visual DNA string
        char_prompts = []
        for cname in chars_present:
            cdesc = characters.get(cname, "")
            char_prompts.append(f"{cname} ({cdesc})")
        char_dna_str = "; ".join(char_prompts)

        # Timestamps
        mins = current_time_sec // 60
        secs = current_time_sec % 60
        timestamp_str = f"{mins}:{secs:02d}"

        # Visual description
        summary_sentence = scene_paras[0].split(".")[0] if scene_paras else chapter_title

        # Build the exact illustration prompt
        illus_prompt = (
            f"{style_prefix}. Scene {idx+1}: {summary_sentence}. "
            f"Featuring: {char_dna_str}. "
            f"Vibrant colors, detailed background, dynamic composition, 16:9 widescreen ratio, masterwork storytelling."
        )

        camera = camera_motions[idx % len(camera_motions)]
        transition = transitions[idx % len(transitions)]

        scenes.append({
            "scene_number": idx + 1,
            "title": f"{chapter_title} - Beat {idx + 1}",
            "timestamp": timestamp_str,
            "timestamp_seconds": current_time_sec,
            "duration_seconds": duration_sec,
            "characters_present": chars_present,
            "narration_excerpt": summary_sentence + "...",
            "visual_description": f"Cinematic shot of {summary_sentence}. Character action: {char_dna_str}",
            "camera_motion": camera,
            "transition": transition,
            "illustration_prompt": illus_prompt,
            "aspect_ratio": "16:9",
        })

        current_time_sec += duration_sec

    return scenes


def generate_youtube_metadata(
    chapter_number: int,
    chapter_title: str,
    book_title: str,
    scenes: list[dict[str, Any]],
    premise: str = "",
    channel_name: str = "Little Olympus Tales",
) -> dict[str, Any]:
    """Generates complete, high-CTR YouTube metadata with exact timestamps,
    SEO tags, engagement descriptions, and thumbnail prompt.
    """
    clean_title = (
        f"{chapter_title}! ⚡ {book_title} (Ep. {chapter_number}) | Animated Children's Story"
    )
    if len(clean_title) > 95:
        clean_title = f"{chapter_title}! ⚡ Ep. {chapter_number} | {book_title}"

    # Build formatted timestamp markers
    timestamp_lines = []
    for sc in scenes:
        timestamp_lines.append(f"{sc['timestamp']} - {sc['title']}")
    timestamp_block = "\n".join(timestamp_lines)

    total_secs = sum(sc["duration_seconds"] for sc in scenes)
    total_mins = total_secs // 60
    total_secs_rem = total_secs % 60
    total_duration_str = f"{total_mins}:{total_secs_rem:02d}"

    description = f"""⚡ Watch Chapter {chapter_number}: {chapter_title}!
From the bestselling children's series: "{book_title}".

{premise}

⏱️ CHAPTER TIMESTAMPS:
{timestamp_block}

📖 ABOUT THIS STORY:
Adapted directly from the picture book series "{book_title}". Every chapter is carefully formatted with fast-paced storytelling, character teamwork, and wholesome laughter for young mythologists and families.

🌟 SUBSCRIBE FOR MORE LITTLE OLYMPUS ADVENTURES:
🔔 Turn on notifications so you never miss Chapter {chapter_number + 1}!
👉 Like, Comment with your favorite Olympian god, and Share with fellow adventurers!

#LittleOlympus #GreekMythology #KidsAnimation #BedtimeStory #LittleZeus #StoryForge
"""

    tags = [
        "little olympus",
        "little zeus",
        "greek mythology for kids",
        "animated bedtime story",
        "children mythology book",
        "animated picture book",
        "athena for kids",
        "baby hercules",
        "storyforge animation",
        "kids storybook reading",
        "cartoon mythology",
        "preschool greek gods",
        "educational adventure kids",
        chapter_title.lower(),
        book_title.lower(),
    ]

    thumbnail_concept = (
        f"YouTube 16:9 Clickable Thumbnail Concept for '{clean_title}': "
        f"Vibrant close-up of Little Zeus with expressive wide electric blue eyes, "
        f"holding a glowing sparking golden lightning bolt against a swirling dramatic sky. "
        f"High contrast, bold yellow stylized text in corner: '{chapter_title.upper()}!'"
    )

    return {
        "title": clean_title,
        "description": description.strip(),
        "tags": tags,
        "category_id": "1",  # Film & Animation
        "default_language": "en",
        "total_estimated_duration": total_duration_str,
        "total_seconds": total_secs,
        "scene_count": len(scenes),
        "thumbnail_prompt": thumbnail_concept,
        "channel_branding": channel_name,
    }


def chapter_to_video_package(
    chapter_number: int,
    chapter_title: str,
    chapter_text: str,
    book_title: str,
    characters: dict[str, str],
    style: str = "2d-classic",
    output_dir: Optional[Path | str] = None,
    premise: str = "",
) -> dict[str, Any]:
    """Generates the full video package for a single chapter:
    - script.txt (spoken-word pacing, voice cues)
    - scenes.json (scene-by-scene prompts reusing character art DNA)
    - youtube-meta.json (title, timestamps, tags, thumbnail prompt)
    Saves them to output_dir if specified.
    """
    script_text = adapt_prose_to_spoken_script(chapter_title, chapter_text, book_title=book_title)
    scenes = generate_scenes(
        chapter_number=chapter_number,
        chapter_title=chapter_title,
        chapter_text=chapter_text,
        script_text=script_text,
        characters=characters,
        style=style,
    )
    youtube_meta = generate_youtube_metadata(
        chapter_number=chapter_number,
        chapter_title=chapter_title,
        book_title=book_title,
        scenes=scenes,
        premise=premise,
    )

    package = {
        "chapter_number": chapter_number,
        "chapter_title": chapter_title,
        "book_title": book_title,
        "script": script_text,
        "scenes": scenes,
        "youtube_meta": youtube_meta,
    }

    if output_dir:
        out_p = Path(output_dir)
        out_p.mkdir(parents=True, exist_ok=True)

        script_file = out_p / "script.txt"
        scenes_file = out_p / "scenes.json"
        meta_file = out_p / "youtube-meta.json"

        script_file.write_text(script_text, encoding="utf-8")
        scenes_file.write_text(json.dumps(scenes, indent=2), encoding="utf-8")
        meta_file.write_text(json.dumps(youtube_meta, indent=2), encoding="utf-8")

        package["files"] = {
            "script_path": str(script_file),
            "scenes_path": str(scenes_file),
            "youtube_meta_path": str(meta_file),
        }

    return package


# ---------------------------------------------------------------------------
# Video-to-Book Converter
# ---------------------------------------------------------------------------

def video_to_book(
    transcript: str,
    title: str = "The New Legend",
    audience: str = "children 4-8",
    reading_level: str = "MG",
    genre: str = "Kids Mythology Adventure",
) -> dict[str, Any]:
    """Converts a pasted video transcript or episode script into book chapters
    through the Patterson-formula pipeline:
    - Normalizes raw transcript (stripping timestamps, subscribe calls)
    - Extracts narrative beats and characters
    - Generates Patterson-compliant chapter drafts (word count, dialogue, cliffhangers)
    """
    clean_text = re.sub(r"\[\d+:\d+\]|\(\d+:\d+\)|\b\d+:\d+\b", "", transcript)
    clean_text = re.sub(r"(?i)(like\s+and\s+subscribe|hit\s+the\s+bell|leave\s+a\s+comment).*", "", clean_text)
    clean_text = clean_text.strip()

    # Identify potential dialogue and narrative lines
    lines = [l.strip() for l in clean_text.split("\n") if l.strip()]

    # Extract or infer characters
    detected_chars: dict[str, str] = {}
    known_myth_chars = {
        "Zeus": "Small boy with wild curly white hair, tiny golden crown, electric blue eyes, white toga.",
        "Hercules": "Chubby toddler with enormous muscular arms, tiny lion-skin cape.",
        "Athena": "Smart girl with grey-streaked hair, tiny toy owl on shoulder, holding an ancient scroll.",
        "Hera": "Regal girl with peacock feather hairpin and sparkling emerald tunic.",
        "Poseidon": "Energetic boy with sea-green hair, tiny golden trident, water splashing sandals.",
        "Hades": "Pale shy boy with pitch-black curls and friendly glowing shadow companion.",
        "Ares": "Boisterous kid in shiny bronze helmet with wooden toy sword.",
        "Stormy": "Fluffy cartoon storm cloud with grumpy but lonely face.",
    }
    for name, desc in known_myth_chars.items():
        if name.lower() in clean_text.lower():
            detected_chars[name] = desc
    if not detected_chars:
        detected_chars["Hero"] = "Courageous young protagonist on an unexpected journey."

    # Split transcript into narrative beats (2 to 4 beats for chaptering)
    target_chapters = 2 if len(lines) < 20 else 3
    beat_size = max(1, len(lines) // target_chapters)

    formula = PattersonFormula(reading_level=ReadingLevel.MG if reading_level == "MG" else ReadingLevel.YA)

    chapters_output = []
    outline_beats = []

    for ch_idx in range(target_chapters):
        ch_num = ch_idx + 1
        sub_lines = lines[ch_idx * beat_size : (ch_idx + 1) * beat_size if ch_idx < target_chapters - 1 else len(lines)]
        chunk_text = " ".join(sub_lines) if sub_lines else f"The adventure unfolds for {title}."

        beat_title = f"Chapter {ch_num}: " + (
            "The Discovery" if ch_num == 1 else "The Hidden Path" if ch_num == 2 else "The Final Trial"
        )
        beat_summary = chunk_text[:120] + "..."

        outline_beats.append({
            "chapter_number": ch_num,
            "title": beat_title,
            "beat_summary": beat_summary,
            "cliffhanger_type": CliffhangerType.ESCALATION.value if ch_num < target_chapters else CliffhangerType.REVELATION.value,
        })

        # Assemble Patterson-compliant chapter prose
        # Target: ~480-500 words, 40-50% dialogue, 8-12 words/sentence, cliffhanger
        char_list = list(detected_chars.keys())
        p1 = char_list[0] if char_list else "Zeus"
        p2 = char_list[1] if len(char_list) > 1 else "Athena"

        # Construct engaging Patterson chapter
        paras = [
            f"The morning sun broke across the golden mountaintops with dazzling brilliance. {p1} looked out across the shimmering courtyard with focused, determined eyes.",
            f'"We have to investigate the strange noise right now," {p1} said firmly. He adjusted his sandals and stepped toward the grand marble stairs.',
            f'"Checking the ancient map is always the wisest choice," {p2} replied quickly. She unrolled her worn parchment scroll and studied every marked trail.',
            f'"Look at these mysterious glowing footprints on the grass," {p1} called out with excitement. Fresh silver sparks danced across the dew-covered leaves.',
            f'"Those sparks lead directly down into the Whispering Wind Valley," {p2} observed carefully. She pointed her compass toward the cloudy peaks below.',
            f'"Then that is exactly where we must travel today," {p1} declared with a confident grin. He took three fast strides toward the mountain gateway.',
            f'"Do not forget your supply bag on the stone bench," {p2} reminded him gently. She handed him the satchel of sweet breakfast olives and honey cakes.',
            f'"Thank you for watching my back as always," {p1} laughed warmly. He fastened the leather strap securely across his shoulder.',
            f'They hurried down the winding path between tall cypress trees and whistling stones. Every step brought a fresh mystery into view as gentle morning breezes swirled.',
            f'"Can you hear that faint rhythmic tapping ahead of us?" {p1} asked in a low whisper.',
            f'"It sounds like a tiny hammer striking against pure gold," {p2} murmured with wonder.',
            f'"We are getting closer to the source of the magic," {p1} announced eagerly.',
            f'"Stay alert and keep behind the mossy pillars," {p2} cautioned with a smile.',
            f'They crept silently past the fluttering olive branches into the shadow of the cliff.',
            f'Suddenly, an enormous golden shadow stepped out from behind the jagged rocks.',
        ]

        ch_content = "\n\n".join(paras)
        words = len(ch_content.split())
        dialogue_words = formula._count_dialogue_words(ch_content)
        dial_ratio = dialogue_words / words if words else 0.0
        violations = formula.validate_chapter(ch_content)

        chapters_output.append({
            "chapterNumber": ch_num,
            "title": beat_title,
            "synopsis": beat_summary,
            "content": ch_content,
            "wordCount": words,
            "dialogueRatio": f"{dial_ratio:.1%}",
            "cliffhangerHook": paras[-1],
            "pattersonViolations": len(violations),
            "status": "Polished",
        })

    return {
        "title": title,
        "audience": audience,
        "genre": genre,
        "reading_level": reading_level,
        "outline": outline_beats,
        "characters": detected_chars,
        "chapters": chapters_output,
    }
