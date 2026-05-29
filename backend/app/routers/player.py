from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Drama, Episode, HighlightEvent
from ..schemas import PlayerDrama, PlayerEpisode, PlayerEpisodeSummary, PlayerHighlight
from ..services.video_service import local_video_path, player_video_url
from .common import ok

router = APIRouter()


@router.get("/player/dramas")
def player_dramas(db: Session = Depends(get_db)):
    dramas = db.query(Drama).filter(Drama.status == "active").order_by(Drama.id.desc()).all()
    return ok(
        [
            PlayerDrama(
                drama_id=item.id,
                title=item.title,
                description=item.description,
                cover_url=item.cover_url,
            ).model_dump()
            for item in dramas
        ]
    )


@router.get("/player/dramas/{drama_id}/episodes")
def player_episode_summaries(drama_id: int, db: Session = Depends(get_db)):
    if not db.get(Drama, drama_id):
        raise HTTPException(status_code=404, detail="drama not found")
    rows = (
        db.query(Episode, func.count(HighlightEvent.id))
        .outerjoin(
            HighlightEvent,
            (HighlightEvent.episode_id == Episode.id) & (HighlightEvent.status == "published"),
        )
        .filter(Episode.drama_id == drama_id)
        .group_by(Episode.id)
        .order_by(Episode.episode_no.asc(), Episode.id.asc())
        .all()
    )
    return ok(
        [
            PlayerEpisodeSummary(
                episode_id=episode.id,
                drama_id=episode.drama_id,
                episode_no=episode.episode_no,
                title=episode.title,
                duration=episode.duration,
                published_highlight_count=published_count,
            ).model_dump()
            for episode, published_count in rows
        ]
    )


@router.get("/player/episodes/{episode_id}/video", name="player_episode_video")
def player_episode_video(episode_id: int, db: Session = Depends(get_db)):
    episode = db.get(Episode, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="episode not found")
    path = local_video_path(episode.video_url)
    if not path:
        raise HTTPException(status_code=404, detail="local video file not found")
    return FileResponse(path, media_type="video/mp4", filename=path.name)


@router.get("/player/episodes/{episode_id}", response_model=dict)
def player_episode(episode_id: int, request: Request, db: Session = Depends(get_db)):
    episode = db.get(Episode, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="episode not found")
    highlights = (
        db.query(HighlightEvent)
        .filter(HighlightEvent.episode_id == episode_id, HighlightEvent.status == "published")
        .order_by(HighlightEvent.start_time)
        .all()
    )
    data = PlayerEpisode(
        episode_id=episode.id,
        title=episode.title,
        video_url=player_video_url(episode, request),
        duration=episode.duration,
        highlights=[
            PlayerHighlight(
                highlight_id=item.id,
                start_time=item.start_time,
                end_time=item.end_time,
                highlight_type=item.highlight_type,
                emotion=item.emotion,
                intensity=item.intensity,
                trigger_score=item.trigger_score,
                button_text=item.button_text,
                effect=item.effect,
            )
            for item in highlights
        ],
    )
    return ok(data.model_dump())
