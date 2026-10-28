from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Unicode
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class LoyaltyAccount(Base):
    __tablename__ = 'LoyaltyAccounts'
    AccountID = Column(Integer, primary_key=True, autoincrement=True)
    UserID = Column(Integer, ForeignKey('Users.UserID', ondelete='CASCADE'), unique=True, nullable=False)
    Balance = Column(Integer, default=0)
    UpdatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    user = relationship("User")
    transactions = relationship("LoyaltyTransaction", back_populates="account", cascade="all, delete-orphan")

class LoyaltyTransaction(Base):
    __tablename__ = 'LoyaltyTransactions'
    TransactionID = Column(Integer, primary_key=True, autoincrement=True)
    AccountID = Column(Integer, ForeignKey('LoyaltyAccounts.AccountID', ondelete='CASCADE'), nullable=False)
    Amount = Column(Integer, nullable=False)
    TransactionType = Column(String(20), nullable=False)
    Description = Column(Unicode(255), nullable=True)
    CreatedAt = Column(DateTime, server_default=func.now())
    
    account = relationship("LoyaltyAccount", back_populates="transactions")