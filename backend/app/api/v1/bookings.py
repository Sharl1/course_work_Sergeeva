from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload 
from typing import List

from app.models.booking import Booking
from app.db.database import get_db
from app.schemas.booking import BookingCreate, Booking as BookingSchema, BookingWithDetails
from app.crud import crud_booking
from app.api.deps import check_role
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=BookingSchema, status_code=status.HTTP_201_CREATED, summary="Создать бронирование услуги")
def create_new_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Client", "Admin"]))
):
    booking = crud_booking.create_booking(db, booking_in, current_user.UserID)
    if not booking:
        raise HTTPException(status_code=404, detail="Услуга не найдена или неактивна")
    return booking

@router.get("/my", response_model=List[BookingWithDetails], summary="Получить мои бронирования")
def read_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Client", "Admin"]))
):
    return crud_booking.get_user_bookings(db, current_user.UserID)

@router.patch("/{booking_id}/cancel", response_model=BookingWithDetails, summary="Отменить бронирование")
def cancel_my_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Client", "Admin"]))
):
    # Проверяем, что бронь принадлежит текущему пользователю (если он не админ)
    booking = crud_booking.get_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Бронирование не найдено")
    
    if booking.UserID != current_user.UserID and "Admin" not in [r.RoleName for r in current_user.roles]:
        raise HTTPException(status_code=403, detail="Вы можете отменять только свои бронирования")
        
    if booking.status.StatusName == "Cancelled":
        raise HTTPException(status_code=400, detail="Бронирование уже отменено")

    return crud_booking.cancel_booking(db, booking_id)

@router.get("/all", response_model=List[BookingWithDetails], summary="Все брони (Админ)")
def read_all_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Admin"]))
):
    return db.query(Booking).options(
        joinedload(Booking.service),
        joinedload(Booking.status),
        joinedload(Booking.user) # Добавили user, чтобы видеть, кто заказал
    ).order_by(Booking.CreatedAt.desc()).all()