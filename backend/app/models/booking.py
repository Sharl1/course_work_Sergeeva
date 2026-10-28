from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Unicode, UnicodeText, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class BookingStatus(Base):
    __tablename__ = 'BookingStatuses'
    StatusID = Column(Integer, primary_key=True, autoincrement=True)
    StatusName = Column(String(30), unique=True, nullable=False)
    bookings = relationship("Booking", back_populates="status")

class Booking(Base):
    __tablename__ = 'Bookings'
    BookingID = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey('Users.UserID'), nullable=False)
    ServiceID = Column(Integer, ForeignKey('Services.ServiceID'), nullable=False)
    StatusID = Column(Integer, ForeignKey('BookingStatuses.StatusID'), nullable=False)
    BookingDate = Column(DateTime, nullable=False)
    CreatedAt = Column(DateTime, server_default=func.now())
    
    # --- ДОБАВЛЕННОЕ ПОЛЕ ---
    FinalPrice = Column(Numeric(10, 2), nullable=True) 
    
    user = relationship("User", backref="bookings")
    service = relationship("Service")
    status = relationship("BookingStatus", back_populates="bookings")
    request = relationship("Request", back_populates="booking", uselist=False, cascade="all, delete-orphan")

class RequestStatus(Base):
    __tablename__ = 'RequestStatuses'
    StatusID = Column(Integer, primary_key=True, autoincrement=True)
    StatusName = Column(String(30), unique=True, nullable=False)
    requests = relationship("Request", back_populates="status")

class Request(Base):
    __tablename__ = 'Requests'
    RequestID = Column(Integer, primary_key=True, autoincrement=True)
    BookingID = Column(Integer, ForeignKey('Bookings.BookingID', ondelete='CASCADE'), unique=True, nullable=False)
    StaffID = Column(Integer, ForeignKey('Users.UserID'), nullable=True)
    StatusID = Column(Integer, ForeignKey('RequestStatuses.StatusID'), nullable=False)
    Comment = Column(UnicodeText, nullable=True)
    UpdatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())

    booking = relationship("Booking", back_populates="request")
    staff = relationship("User")
    status = relationship("RequestStatus", back_populates="requests")