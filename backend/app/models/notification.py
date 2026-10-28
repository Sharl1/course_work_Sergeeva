from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Unicode, UnicodeText
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Notification(Base):
    __tablename__ = 'Notifications'
    NotificationID = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey('Users.UserID', ondelete='CASCADE'), nullable=False)
    Title = Column(Unicode(100), nullable=False)
    Message = Column(UnicodeText, nullable=False)
    IsRead = Column(Boolean, default=False)
    CreatedAt = Column(DateTime, server_default=func.now())
    
    user = relationship("User")