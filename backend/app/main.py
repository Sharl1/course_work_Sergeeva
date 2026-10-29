from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine, Base, SessionLocal
from app import models

# Импорт всех роутеров
from app.api.v1 import auth, services, bookings, requests, chats, loyalty, reviews, users, analytics, notifications

# Импорт моделей для заполнения справочников (seed_data)
from app.models.user import Role
from app.models.booking import BookingStatus, RequestStatus
from app.models.service import ServiceCategory

# Создаем таблицы в БД (если их нет)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Цифровой Консьерж API",
    description="API для автоматизации обслуживания клиентов гостиницы",
    version="1.0.0"
)

# ==========================================
# НАСТРОЙКА CORS (ОБЯЗАТЕЛЬНО ДО РОУТЕРОВ!)
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# ЗАПОЛНЕНИЕ СПРАВОЧНИКОВ ПРИ СТАРТЕ
# ==========================================
def seed_data():
    db = SessionLocal()
    try:
        if db.query(Role).count() == 0:
            db.add_all([
                Role(RoleName="Guest", Description="Гость"),
                Role(RoleName="Client", Description="Клиент"),
                Role(RoleName="Staff", Description="Сотрудник"),
                Role(RoleName="Admin", Description="Администратор")
            ])
        
        if db.query(BookingStatus).count() == 0:
            db.add_all([
                BookingStatus(StatusName="Pending"),
                BookingStatus(StatusName="Confirmed"),
                BookingStatus(StatusName="Cancelled"),
                BookingStatus(StatusName="Completed")
            ])
            
        if db.query(RequestStatus).count() == 0:
            db.add_all([
                RequestStatus(StatusName="Open"),
                RequestStatus(StatusName="InProgress"),
                RequestStatus(StatusName="Completed"),
                RequestStatus(StatusName="Rejected")
            ])
            
        if db.query(ServiceCategory).count() == 0:
            db.add_all([
                ServiceCategory(CategoryName="Ресторан"),
                ServiceCategory(CategoryName="СПА"),
                ServiceCategory(CategoryName="Такси"),
                ServiceCategory(CategoryName="Прачечная"),
                ServiceCategory(CategoryName="Конференц-залы")
            ])
            
        db.commit()
    finally:
        db.close()

seed_data()

# ==========================================
# ПОДКЛЮЧЕНИЕ РОУТЕРОВ
# ==========================================
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Авторизация"])
app.include_router(services.router, prefix="/api/v1/services", tags=["Услуги и Категории"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["Бронирования"])
app.include_router(requests.router, prefix="/api/v1/requests", tags=["Заявки (Персонал)"])
app.include_router(chats.router, prefix="/api/v1/chats", tags=["Чат с консьержем"])
app.include_router(loyalty.router, prefix="/api/v1/loyalty", tags=["Программа лояльности"])
app.include_router(reviews.router, prefix="/api/v1/reviews", tags=["Отзывы"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Пользователи (Админ)"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Аналитика (Админ)"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Уведомления"])

# ==========================================
# КОРНЕВОЙ ЭНДПОИНТ
# ==========================================
@app.get("/")
def root():
    return {"status": "ok", "message": "Бэкенд работает! База данных подключена."}