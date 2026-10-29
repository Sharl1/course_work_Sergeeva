from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationInDB
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[NotificationInDB], summary="Мои уведомления")
def get_my_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return db.query(Notification).filter(Notification.UserID == current_user.UserID).order_by(Notification.CreatedAt.desc()).limit(20).all()

@router.patch("/read-all", summary="Прочитать все уведомления")
def mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    db.query(Notification).filter(Notification.UserID == current_user.UserID, Notification.IsRead == False).update({"IsRead": True})
    db.commit()
    return {"status": "ok"}