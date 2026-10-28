from sqlalchemy.orm import Session, joinedload
from app.models.chat import Chat, Message
from app.models.user import User
from typing import List

def create_chat(db: Session, client_id: int):
    existing_chat = db.query(Chat).filter(Chat.ClientID == client_id).first()
    if existing_chat:
        return existing_chat
    
    new_chat = Chat(ClientID=client_id)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat

def get_user_chats(db: Session, user_id: int, role: str):
    query = db.query(Chat).options(
        joinedload(Chat.client),
        joinedload(Chat.messages).joinedload(Message.sender)
    )
    
    if role == "Client":
        return query.filter(Chat.ClientID == user_id).all()
    elif role in ["Staff", "Admin"]:
        # Сотрудник видит свои чаты и те, где он еще не назначен
        return query.filter((Chat.StaffID == user_id) | (Chat.StaffID == None)).all()
    return []

def get_chat(db: Session, chat_id: int):
    return db.query(Chat).filter(Chat.ChatID == chat_id).first()

def get_messages(db: Session, chat_id: int):
    return db.query(Message).options(joinedload(Message.sender)).filter(Message.ChatID == chat_id).order_by(Message.SentAt.asc()).all()

def create_message(db: Session, chat_id: int, sender_id: int, content: str):
    message = Message(ChatID=chat_id, SenderID=sender_id, Content=content)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message