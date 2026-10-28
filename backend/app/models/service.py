from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, Unicode, UnicodeText
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class ServiceCategory(Base):
    __tablename__ = 'ServiceCategories'
    CategoryID = Column(Integer, primary_key=True, autoincrement=True)
    CategoryName = Column(Unicode(50), unique=True, nullable=False)
    Description = Column(Unicode(255), nullable=True)
    services = relationship("Service", back_populates="category")

class Service(Base):
    __tablename__ = 'Services'
    ServiceID = Column(Integer, primary_key=True, autoincrement=True)
    CategoryID = Column(Integer, ForeignKey('ServiceCategories.CategoryID'), nullable=False)
    ServiceName = Column(Unicode(100), nullable=False)
    Description = Column(UnicodeText, nullable=True)
    Price = Column(Numeric(10, 2), nullable=False)
    IsActive = Column(Boolean, default=True)
    CreatedAt = Column(DateTime, server_default=func.now())
    category = relationship("ServiceCategory", back_populates="services")