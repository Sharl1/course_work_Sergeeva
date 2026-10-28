from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Unicode, UnicodeText
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

UserRoles = Table(
    'UserRoles', Base.metadata,
    Column('UserID', Integer, ForeignKey('Users.UserID', ondelete='CASCADE'), primary_key=True),
    Column('RoleID', Integer, ForeignKey('Roles.RoleID', ondelete='CASCADE'), primary_key=True)
)

class Role(Base):
    __tablename__ = 'Roles'
    RoleID = Column(Integer, primary_key=True, autoincrement=True)
    RoleName = Column(Unicode(50), unique=True, nullable=False)
    Description = Column(Unicode(255), nullable=True)
    users = relationship("User", secondary=UserRoles, back_populates="roles")

class User(Base):
    __tablename__ = 'Users'
    UserID = Column(Integer, primary_key=True, autoincrement=True)
    Email = Column(String(100), unique=True, nullable=False, index=True)
    PasswordHash = Column(String(255), nullable=False)
    FirstName = Column(Unicode(50), nullable=False)
    LastName = Column(Unicode(50), nullable=False)
    Phone = Column(String(20), nullable=True)
    IsActive = Column(Boolean, default=True)
    CreatedAt = Column(DateTime, server_default=func.now())

    # Связи
    roles = relationship("Role", secondary=UserRoles, back_populates="users")