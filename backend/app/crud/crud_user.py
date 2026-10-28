from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.schemas.user import UserCreate, UserUpdate 
from app.core.security import get_password_hash

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.UserID == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.Email == email).first()

def create_user(db: Session, user_in: UserCreate) -> User:
    # Создаем пользователя с хешированным паролем
    db_user = User(
        Email=user_in.Email,
        PasswordHash=get_password_hash(user_in.Password),
        FirstName=user_in.FirstName,
        LastName=user_in.LastName,
        Phone=user_in.Phone,
    )
    
    # Назначаем роль Client по умолчанию
    client_role = db.query(Role).filter(Role.RoleName == "Client").first()
    if client_role:
        db_user.roles.append(client_role)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: User, user_in: UserUpdate) -> User:
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    db.commit()
    db.refresh(db_user)
    return db_user