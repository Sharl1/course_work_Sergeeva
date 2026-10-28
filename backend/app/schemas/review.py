from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class ReviewCreate(BaseModel):
    ServiceID: int
    Rating: int = Field(..., ge=1, le=5)
    Comment: Optional[str] = None

class ReviewInDB(BaseModel):
    ReviewID: int
    UserID: int
    ServiceID: int
    Rating: int
    Comment: Optional[str]
    CreatedAt: datetime
    model_config = ConfigDict(from_attributes=True)