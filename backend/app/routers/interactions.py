from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import HighlightEvent, UserInteractionLog
from ..schemas import ACTION_TYPES, InteractionCreate
from .common import ok

router = APIRouter()


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
