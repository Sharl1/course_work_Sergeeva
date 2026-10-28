from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Unicode
from sqlalchemy.orm import relationship
from app.db.database import Base

class Hotel(Base):
    __tablename__ = 'Hotels'
    HotelID = Column(Integer, primary_key=True, autoincrement=True)
    HotelName = Column(Unicode(100), nullable=False)
    Address = Column(Unicode(255), nullable=False)
    Phone = Column(String(20), nullable=True)
    rooms = relationship("Room", back_populates="hotel", cascade="all, delete-orphan")

class Room(Base):
    __tablename__ = 'Rooms'
    RoomID = Column(Integer, primary_key=True, autoincrement=True)
    HotelID = Column(Integer, ForeignKey('Hotels.HotelID', ondelete='CASCADE'), nullable=False)
    RoomNumber = Column(String(10), nullable=False)
    RoomType = Column(Unicode(50), nullable=False)
    BasePrice = Column(Numeric(10, 2), nullable=False)
    hotel = relationship("Hotel", back_populates="rooms")