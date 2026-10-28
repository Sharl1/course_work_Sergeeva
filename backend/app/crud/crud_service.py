from sqlalchemy.orm import Session, joinedload
from app.models.service import Service, ServiceCategory
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceCategoryCreate
from typing import List, Optional

def get_category_by_name(db: Session, name: str):
    return db.query(ServiceCategory).filter(ServiceCategory.CategoryName == name).first()

# --- Категории ---
def get_category(db: Session, category_id: int):
    return db.query(ServiceCategory).filter(ServiceCategory.CategoryID == category_id).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(ServiceCategory).offset(skip).limit(limit).all()

def create_category(db: Session, category: ServiceCategoryCreate):
    db_category = ServiceCategory(
        CategoryName=category.CategoryName,
        Description=category.Description
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# --- Услуги ---
def get_service(db: Session, service_id: int):
    # joinedload подгружает категорию сразу, чтобы не было N+1 запросов
    return db.query(Service).options(joinedload(Service.category)).filter(Service.ServiceID == service_id).first()

def get_services(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    only_active: bool = True
):
    query = db.query(Service).options(joinedload(Service.category))
    
    if only_active:
        query = query.filter(Service.IsActive == True)
    if category_id:
        query = query.filter(Service.CategoryID == category_id)
    if search:
        query = query.filter(Service.ServiceName.ilike(f"%{search}%"))
        
    return query.offset(skip).limit(limit).all()

def create_service(db: Session, service: ServiceCreate):
    db_service = Service(
        ServiceName=service.ServiceName,
        Description=service.Description,
        Price=service.Price,
        CategoryID=service.CategoryID,
        IsActive=service.IsActive
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def update_service(db: Session, db_service: Service, service_in: ServiceUpdate):
    update_data = service_in.model_dump(exclude_unset=True) # Берем только переданные поля
    for field, value in update_data.items():
        setattr(db_service, field, value)
    
    db.commit()
    db.refresh(db_service)
    return db_service

def delete_service(db: Session, db_service: Service):
    # Обычно услуги не удаляют физически, а просто деактивируют (Soft Delete)
    db_service.IsActive = False
    db.commit()
    db.refresh(db_service)
    return db_service