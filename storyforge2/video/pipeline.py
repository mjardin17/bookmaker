"""
storyforge2/video/pipeline.py — 3-Tier Free AI Video Engine.

Every chapter video tries the tiers in order and falls back automatically,
so a video ALWAYS comes out:

Tier 1 (primary AI): Hugging Face ZeroGPU Gradio Space running Wan 2.2 or LTX-Video.
       Calls Gradio API (POST /gradio_api/call/predict, then polls for completion).
       Falls through to Tier 2 on timeout, 429 quota, or missing URL.

Tier 2 (overflow AI): NovAI $0 API (cogvideox-flash text-to-video, no credit card, 5/day).
       Async REST call returning an MP4 URL.
       Falls through to Tier 3 on failure, daily cap, or missing key.

Tier 3 (guaranteed fallback): Code-rendered video — ffmpeg Ken Burns slow zoom
       over chapter illustrations + edge-tts voiceover reading narration script +
       burned-in captions. CPU-only, $0 forever, zero external dependencies.

Unified Entry Point:
    render_chapter_video(...) -> VideoRenderResult
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import shutil
import subprocess
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Optional

import requests

try:
    import edge_tts
except ImportError:
    edge_tts = None


@dataclass
class VideoRenderResult:
    status: str  # "success" | "failed"
    tier_used: str  # "tier1_hf_zerogpu" | "tier2_novai" | "tier3_kenburns_edgetts"
    tier_name: str
    output_mp4: str
    duration_seconds: float
    has_audio: bool
    has_captions: bool
    tier_logs: list[str]
    metadata: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


# ---------------------------------------------------------------------------
# Tier 1: Hugging Face ZeroGPU Gradio Space (Wan 2.2 / LTX-Video)
# ---------------------------------------------------------------------------

def _try_tier1_hf_zerogpu(
    prompt: str,
    output_path: Path,
    logs: list[str],
    space_url: Optional[str] = None,
    hf_token: Optional[str] = None,
    timeout_seconds: int = 45,
) -> bool:
    """Attempts video generation via a user-hosted Hugging Face ZeroGPU Space running
    Wan 2.2 or LTX-Video via Gradio API (/gradio_api/call/predict).
    Falls back gracefully if not configured, queue times out, or quota exhausted.
    """
    url = (space_url or os.environ.get("HF_SPACE_URL", "")).strip().rstrip("/")
    token = hf_token or os.environ.get("HF_TOKEN", "")

    if not url:
        logs.append("[TIER 1 HF ZeroGPU] Skipped: No HF_SPACE_URL configured in environment (needs user setup).")
        return False

    logs.append(f"[TIER 1 HF ZeroGPU] Calling Gradio Space at {url}...")
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        # 1. Post prediction job to Gradio endpoint
        call_url = f"{url}/gradio_api/call/predict"
        payload = {
            "data": [
                prompt,
                "low quality, blurry, distorted, artifacts",  # negative prompt
                6.0,   # guidance scale
                25,    # num steps
                42,    # seed
            ]
        }
        res = requests.post(call_url, json=payload, headers=headers, timeout=15)
        if res.status_code != 200:
            logs.append(f"[TIER 1 HF ZeroGPU] Error: HTTP {res.status_code} ({res.text[:150]})")
            return False

        event_id = res.json().get("event_id")
        if not event_id:
            logs.append("[TIER 1 HF ZeroGPU] Error: No event_id returned by Gradio Space.")
            return False

        # 2. Poll for completion via Server-Sent Events / stream endpoint
        poll_url = f"{url}/gradio_api/call/predict/{event_id}"
        start_time = time.time()
        video_url = None

        while time.time() - start_time < timeout_seconds:
            poll_res = requests.get(poll_url, headers=headers, timeout=10)
            if poll_res.status_code == 200:
                lines = poll_res.text.strip().split("\n")
                for line in lines:
                    if line.startswith("data:"):
                        try:
                            data = json.loads(line[5:].strip())
                            if isinstance(data, list) and len(data) > 0:
                                item = data[0]
                                if isinstance(item, dict) and "url" in item:
                                    video_url = item["url"]
                                elif isinstance(item, str) and (item.endswith(".mp4") or item.startswith("http")):
                                    video_url = item
                        except Exception:
                            pass
                    if "event: complete" in line:
                        break
            if video_url:
                break
            time.sleep(2)

        if not video_url:
            logs.append(f"[TIER 1 HF ZeroGPU] Timed out after {timeout_seconds}s waiting for queue/generation.")
            return False

        # 3. Download generated MP4
        if not video_url.startswith("http"):
            video_url = f"{url}/file={video_url}"
        dl_res = requests.get(video_url, headers=headers, timeout=30)
        if dl_res.status_code == 200 and len(dl_res.content) > 10000:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(dl_res.content)
            logs.append(f"[TIER 1 HF ZeroGPU] Success: Video saved ({len(dl_res.content)} bytes).")
            return True
        else:
            logs.append("[TIER 1 HF ZeroGPU] Failed to download MP4 from Space.")
            return False

    except Exception as e:
        logs.append(f"[TIER 1 HF ZeroGPU] Exception during generation: {e}")
        return False


# ---------------------------------------------------------------------------
# Tier 2: NovAI $0 API (cogvideox-flash text-to-video)
# ---------------------------------------------------------------------------

def _try_tier2_novai(
    prompt: str,
    output_path: Path,
    logs: list[str],
    api_key: Optional[str] = None,
    timeout_seconds: int = 40,
) -> bool:
    """Attempts video generation using NovAI's $0 API (cogvideox-flash model,
    5 free videos per day, no credit card required).
    Falls back gracefully if not configured, daily cap reached, or network fails.
    """
    key = (api_key or os.environ.get("NOVAI_API_KEY", "")).strip()

    if not key:
        logs.append("[TIER 2 NovAI] Skipped: No NOVAI_API_KEY configured in environment (needs user key).")
        return False

    logs.append("[TIER 2 NovAI] Requesting video generation from NovAI (cogvideox-flash, free tier)...")
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "cogvideox-flash",
        "prompt": prompt,
        "aspect_ratio": "16:9",
        "duration": 5,
    }

    try:
        # 1. Dispatch asynchronous video generation job
        res = requests.post("https://api.novai.io/v1/video/generations", json=payload, headers=headers, timeout=15)
        if res.status_code == 429:
            logs.append("[TIER 2 NovAI] Rate limit or daily free cap (5 videos/day) reached. Falling through to Tier 3.")
            return False
        if res.status_code != 200:
            logs.append(f"[TIER 2 NovAI] API returned status {res.status_code}: {res.text[:150]}")
            return False

        task_id = res.json().get("id") or res.json().get("task_id")
        if not task_id:
            logs.append("[TIER 2 NovAI] No task_id in response.")
            return False

        # 2. Poll for video completion
        poll_url = f"https://api.novai.io/v1/video/generations/{task_id}"
        start_time = time.time()
        video_url = None

        while time.time() - start_time < timeout_seconds:
            poll_res = requests.get(poll_url, headers=headers, timeout=10)
            if poll_res.status_code == 200:
                data = poll_res.json()
                status = data.get("status")
                if status == "succeeded" or status == "completed":
                    video_url = data.get("output", {}).get("url") or data.get("url")
                    break
                elif status in ("failed", "error"):
                    logs.append(f"[TIER 2 NovAI] Task failed: {data.get('error', 'unknown error')}")
                    return False
            time.sleep(3)

        if not video_url:
            logs.append(f"[TIER 2 NovAI] Task did not finish within {timeout_seconds}s timeout.")
            return False

        # 3. Download MP4
        dl_res = requests.get(video_url, timeout=30)
        if dl_res.status_code == 200 and len(dl_res.content) > 10000:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(dl_res.content)
            logs.append(f"[TIER 2 NovAI] Success: Video downloaded from {video_url} ({len(dl_res.content)} bytes).")
            return True
        else:
            logs.append("[TIER 2 NovAI] Failed downloading MP4.")
            return False

    except Exception as e:
        logs.append(f"[TIER 2 NovAI] Exception: {e}")
        return False


# ---------------------------------------------------------------------------
# Tier 3: Guaranteed Fallback (Ken Burns + edge-tts + Burned-in Captions)
# ---------------------------------------------------------------------------

def _ticks_to_srt_time(ticks: int) -> str:
    """Convert edge-tts 100ns ticks to SRT time format HH:MM:SS,mmm."""
    total_seconds = ticks / 10_000_000.0
    hrs = int(total_seconds // 3600)
    mins = int((total_seconds % 3600) // 60)
    secs = int(total_seconds % 60)
    millis = int((total_seconds - int(total_seconds)) * 1000)
    return f"{hrs:02d}:{mins:02d}:{secs:02d},{millis:03d}"


async def _generate_edgetts_audio_and_srt(
    clean_text: str,
    audio_path: Path,
    srt_path: Path,
    voice: str = "en-US-GuyNeural",
) -> float:
    """Uses edge-tts to synthesize spoken audio and extract sentence-level subtitles.
    Returns estimated total duration in seconds.
    """
    communicate = edge_tts.Communicate(clean_text, voice=voice)

    srt_entries = []
    entry_idx = 1
    max_ticks = 0

    with open(audio_path, "wb") as audio_file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_file.write(chunk["data"])
            elif chunk["type"] == "SentenceBoundary":
                offset = chunk.get("offset", 0)
                dur = chunk.get("duration", 0)
                sentence_text = chunk.get("text", "").strip()
                if sentence_text:
                    start_str = _ticks_to_srt_time(offset)
                    end_str = _ticks_to_srt_time(offset + dur)
                    srt_entries.append(f"{entry_idx}\n{start_str} --> {end_str}\n{sentence_text}\n\n")
                    entry_idx += 1
                    max_ticks = max(max_ticks, offset + dur)

    # If sentence boundaries weren't emitted, generate fallback SRT
    if not srt_entries and clean_text:
        words = clean_text.split()
        dur_est = max(3.0, len(words) * 0.45)
        srt_entries.append(f"1\n00:00:00,100 --> {_ticks_to_srt_time(int(dur_est * 10_000_000))}\n{clean_text[:80]}...\n\n")

    srt_path.write_text("".join(srt_entries), encoding="utf-8")
    duration_seconds = max_ticks / 10_000_000.0 if max_ticks > 0 else 5.0
    return duration_seconds


def _clean_narration_for_speech(script_text: str) -> str:
    """Removes script direction brackets e.g. [PAUSE 1.0s], [EXCITED], [VOICEOVER...]
    so edge-tts synthesizes clean human prose while maintaining conversational flow.
    """
    cleaned = re.sub(r"\[.*?\]", "", script_text)
    # Remove metadata headers
    lines = [l.strip() for l in cleaned.splitlines() if l.strip()]
    return " ".join(lines)


def _render_tier3_kenburns_video(
    image_paths: list[Path],
    audio_path: Path,
    srt_path: Path,
    output_mp4: Path,
    duration_seconds: float,
    logs: list[str],
) -> bool:
    """Renders a cinematic video using ffmpeg:
    - Ken Burns slow pan/zoom over the chapter art
    - Synchronized voiceover audio track (AAC)
    - High-visibility burned-in captions with styling
    """
    logs.append(f"[TIER 3 Ken Burns] Rendering {duration_seconds:.1f}s video with ffmpeg...")

    # Choose primary illustration
    valid_images = [p for p in image_paths if p.exists() and p.stat().st_size > 0]
    if not valid_images:
        logs.append("[TIER 3 Ken Burns] Error: No illustration images found for video background.")
        return False

    bg_img = valid_images[0]
    logs.append(f"[TIER 3 Ken Burns] Using background illustration: {bg_img.name}")

    # Calculate frame duration for zoompan
    fps = 25
    total_frames = int(max(10, duration_seconds) * fps) + fps

    # Escape subtitle path for ffmpeg filter syntax
    srt_escaped = str(srt_path).replace("\\", "/").replace(":", "\\:")

    filter_complex = (
        f"zoompan=z='min(zoom+0.0008,1.20)':d={total_frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps={fps},"
        f"subtitles='{srt_escaped}':force_style='FontSize=19,FontName=Arial,PrimaryColour=&H00FFFF&,OutlineColour=&H000000&,BorderStyle=3,Outline=2,MarginV=35'"
    )

    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", str(bg_img),
        "-i", str(audio_path),
        "-vf", filter_complex,
        "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "128k",
        "-shortest",
        str(output_mp4),
    ]

    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if proc.returncode == 0 and output_mp4.exists() and output_mp4.stat().st_size > 10000:
            logs.append(f"[TIER 3 Ken Burns] Success: Output MP4 created ({output_mp4.stat().st_size // 1024} KB).")
            return True
        else:
            logs.append(f"[TIER 3 Ken Burns] FFmpeg failed: {proc.stderr[-300:]}")
            return False
    except Exception as e:
        logs.append(f"[TIER 3 Ken Burns] FFmpeg execution error: {e}")
        return False


# ---------------------------------------------------------------------------
# Unified Video Service: Single render_chapter_video Function
# ---------------------------------------------------------------------------

def render_chapter_video(
    chapter_num: int,
    chapter_title: str,
    script_text: str,
    scenes: list[dict[str, Any]],
    illustration_paths: list[Path | str],
    output_dir: Path | str,
    voice: str = "en-US-GuyNeural",
    hf_space_url: Optional[str] = None,
    novai_api_key: Optional[str] = None,
) -> VideoRenderResult:
    """Unified entry point for the 3-Tier Free Video Engine.
    Tries Tier 1 (HF ZeroGPU) -> Tier 2 (NovAI) -> Tier 3 (Ken Burns + edge-tts).
    Hides all tier logic from the rest of the application so a video ALWAYS comes out.
    """
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    output_mp4 = out_dir / f"chapter_{chapter_num}_video.mp4"
    logs: list[str] = []

    # Prepare visual prompt from scene 1 or chapter
    visual_prompt = (
        scenes[0].get("illustration_prompt") if scenes else f"Cinematic scene of {chapter_title}"
    )

    norm_images = [Path(p) for p in illustration_paths if p]

    # --- Tier 1 Attempt ---
    tier1_ok = _try_tier1_hf_zerogpu(
        prompt=visual_prompt,
        output_path=output_mp4,
        logs=logs,
        space_url=hf_space_url,
    )
    if tier1_ok:
        return VideoRenderResult(
            status="success",
            tier_used="tier1_hf_zerogpu",
            tier_name="Tier 1: Hugging Face ZeroGPU Space (Wan 2.2 / LTX-Video)",
            output_mp4=str(output_mp4),
            duration_seconds=6.0,
            has_audio=False,
            has_captions=False,
            tier_logs=logs,
            metadata={"chapter_num": chapter_num, "chapter_title": chapter_title},
        )

    # --- Tier 2 Attempt ---
    tier2_ok = _try_tier2_novai(
        prompt=visual_prompt,
        output_path=output_mp4,
        logs=logs,
        api_key=novai_api_key,
    )
    if tier2_ok:
        return VideoRenderResult(
            status="success",
            tier_used="tier2_novai",
            tier_name="Tier 2: NovAI Free API (CogVideoX-Flash, 5/day)",
            output_mp4=str(output_mp4),
            duration_seconds=5.0,
            has_audio=False,
            has_captions=False,
            tier_logs=logs,
            metadata={"chapter_num": chapter_num, "chapter_title": chapter_title},
        )

    # --- Tier 3 Guaranteed Fallback ---
    logs.append("[TIER 3 FALLBACK] Executing guaranteed local render (edge-tts + Ken Burns + burned-in captions)...")

    clean_speech_text = _clean_narration_for_speech(script_text)
    # If script is very long, use the opening and key scene narration for children's video sample
    if len(clean_speech_text.split()) > 200:
        words = clean_speech_text.split()[:160]
        clean_speech_text = " ".join(words) + "... To be continued in Chapter 2!"

    audio_file = out_dir / "narration.mp3"
    srt_file = out_dir / "captions.srt"

    # Generate edge-tts audio and timestamps
    dur_sec = asyncio.run(_generate_edgetts_audio_and_srt(clean_speech_text, audio_file, srt_file, voice=voice))
    logs.append(f"[TIER 3 Edge-TTS] Voiceover generated: {audio_file.name} ({dur_sec:.1f}s, voice={voice})")

    tier3_ok = _render_tier3_kenburns_video(
        image_paths=norm_images,
        audio_path=audio_file,
        srt_path=srt_file,
        output_mp4=output_mp4,
        duration_seconds=dur_sec,
        logs=logs,
    )

    if tier3_ok:
        return VideoRenderResult(
            status="success",
            tier_used="tier3_kenburns_edgetts",
            tier_name="Tier 3: Guaranteed Local Fallback (Ken Burns Zoom + Edge-TTS + Captions)",
            output_mp4=str(output_mp4),
            duration_seconds=dur_sec,
            has_audio=True,
            has_captions=True,
            tier_logs=logs,
            metadata={
                "chapter_num": chapter_num,
                "chapter_title": chapter_title,
                "audio_path": str(audio_file),
                "captions_path": str(srt_file),
            },
        )

    logs.append("[ERROR] All three tiers failed to produce video.")
    return VideoRenderResult(
        status="failed",
        tier_used="none",
        tier_name="None",
        output_mp4="",
        duration_seconds=0.0,
        has_audio=False,
        has_captions=False,
        tier_logs=logs,
        metadata={},
    )
