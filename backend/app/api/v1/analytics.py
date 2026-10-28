from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.models.service import Service, ServiceCategory
from app.models.loyalty import LoyaltyTransaction, LoyaltyAccount
from app.api.deps import check_role

router = APIRouter()

@router.get("/summary", summary="Общая статистика (Админ)")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Admin"]))
):
    users_count = db.query(func.count(User.UserID)).scalar()
    bookings_count = db.query(func.count(Booking.BookingID)).scalar()
    services_count = db.query(func.count(Service.ServiceID)).scalar()
    total_bonus = db.query(func.sum(LoyaltyTransaction.Amount)).filter(LoyaltyTransaction.Amount > 0).scalar() or 0
    
    return {
        "total_users": users_count,
        "total_bookings": bookings_count,
        "total_services": services_count,
        "total_bonus_issued": total_bonus
    }

@router.get("/detailed", summary="Детальная аналитика для графиков (Админ)")
def get_detailed_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Admin"]))
):
    # 1. Статусы броней (для Пирога)
    status_counts = db.query(
        BookingStatus.StatusName, func.count(Booking.BookingID)
    ).join(Booking).group_by(BookingStatus.StatusName).all()
    
    status_distribution = [{"name": s[0], "value": s[1]} for s in status_counts]

    # 2. Топ-5 услуг по количеству броней (для Бара)
    top_services = db.query(
        Service.ServiceName, func.count(Booking.BookingID).label('count')
    ).join(Booking).group_by(Service.ServiceName).order_by(func.count(Booking.BookingID).desc()).limit(5).all()
    
    top_services_data = [{"name": s[0], "count": s[1]} for s in top_services]

    # 3. Активность за последние 7 дней (для Графика)
    today = datetime.utcnow().date()
    activity_data = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        next_day = day + timedelta(days=1)
        
        count = db.query(func.count(Booking.BookingID)).filter(
            Booking.CreatedAt >= day,
            Booking.CreatedAt < next_day
        ).scalar()
        
        # Красивое название дня (Пн, Вт...)
        day_name = day.strftime('%a')
        ru_days = {'Mon': 'Пн', 'Tue': 'Вт', 'Wed': 'Ср', 'Thu': 'Чт', 'Fri': 'Пт', 'Sat': 'Сб', 'Sun': 'Вс'}
        
        activity_data.append({
            "name": ru_days.get(day_name, day_name),
            "заказы": count
        })

    return {
        "status_distribution": status_distribution,
        "top_services": top_services_data,
        "activity": activity_data
    }

@router.get("/transactions", summary="Все транзакции бонусов (Админ)")
def get_all_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Admin"]))
):
    transactions = db.query(LoyaltyTransaction).options(
        joinedload(LoyaltyTransaction.account).joinedload(LoyaltyAccount.user)
    ).order_by(LoyaltyTransaction.CreatedAt.desc()).limit(50).all()
    
    return [{
        "id": t.TransactionID,
        "amount": t.Amount,
        "type": t.TransactionType,
        "desc": t.Description,
        "date": t.CreatedAt,
        "user_name": f"{t.account.user.FirstName} {t.account.user.LastName}" if t.account and t.account.user else "Неизвестно"
    } for t in transactions]