from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.chat import ChatInDB, MessageInDB, MessageCreate, ChatWithClient 
from app.crud import crud_chat
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=ChatInDB, summary="Создать чат с консьержем")
def create_chat(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    roles = [r.RoleName for r in current_user.roles]
    if "Client" not in roles and "Admin" not in roles:
        raise HTTPException(status_code=403, detail="Только клиенты могут создавать чаты")
    return crud_chat.create_chat(db, current_user.UserID)

from app.schemas.chat import ChatInDB, MessageInDB, MessageCreate, ChatWithClient # <-- Импорт

@router.get("/my", response_model=List[ChatWithClient], summary="Получить мои чаты") # <-- Изменили схему
def read_my_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    role = current_user.roles[0].RoleName if current_user.roles else "Client"
    return crud_chat.get_user_chats(db, current_user.UserID, role)

@router.get("/{chat_id}/messages", response_model=List[MessageInDB], summary="История сообщений")
def read_messages(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    chat = crud_chat.get_chat(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Чат не найден")
    # Проверка доступа (упрощенно)
    return crud_chat.get_messages(db, chat_id)

@router.post("/{chat_id}/messages", response_model=MessageInDB, summary="Отправить сообщение")
def send_message(
    chat_id: int,
    message_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    chat = crud_chat.get_chat(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Чат не найден")
    return crud_chat.create_message(db, chat_id, current_user.UserID, message_in.Content)