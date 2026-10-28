from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class RoleBase(BaseModel):
    RoleName: str

class Role(RoleBase):
    RoleID: int
    class Config:
        from_attributes = True  # Позволяет читать данные из SQLAlchemy-моделей

class UserBase(BaseModel):
    Email: EmailStr
    FirstName: str
    LastName: str
    Phone: Optional[str] = None

class UserCreate(UserBase):
    Password: str = Field(..., min_length=6, max_length=72, description="Пароль от 6 до 72 символов")

class UserInDBBase(UserBase):
    UserID: int
    IsActive: bool
    CreatedAt: datetime
    roles: List[Role] = []
    
    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class RoleUpdate(BaseModel):
    RoleName: str

class UserUpdate(BaseModel):
    FirstName: Optional[str] = None
    LastName: Optional[str] = None
    Phone: Optional[str] = None