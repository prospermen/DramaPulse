import sys
from pathlib import Path
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import Drama, Episode, HighlightEvent, InteractionTemplate, UserInteractionLog
from ..schemas import (
    ACTION_TYPES,
    HIGHLIGHT_STATUSES,
    HIGHLIGHT_TYPES,
    AnalyzeRequest,
    DramaCreate,
    DramaOut,
    EpisodeCreate,
    EpisodeOut,
    HighlightOut,
    HighlightUpdate,
    InteractionCreate,
    PlayerEpisode,
    PlayerDrama,
    PlayerEpisodeSummary,
    PlayerHighlight,
)

router = APIRouter(prefix="/api")


def require_admin(x_admin_token: str | None = Header(default=None)):
    if x_admin_token != settings.admin_token:
        raise HTTPException(status_code=403, detail="invalid admin token")


def ok(data=None, message="ok"):
    return {"success": True, "message": message, "data": data}


def default_template(highlight_type: str) -> tuple[str, str]:
    templates = {
        "conflict": ("替她反击", "anger_bar"),
        "reversal": ("反转了", "screen_flash"),
        "sweet": ("磕到了", "heart_rain"),
        "satisfying": ("爽", "boom_effect"),
        "suspense": ("快更", "countdown"),
    }
    return templates.get(highlight_type, ("我有感觉", "screen_flash"))


def validate_highlight_payload(item: dict):
    highlight_type = item.get("highlight_type")
    if highlight_type not in HIGHLIGHT_TYPES:
        raise ValueError(f"illegal highlight_type: {highlight_type}")
    if float(item.get("start_time", -1)) >= float(item.get("end_time", -1)):
        raise ValueError("start_time must be less than end_time")
    for field in ("intensity", "confidence", "trigger_score"):
        value = float(item.get(field, 0.5))
        if value < 0 or value > 1:
            raise ValueError(f"{field} must be between 0 and 1")


def _is_remote_url(value: str) -> bool:
    scheme = urlparse(value).scheme.lower()
    return scheme in {"http", "https"}


def _local_video_path(value: str) -> Path | None:
    if not value:
        return None
    direct_path = Path(value)
    if direct_path.exists():
        return direct_path
    parsed = urlparse(value)
    if parsed.scheme and parsed.scheme.lower() not in {"file"}:
        return None
    path_value = parsed.path if parsed.scheme.lower() == "file" else value
    parsed_path = Path(path_value)
    return parsed_path if parsed_path.exists() else None


def _player_video_url(episode: Episode, request: Request) -> str:
    if _is_remote_url(episode.video_url):
        return episode.video_url
    if _local_video_path(episode.video_url):
        return str(request.url_for("player_episode_video", episode_id=episode.id))
    return episode.video_url


@router.get("/dramas")
def list_dramas(db: Session = Depends(get_db)):
    return ok([DramaOut.model_validate(item).model_dump() for item in db.query(Drama).order_by(Drama.id.desc()).all()])


@router.post("/dramas", dependencies=[Depends(require_admin)])
def create_drama(payload: DramaCreate, db: Session = Depends(get_db)):
    drama = Drama(**payload.model_dump())
    db.add(drama)
    db.commit()
    db.refresh(drama)
    return ok(DramaOut.model_validate(drama).model_dump(), "drama created")


@router.get("/episodes")
def list_episodes(drama_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Episode)
    if drama_id:
        query = query.filter(Episode.drama_id == drama_id)
    episodes = query.order_by(Episode.id.desc()).all()
    return ok([EpisodeOut.model_validate(item).model_dump() for item in episodes])


@router.post("/episodes", dependencies=[Depends(require_admin)])
def create_episode(payload: EpisodeCreate, db: Session = Depends(get_db)):
    if not db.get(Drama, payload.drama_id):
        raise HTTPException(status_code=404, detail="drama not found")
    episode = Episode(**payload.model_dump())
    db.add(episode)
    db.commit()
    db.refresh(episode)
    return ok(EpisodeOut.model_validate(episode).model_dump(), "episode created")


@router.post("/episodes/{episode_id}/analyze", dependencies=[Depends(require_admin)])
def analyze_episode(episode_id: int, payload: AnalyzeRequest | None = None, db: Session = Depends(get_db)):
    payload = payload or AnalyzeRequest()
    episode = db.get(Episode, episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="episode not found")
    if episode.analyze_status == "processing":
        raise HTTPException(status_code=409, detail="episode is already processing")
    existing = db.query(HighlightEvent).filter(HighlightEvent.episode_id == episode_id).count()
    if existing and episode.analyze_status == "success" and not payload.force_reanalyze:
        return ok({"highlight_count": existing}, "existing highlights returned")

    episode.analyze_status = "processing"
    episode.analyze_error = ""
    db.commit()

    try:
        repo_root = Path(__file__).resolve().parents[3]
        sys.path.insert(0, str(repo_root))
        from ai_service.highlight_analyzer import analyze_subtitle_text

        result = analyze_subtitle_text(episode.subtitle_content or episode.subtitle_url or "")
        if payload.force_reanalyze:
            db.query(HighlightEvent).filter(HighlightEvent.episode_id == episode_id).delete()
        created: list[HighlightEvent] = []
        for item in result["highlights"]:
            validate_highlight_payload(item)
            button_text = item.get("button_text")
            effect = item.get("effect")
            if not button_text or not effect:
                button_text, effect = default_template(item["highlight_type"])
            highlight = HighlightEvent(
                episode_id=episode_id,
                start_time=float(item["start_time"]),
                end_time=float(item["end_time"]),
                highlight_type=item["highlight_type"],
                emotion=item.get("emotion", ""),
                intensity=float(item.get("intensity", 0.5)),
                confidence=float(item.get("confidence", 0.5)),
                trigger_score=float(item.get("trigger_score", item.get("confidence", 0.5))),
                reason=item.get("reason", ""),
                button_text=button_text,
                effect=effect,
                status="draft",
            )
            db.add(highlight)
            created.append(highlight)
        if not created:
            raise ValueError("no valid highlight generated")
        episode.analyze_status = "success"
        db.commit()
        return ok(
            {
                "highlight_count": len(created),
                "provider": result.get("provider", "unknown"),
                "llm_error": result.get("llm_error", ""),
            },
            "analysis completed",
        )
    except Exception as exc:
        episode.analyze_status = "failed"
        episode.analyze_error = str(exc)
        db.commit()
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/episodes/{episode_id}/highlights")
def list_highlights(episode_id: int, db: Session = Depends(get_db)):
    highlights = db.query(HighlightEvent).filter(HighlightEvent.episode_id == episode_id).order_by(HighlightEvent.start_time).all()
    return ok([HighlightOut.model_validate(item).model_dump() for item in highlights])


@router.put("/highlights/{highlight_id}", dependencies=[Depends(require_admin)])
def update_highlight(highlight_id: int, payload: HighlightUpdate, db: Session = Depends(get_db)):
    highlight = db.get(HighlightEvent, highlight_id)
    if not highlight:
        raise HTTPException(status_code=404, detail="highlight not found")
    data = payload.model_dump(exclude_unset=True)
    if "highlight_type" in data and data["highlight_type"] not in HIGHLIGHT_TYPES:
        raise HTTPException(status_code=400, detail="illegal highlight_type")
    if "status" in data and data["status"] not in HIGHLIGHT_STATUSES:
        raise HTTPException(status_code=400, detail="illegal status")
    for key, value in data.items():
        setattr(highlight, key, value)
    if highlight.start_time >= highlight.end_time:
        raise HTTPException(status_code=400, detail="start_time must be less than end_time")
    db.commit()
    db.refresh(highlight)
    return ok(HighlightOut.model_validate(highlight).model_dump(), "highlight updated")


@router.post("/episodes/{episode_id}/highlights/publish", dependencies=[Depends(require_admin)])
def publish_highlights(episode_id: int, db: Session = Depends(get_db)):
    highlights = db.query(HighlightEvent).filter(HighlightEvent.episode_id == episode_id, HighlightEvent.status == "draft").all()
    for item in highlights:
        item.status = "published"
    db.commit()
    return ok({"published_count": len(highlights)}, "highlights published")


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
    path = _local_video_path(episode.video_url)
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
        video_url=_player_video_url(episode, request),
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


@router.post("/interactions")
def create_interaction(payload: InteractionCreate, db: Session = Depends(get_db)):
    if payload.action_type not in ACTION_TYPES:
        raise HTTPException(status_code=400, detail="illegal action_type")
    highlight = db.get(HighlightEvent, payload.highlight_id)
    if not highlight or highlight.episode_id != payload.episode_id:
        raise HTTPException(status_code=404, detail="highlight not found for episode")
    log = UserInteractionLog(**payload.model_dump())
    db.add(log)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return ok(None, "duplicate interaction ignored")
    return ok(None, "interaction recorded")


@router.get("/analytics/overview", dependencies=[Depends(require_admin)])
def analytics_overview(db: Session = Depends(get_db)):
    impression_count = db.query(UserInteractionLog).filter(UserInteractionLog.action_type == "impression").count()
    click_count = db.query(UserInteractionLog).filter(UserInteractionLog.action_type == "click").count()
    ignore_count = db.query(UserInteractionLog).filter(UserInteractionLog.action_type == "ignore").count()
    return ok(
        {
            "drama_count": db.query(Drama).count(),
            "episode_count": db.query(Episode).count(),
            "highlight_count": db.query(HighlightEvent).count(),
            "published_highlight_count": db.query(HighlightEvent).filter(HighlightEvent.status == "published").count(),
            "interaction_count": db.query(UserInteractionLog).count(),
            "click_count": click_count,
            "ignore_count": ignore_count,
            "avg_click_rate": round(click_count / impression_count, 4) if impression_count else 0,
        }
    )


@router.get("/analytics/highlight-types", dependencies=[Depends(require_admin)])
def highlight_types(db: Session = Depends(get_db)):
    rows = db.query(HighlightEvent.highlight_type, func.count(HighlightEvent.id)).group_by(HighlightEvent.highlight_type).all()
    return ok([{"highlight_type": item[0], "count": item[1]} for item in rows])


@router.get("/analytics/top-actions", dependencies=[Depends(require_admin)])
def top_actions(db: Session = Depends(get_db)):
    rows = (
        db.query(UserInteractionLog.action_value, func.count(UserInteractionLog.id))
        .filter(UserInteractionLog.action_type == "click")
        .group_by(UserInteractionLog.action_value)
        .order_by(func.count(UserInteractionLog.id).desc())
        .limit(10)
        .all()
    )
    return ok([{"action_value": item[0] or "unknown", "count": item[1]} for item in rows])


@router.post("/demo/seed", dependencies=[Depends(require_admin)])
def seed_demo(db: Session = Depends(get_db)):
    drama = db.query(Drama).first()
    if not drama:
        drama = Drama(title="逆光归来", description="演示用短剧，覆盖冲突、反转和爽点。", cover_url="")
        db.add(drama)
        db.flush()
    episode = db.query(Episode).filter(Episode.drama_id == drama.id).first()
    if not episode:
        episode = Episode(
            drama_id=drama.id,
            episode_no=1,
            title="第 1 集 真相浮出水面",
            video_url="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            duration=30,
            subtitle_content="1\n00:00:02,000 --> 00:00:05,000\n你竟敢羞辱她，今天我替她讨回公道。\n\n2\n00:00:08,000 --> 00:00:12,000\n所有人都以为他输了，可真正的身份终于曝光。\n\n3\n00:00:16,000 --> 00:00:20,000\n坏人终于被打脸，这一刻太爽了。\n",
        )
        db.add(episode)
    for highlight_type, button_text, effect in [
        ("conflict", "替她反击", "anger_bar"),
        ("reversal", "反转了", "screen_flash"),
        ("sweet", "磕到了", "heart_rain"),
        ("satisfying", "爽", "boom_effect"),
        ("suspense", "快更", "countdown"),
    ]:
        if not db.query(InteractionTemplate).filter(InteractionTemplate.highlight_type == highlight_type).first():
            db.add(InteractionTemplate(highlight_type=highlight_type, button_text=button_text, effect=effect))
    db.commit()
    return ok({"drama_id": drama.id, "episode_id": episode.id}, "demo data ready")
