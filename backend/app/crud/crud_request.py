from sqlalchemy.orm import Session, joinedload
from app.models.booking import Request, RequestStatus, Booking, BookingStatus
from app.models.loyalty import LoyaltyAccount, LoyaltyTransaction
from app.schemas.request import RequestStatusUpdate
from decimal import Decimal

def get_requests(db: Session, status_name: str = None, staff_id: int = None):
    query = db.query(Request).options(
        joinedload(Request.booking).joinedload(Booking.service),
        joinedload(Request.booking).joinedload(Booking.user), # <--- Подгружаем юзера
        joinedload(Request.status)
    )
    if status_name:
        query = query.join(RequestStatus).filter(RequestStatus.StatusName == status_name)
    if staff_id:
        query = query.filter(Request.StaffID == staff_id)
    return query.order_by(Request.UpdatedAt.desc()).all()

def get_request(db: Session, request_id: int):
    return db.query(Request).options(
        joinedload(Request.booking).joinedload(Booking.service),
        joinedload(Request.booking).joinedload(Booking.user),
        joinedload(Request.status)
    ).filter(Request.RequestID == request_id).first()

def assign_request(db: Session, request_id: int, staff_id: int):
    db_request = get_request(db, request_id)
    if db_request:
        db_request.StaffID = staff_id
        db.commit()
        db.refresh(db_request)
    return db_request

def update_request_status(db: Session, request_id: int, update_data: RequestStatusUpdate):
    db_request = get_request(db, request_id)
    if not db_request:
        return None

    new_status = db.query(RequestStatus).filter(RequestStatus.StatusName == update_data.StatusName).first()
    if not new_status:
        return None

    db_request.StatusID = new_status.StatusID
    if update_data.Comment:
        db_request.Comment = update_data.Comment

    booking = db_request.booking

    # --- СИНХРОНИЗАЦИЯ СТАТУСОВ БРОНИ ---
    if update_data.StatusName == "InProgress":
        confirmed_status = db.query(BookingStatus).filter(BookingStatus.StatusName == "Confirmed").first()
        if confirmed_status:
            booking.StatusID = confirmed_status.StatusID

    elif update_data.StatusName == "Completed":
        completed_status = db.query(BookingStatus).filter(BookingStatus.StatusName == "Completed").first()
        if completed_status:
            booking.StatusID = completed_status.StatusID
        
        # Начисляем бонусы
        price_to_use = booking.FinalPrice if booking.FinalPrice else booking.service.Price
        bonus_points = int(Decimal(price_to_use) * Decimal('0.10'))

        if bonus_points > 0:
            account = db.query(LoyaltyAccount).filter(LoyaltyAccount.UserID == booking.UserID).first()
            if not account:
                account = LoyaltyAccount(UserID=booking.UserID, Balance=0)
                db.add(account)
                db.flush()

            account.Balance += bonus_points
            transaction = LoyaltyTransaction(
                AccountID=account.AccountID, Amount=bonus_points,
                TransactionType="Accrual", Description=f"Бонус за заказ #{booking.BookingID}"
            )
            db.add(transaction)

    elif update_data.StatusName == "Rejected":
        cancelled_status = db.query(BookingStatus).filter(BookingStatus.StatusName == "Cancelled").first()
        if cancelled_status:
            booking.StatusID = cancelled_status.StatusID

    db.commit()
    db.refresh(db_request)
    return db_request