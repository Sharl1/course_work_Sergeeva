from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class UserSimpleReview(BaseModel):
    FirstName: str
    LastName: str
    class Config: from_attributes = True

class ServiceSimpleReview(BaseModel):
    ServiceName: str
    class Config: from_attributes = True

class ReviewCreate(BaseModel):
    ServiceID: int
    Rating: int = Field(..., ge=1, le=5)
    Comment: Optional[str] = None

class ReviewInDB(BaseModel):
    ReviewID: int
    Rating: int
    Comment: Optional[str]
    CreatedAt: datetime
    user: UserSimpleReview
    service: ServiceSimpleReview
    model_config = ConfigDict(from_attributes=True)