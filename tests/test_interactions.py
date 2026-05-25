from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.models import Episode, HighlightEvent, UserInteractionLog


def _published_highlight(db_session: Session, episode: Episode) -> HighlightEvent:
    return (
        db_session.query(HighlightEvent)
        .filter(HighlightEvent.episode_id == episode.id, HighlightEvent.status == "published")
        .one()
    )


def test_duplicate_idempotency_key_does_not_write_twice(
    client: TestClient,
    db_session: Session,
    demo_episode: Episode,
) -> None:
    highlight = _published_highlight(db_session, demo_episode)
    payload = {
        "user_id": "user-1",
        "episode_id": demo_episode.id,
        "highlight_id": highlight.id,
        "action_type": "click",
        "action_value": "反转了",
        "watch_time": 3.2,
        "idempotency_key": "same-key",
    }

    first = client.post("/api/interactions", json=payload)
    second = client.post("/api/interactions", json=payload)

    assert first.status_code == 200
    assert first.json()["message"] == "interaction recorded"
    assert second.status_code == 200
    assert second.json()["message"] == "duplicate interaction ignored"
    assert db_session.query(UserInteractionLog).count() == 1


def test_interaction_rejects_illegal_action_type(client: TestClient, demo_episode: Episode, db_session: Session) -> None:
    highlight = _published_highlight(db_session, demo_episode)
    response = client.post(
        "/api/interactions",
        json={
            "user_id": "user-1",
            "episode_id": demo_episode.id,
            "highlight_id": highlight.id,
            "action_type": "share",
            "idempotency_key": "bad-action",
        },
    )

    assert response.status_code == 400
