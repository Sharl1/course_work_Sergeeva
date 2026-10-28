from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Unicode, UnicodeText
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Chat(Base):
    __tablename__ = 'Chats'
    ChatID = Column(Integer, primary_key=True, autoincrement=True)
    ClientID = Column(Integer, ForeignKey('Users.UserID'), nullable=False)
    StaffID = Column(Integer, ForeignKey('Users.UserID'), nullable=True)
    CreatedAt = Column(DateTime, server_default=func.now())
    
    client = relationship("User", foreign_keys=[ClientID])
    staff = relationship("User", foreign_keys=[StaffID])
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = 'Messages'
    MessageID = Column(Integer, primary_key=True, autoincrement=True)
    ChatID = Column(Integer, ForeignKey('Chats.ChatID', ondelete='CASCADE'), nullable=False)
    SenderID = Column(Integer, ForeignKey('Users.UserID'), nullable=False)
    Content = Column(UnicodeText, nullable=False)
    SentAt = Column(DateTime, server_default=func.now())
    
    chat = relationship("Chat", back_populates="messages")
    sender = relationship("User")