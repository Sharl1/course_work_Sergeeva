from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

class UserSimpleForChat(BaseModel):
    UserID: int
    FirstName: str
    LastName: str
    Email: str
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    Content: str

class MessageInDB(BaseModel):
    MessageID: int
    ChatID: int
    SenderID: int
    Content: str
    SentAt: datetime
    sender: UserSimpleForChat
    model_config = ConfigDict(from_attributes=True)

class ChatInDB(BaseModel):
    ChatID: int
    ClientID: int
    StaffID: Optional[int] = None
    CreatedAt: datetime
    model_config = ConfigDict(from_attributes=True)

# НОВАЯ СХЕМА ДЛЯ СПИСКА ЧАТОВ
class ChatWithClient(ChatInDB):
    client: UserSimpleForChat
    messages: List[MessageInDB] = [] # Добавим сообщения, чтобы показывать превью последнего