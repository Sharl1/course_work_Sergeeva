from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# --- Схемы для Категорий ---
class ServiceCategoryBase(BaseModel):
    CategoryName: str
    Description: Optional[str] = None

class ServiceCategoryCreate(ServiceCategoryBase):
    pass

class ServiceCategoryInDB(ServiceCategoryBase):
    CategoryID: int
    model_config = ConfigDict(from_attributes=True)

# --- Схемы для Услуг ---
class ServiceBase(BaseModel):
    ServiceName: str
    Description: Optional[str] = None
    Price: Decimal = Field(..., ge=0, description="Цена должна быть больше или равна нулю")
    CategoryID: int
    IsActive: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    ServiceName: Optional[str] = None
    Description: Optional[str] = None
    Price: Optional[Decimal] = Field(None, ge=0)
    CategoryID: Optional[int] = None
    IsActive: Optional[bool] = None

class ServiceInDB(ServiceBase):
    ServiceID: int
    CreatedAt: datetime
    category: ServiceCategoryInDB
    model_config = ConfigDict(from_attributes=True)