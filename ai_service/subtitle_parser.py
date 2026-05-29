import re
from dataclasses import dataclass


@dataclass
class SubtitleCue:
    start_time: float
    end_time: float
    text: str


def _parse_timestamp(raw: str) -> float:
    raw = raw.strip().replace(",", ".")
    parts = raw.split(":")
    if len(parts) != 3:
        raise ValueError(f"invalid timestamp: {raw}")
    hours, minutes, seconds = parts
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


def parse_subtitle_text(content: str) -> list[SubtitleCue]:
    if not content or not content.strip():
        raise ValueError("subtitle content is empty")
    normalized = content.replace("\r\n", "\n").replace("\r", "\n")
    blocks = re.split(r"\n\s*\n", normalized.strip())
    cues: list[SubtitleCue] = []
    for block in blocks:
        lines = [line.strip() for line in block.split("\n") if line.strip()]
        time_index = next((idx for idx, line in enumerate(lines) if "-->" in line), -1)
        if time_index < 0:
            continue
        start_raw, end_raw = [part.strip() for part in lines[time_index].split("-->", 1)]
        text = " ".join(lines[time_index + 1 :]).strip()
        if not text:
            continue
        cues.append(SubtitleCue(start_time=_parse_timestamp(start_raw), end_time=_parse_timestamp(end_raw), text=text))
    if not cues:
        raise ValueError("no subtitle cues parsed")
    return cues
