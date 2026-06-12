from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []

class SearchQuery(BaseModel):
    artist: str
    track_name: str

class RecommendationList(BaseModel):
    tracks: list[SearchQuery]