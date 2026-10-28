from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db.database import get_db
from app.schemas.user import UserCreate, User as UserSchema, UserUpdate
from app.schemas.token import Token
from app.crud import crud_user
from app.core import security
from app.core.config import settings
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED, summary="Регистрация нового пользователя")
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    user = crud_user.get_user_by_email(db, email=user_in.Email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким email уже существует.",
        )
    user = crud_user.create_user(db, user_in=user_in)
    return user

@router.post("/login", response_model=Token, summary="Вход и получение JWT-токена")
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    # В OAuth2 поле называется 'username', но мы передаем туда Email
    user = crud_user.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.PasswordHash):
        raise HTTPException(status_code=400, detail="Неверный email или пароль")
    elif not user.IsActive:
        raise HTTPException(status_code=400, detail="Пользователь неактивен")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.UserID, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserSchema, summary="Получить данные текущего пользователя")
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=UserSchema, summary="Обновить свой профиль")
def update_user_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud_user.update_user(db, db_user=current_user, user_in=user_in)