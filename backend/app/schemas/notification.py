from pydantic import BaseModel, ConfigDict
from datetime import datetime

class NotificationInDB(BaseModel):
    NotificationID: int
    UserID: int
    Title: str
    Message: str
    IsRead: bool
    CreatedAt: datetime
    model_config = ConfigDict(from_attributes=True)