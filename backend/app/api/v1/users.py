from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.user import User, Role
from app.schemas.user import User as UserSchema, RoleUpdate
from app.api.deps import check_role

router = APIRouter()

@router.get("/", response_model=List[UserSchema], summary="Список всех пользователей (Админ)")
def read_users(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Admin"]))
):
    return db.query(User).offset(skip).limit(limit).all()

@router.patch("/{user_id}/status", response_model=UserSchema, summary="Блокировка/Разблокировка (Админ)")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Admin"]))
):
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    
    # Запрещаем админу блокировать самого себя
    if user.UserID == current_user.UserID:
        raise HTTPException(status_code=400, detail="Нельзя заблокировать самого себя")
        
    user.IsActive = not user.IsActive
    db.commit()
    db.refresh(user)
    return user

@router.patch("/{user_id}/role", response_model=UserSchema, summary="Изменить роль пользователя (Админ)")
def update_user_role(
    user_id: int,
    role_data: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(["Admin"]))
):
    user = db.query(User).filter(User.UserID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
        
    if user.UserID == current_user.UserID:
        raise HTTPException(status_code=400, detail="Нельзя изменить свою собственную роль")

    new_role = db.query(Role).filter(Role.RoleName == role_data.RoleName).first()
    if not new_role:
        raise HTTPException(status_code=400, detail="Указанная роль не существует")

    # Очищаем старые роли и назначаем новую (у нас в UI подразумевается одна основная роль)
    user.roles.clear()
    user.roles.append(new_role)
    
    db.commit()
    db.refresh(user)
    return user