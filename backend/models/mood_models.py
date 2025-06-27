from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class MoodCheckIn(BaseModel):
    mood_score: int = Field(..., ge=1, le=10)
    timestamp: datetime = datetime.utcnow()

class CopingToolRequest(BaseModel):
    tool_type: str