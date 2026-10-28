from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from decimal import Decimal

# --- СХЕМЫ ДЛЯ ВЛОЖЕННЫХ ОБЪЕКТОВ ---

class BookingStatusInDB(BaseModel):
    StatusID: int
    StatusName: str
    model_config = ConfigDict(from_attributes=True)

class ServiceSimple(BaseModel):
    ServiceID: int
    ServiceName: str
    Price: Decimal
    model_config = ConfigDict(from_attributes=True)

class UserSimple(BaseModel): # <--- ВОТ ОНА
    UserID: int
    FirstName: str
    LastName: str
    Email: str
    model_config = ConfigDict(from_attributes=True)

class RequestSimple(BaseModel):
    Comment: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# --- СХЕМЫ ДЛЯ БРОНИРОВАНИЯ ---

class BookingCreate(BaseModel):
    ServiceID: int
    BookingDate: datetime
    UsePoints: bool = False
    TotalPrice: Optional[Decimal] = None
    Options: Optional[str] = None

class BookingInDBBase(BaseModel):
    BookingID: int
    UserID: int
    ServiceID: int
    StatusID: int
    BookingDate: datetime
    CreatedAt: datetime
    FinalPrice: Optional[Decimal] = None
    model_config = ConfigDict(from_attributes=True)

class Booking(BookingInDBBase):
    pass

class BookingWithDetails(BookingInDBBase):
    service: ServiceSimple
    status: BookingStatusInDB
    request: Optional[RequestSimple] = None
    user: UserSimple 