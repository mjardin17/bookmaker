"""
storyforge2/video — Video generation, chapter bridging, and commercial engine.
"""

from storyforge2.video.pipeline import render_chapter_video, VideoRenderResult
from storyforge2.video.bridge import (
    chapter_to_video_package,
    video_to_book,
    adapt_prose_to_spoken_script,
    generate_scenes,
    generate_youtube_metadata,
)

__all__ = [
    "render_chapter_video",
    "VideoRenderResult",
    "chapter_to_video_package",
    "video_to_book",
    "adapt_prose_to_spoken_script",
    "generate_scenes",
    "generate_youtube_metadata",
]
