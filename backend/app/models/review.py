from sqlalchemy import Column, Integer, DateTime, ForeignKey, UnicodeText, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Review(Base):
    __tablename__ = 'Reviews'
    ReviewID = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey('Users.UserID'), nullable=False)
    ServiceID = Column(Integer, ForeignKey('Services.ServiceID'), nullable=False)
    Rating = Column(Integer, CheckConstraint('Rating BETWEEN 1 AND 5'), nullable=False)
    Comment = Column(UnicodeText, nullable=True)
    CreatedAt = Column(DateTime, server_default=func.now())
    
    user = relationship("User")
    service = relationship("Service")