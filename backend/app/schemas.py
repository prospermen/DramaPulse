from pydantic import BaseModel, Field


HIGHLIGHT_TYPES = {"conflict", "reversal", "sweet", "satisfying", "suspense"}
HIGHLIGHT_STATUSES = {"draft", "published", "rejected", "archived"}
ACTION_TYPES = {"impression", "click", "ignore"}


class DramaCreate(BaseModel):
    title: str
    description: str = ""
    cover_url: str = ""


class DramaOut(DramaCreate):
    id: int
    status: str

    class Config:
        from_attributes = True


class EpisodeCreate(BaseModel):
    drama_id: int
    episode_no: int = 1
    title: str
    video_url: str
    subtitle_url: str = ""
    subtitle_content: str = ""
    duration: float = 0


class EpisodeOut(EpisodeCreate):
    id: int
    analyze_status: str
    analyze_error: str = ""

    class Config:
        from_attributes = True


class AnalyzeRequest(BaseModel):
    force_reanalyze: bool = False


class HighlightUpdate(BaseModel):
    start_time: float | None = None
    end_time: float | None = None
    highlight_type: str | None = None
    emotion: str | None = None
    intensity: float | None = Field(default=None, ge=0, le=1)
    confidence: float | None = Field(default=None, ge=0, le=1)
    trigger_score: float | None = Field(default=None, ge=0, le=1)
    reason: str | None = None
    button_text: str | None = None
    effect: str | None = None
    status: str | None = None


class HighlightOut(BaseModel):
    id: int
    episode_id: int
    start_time: float
    end_time: float
    highlight_type: str
    emotion: str
    intensity: float
    confidence: float
    trigger_score: float
    reason: str
    button_text: str
    effect: str
    status: str

    class Config:
        from_attributes = True


class PlayerHighlight(BaseModel):
    highlight_id: int
    start_time: float
    end_time: float
    highlight_type: str
    emotion: str
    intensity: float
    trigger_score: float
    button_text: str
    effect: str


class PlayerDrama(BaseModel):
    drama_id: int
    title: str
    description: str
    cover_url: str


class PlayerEpisodeSummary(BaseModel):
    episode_id: int
    drama_id: int
    episode_no: int
    title: str
    duration: float
    published_highlight_count: int


class PlayerEpisode(BaseModel):
    episode_id: int
    title: str
    video_url: str
    duration: float
    highlights: list[PlayerHighlight]


class InteractionCreate(BaseModel):
    user_id: str
    episode_id: int
    highlight_id: int
    action_type: str
    action_value: str = ""
    watch_time: float = 0
    idempotency_key: str
