import json
import re
import urllib.request
from urllib.parse import parse_qs, urlparse

from fastapi import HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import CouldNotRetrieveTranscript


def extract_video_id(url: str) -> str:
    url = url.strip()
    if re.fullmatch(r"[\w-]{11}", url):
        return url

    parsed = urlparse(url)
    if parsed.hostname in ("youtu.be",):
        return parsed.path.lstrip("/")

    if parsed.hostname and "youtube.com" in parsed.hostname:
        if parsed.path == "/watch":
            video_id = parse_qs(parsed.query).get("v", [None])[0]
            if video_id:
                return video_id
        match = re.search(r"/(embed|shorts|live)/([\w-]{11})", parsed.path)
        if match:
            return match.group(2)

    raise HTTPException(status_code=400, detail="Could not extract a video id from that URL")


def fetch_title(url: str, video_id: str) -> str:
    try:
        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        with urllib.request.urlopen(oembed_url, timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))
            return data.get("title") or video_id
    except Exception:
        return video_id


def fetch_transcript(video_id: str) -> str:
    try:
        fetched = YouTubeTranscriptApi().fetch(video_id)
    except CouldNotRetrieveTranscript as exc:
        raise HTTPException(status_code=422, detail=f"No transcript available for this video: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Failed to fetch transcript: {exc}") from exc

    text = " ".join(snippet.text for snippet in fetched)
    if not text.strip():
        raise HTTPException(status_code=422, detail="Transcript for this video is empty")
    return text
