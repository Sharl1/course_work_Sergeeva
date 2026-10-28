from sqlalchemy.orm import Session, joinedload
from app.models.booking import Booking, Request, BookingStatus, RequestStatus
from app.models.service import Service
from app.models.loyalty import LoyaltyAccount, LoyaltyTransaction
from app.schemas.booking import BookingCreate
from decimal import Decimal

def get_booking(db: Session, booking_id: int):
    return db.query(Booking).options(
        joinedload(Booking.status),
        joinedload(Booking.service),
        joinedload(Booking.request)
    ).filter(Booking.BookingID == booking_id).first()

def get_user_bookings(db: Session, user_id: int):
    # Подгружаем связанные данные для фронтенда (услугу и статус)
    return db.query(Booking).options(
        joinedload(Booking.service),
        joinedload(Booking.status)
    ).filter(Booking.UserID == user_id).order_by(Booking.BookingDate.desc()).all()

def create_booking(db: Session, booking_in: BookingCreate, user_id: int):
    # 1. Проверяем услугу
    service = db.query(Service).filter(Service.ServiceID == booking_in.ServiceID, Service.IsActive == True).first()
    if not service:
        return None

    # 2. Получаем начальные статусы
    pending_status = db.query(BookingStatus).filter(BookingStatus.StatusName == "Pending").first()
    open_status = db.query(RequestStatus).filter(RequestStatus.StatusName == "Open").first()

    # 3. Определяем итоговую цену (если фронт прислал с опциями, берем её)
    actual_price = booking_in.TotalPrice if booking_in.TotalPrice is not None else service.Price

    # 4. Создаем саму бронь
    db_booking = Booking(
        UserID=user_id, 
        ServiceID=booking_in.ServiceID, 
        StatusID=pending_status.StatusID,
        BookingDate=booking_in.BookingDate,
        FinalPrice=actual_price # <-- Сохраняем цену с учетом опций
    )
    db.add(db_booking)
    db.flush() # Получаем ID брони до коммита

    # 5. Формируем комментарий для сотрудника (передаем туда опции)
    comment_text = f"{booking_in.Options}" if booking_in.Options else None

    # 6. Создаем заявку для сотрудника
    db_request = Request(
        BookingID=db_booking.BookingID, 
        StatusID=open_status.StatusID,
        Comment=comment_text
    )
    db.add(db_request)

    # 7. СПИСАНИЕ БАЛЛОВ ЛОЯЛЬНОСТИ
    if booking_in.UsePoints:
        account = db.query(LoyaltyAccount).filter(LoyaltyAccount.UserID == user_id).first()
        if account and account.Balance > 0:
            # Максимум можно списать 50% от итоговой стоимости
            max_allowed = int(actual_price * Decimal('0.5'))
            points_to_deduct = min(account.Balance, max_allowed)
            
            if points_to_deduct > 0:
                # Уменьшаем баланс
                account.Balance -= points_to_deduct
                
                # Создаем транзакцию для истории
                transaction = LoyaltyTransaction(
                    AccountID=account.AccountID, 
                    Amount=-points_to_deduct, # Отрицательное значение для списания
                    TransactionType="Deduction", 
                    Description=f"Оплата баллами за {service.ServiceName}"
                )
                db.add(transaction)

    # 8. Фиксируем всё в базе
    db.commit()
    db.refresh(db_booking)
    return db_booking

def cancel_booking(db: Session, booking_id: int):
    db_booking = get_booking(db, booking_id)
    if not db_booking:
        return None
    
    # Меняем статус брони на Cancelled
    cancelled_status = db.query(BookingStatus).filter(BookingStatus.StatusName == "Cancelled").first()
    db_booking.StatusID = cancelled_status.StatusID

    # Меняем статус связанной заявки на Rejected
    if db_booking.request:
        rejected_status = db.query(RequestStatus).filter(RequestStatus.StatusName == "Rejected").first()
        db_booking.request.StatusID = rejected_status.StatusID

    db.commit()
    db.refresh(db_booking)
    return db_booking