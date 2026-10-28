from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.schemas.service import ServiceInDB, ServiceCreate, ServiceUpdate, ServiceCategoryInDB, ServiceCategoryCreate
from app.crud import crud_service
from app.api.deps import check_role
from app.models.user import User
from app.models.booking import Booking
from sqlalchemy import func

router = APIRouter()

# --- Категории ---
@router.get("/categories", response_model=List[ServiceCategoryInDB], summary="Получить список категорий")
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_service.get_categories(db, skip=skip, limit=limit)

@router.post("/categories", response_model=ServiceCategoryInDB, status_code=status.HTTP_201_CREATED, summary="Создать категорию (Админ)")
def create_category(
    category: ServiceCategoryCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Admin"]))
):
    existing = crud_service.get_category_by_name(db, category.CategoryName)
    if existing:
        raise HTTPException(status_code=400, detail="Категория с таким названием уже существует")
    return crud_service.create_category(db, category)

# --- Услуги ---
@router.get("/", response_model=List[ServiceInDB], summary="Получить каталог услуг")
def read_services(
    skip: int = 0, 
    limit: int = 100, 
    category_id: Optional[int] = Query(None, description="Фильтр по ID категории"),
    search: Optional[str] = Query(None, description="Поиск по названию"),
    only_active: bool = Query(True, description="Показывать только активные"), # <--- ПАРАМЕТР
    db: Session = Depends(get_db)
):
    return crud_service.get_services(
        db, 
        skip=skip, 
        limit=limit, 
        category_id=category_id, 
        search=search, 
        only_active=only_active # <--- ПЕРЕДАЕМ В CRUD
    )

@router.get("/recommendations/", response_model=List[ServiceInDB], summary="Персональные рекомендации")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Client", "Admin"]))
):
    user_bookings = db.query(Booking).filter(Booking.UserID == current_user.UserID).all()
    booked_service_ids = [b.ServiceID for b in user_bookings]
    
    if user_bookings:
        booked_cats = [b.service.CategoryID for b in user_bookings if b.service]
        if booked_cats:
            recommended = db.query(Service).filter(
                Service.CategoryID.in_(booked_cats),
                Service.ServiceID.notin_(booked_service_ids),
                Service.IsActive == True
            ).limit(4).all()
            if recommended:
                return recommended

    return db.query(Service).filter(Service.IsActive == True).order_by(Service.ServiceID.desc()).limit(4).all()

@router.get("/{service_id}", response_model=ServiceInDB, summary="Получить услугу по ID")
def read_service(service_id: int, db: Session = Depends(get_db)):
    db_service = crud_service.get_service(db, service_id)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Услуга не найдена")
    return db_service

@router.post("/", response_model=ServiceInDB, status_code=status.HTTP_201_CREATED, summary="Создать услугу (Админ)")
def create_service(
    service: ServiceCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Admin"]))
):
    category = crud_service.get_category(db, category_id=service.CategoryID)
    if not category:
        raise HTTPException(status_code=400, detail="Указанная категория не существует")
    return crud_service.create_service(db, service)

@router.put("/{service_id}", response_model=ServiceInDB, summary="Обновить услугу (Админ)")
def update_service(
    service_id: int, 
    service_in: ServiceUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Admin"]))
):
    db_service = crud_service.get_service(db, service_id)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Услуга не найдена")
    return crud_service.update_service(db, db_service, service_in)

@router.delete("/{service_id}", response_model=ServiceInDB, summary="Деактивировать услугу (Админ)")
def delete_service(
    service_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Admin"]))
):
    db_service = crud_service.get_service(db, service_id)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Услуга не найдена")
    return crud_service.delete_service(db, db_service)