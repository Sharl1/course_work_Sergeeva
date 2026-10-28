from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ServiceSimpleForRequest(BaseModel):
    ServiceName: str
    Price: float
    class Config:
        from_attributes = True

class UserSimpleForRequest(BaseModel):
    FirstName: str
    LastName: str
    Email: str
    Phone: Optional[str] = None
    class Config:
        from_attributes = True

class BookingSimpleForRequest(BaseModel):
    BookingDate: datetime
    service: ServiceSimpleForRequest
    user: UserSimpleForRequest # <--- Добавили сюда юзера!
    class Config:
        from_attributes = True

class StatusSchema(BaseModel):
    StatusName: str
    class Config:
        from_attributes = True

class RequestStatusUpdate(BaseModel):
    StatusName: str = Field(..., description="Новый статус: InProgress, Completed или Rejected")
    Comment: Optional[str] = Field(None, description="Комментарий сотрудника")

class RequestAssign(BaseModel):
    StaffID: Optional[int] = Field(None, description="ID сотрудника")

class RequestInDB(BaseModel):
    RequestID: int
    BookingID: int
    StaffID: Optional[int]
    StatusID: int
    Comment: Optional[str]
    UpdatedAt: datetime
    booking: BookingSimpleForRequest
    status: StatusSchema

    class Config:
        from_attributes = True

class QRScanRequest(BaseModel):
    qr_string: str