from datetime import datetime, timedelta
from decimal import Decimal
from app.db.database import SessionLocal, engine, Base
from app.models.user import User, Role
from app.models.service import Service, ServiceCategory
from app.models.booking import Booking, BookingStatus, Request, RequestStatus
from app.models.loyalty import LoyaltyAccount, LoyaltyTransaction
from app.models.chat import Chat, Message
from app.core.security import get_password_hash
from app.models import *

def seed_database():
    print("Очищаем базу...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # --- РОЛИ ---
        role_admin = Role(RoleName="Admin", Description="Администратор")
        role_staff = Role(RoleName="Staff", Description="Сотрудник")
        role_client = Role(RoleName="Client", Description="Клиент")
        db.add_all([role_admin, role_staff, role_client])

        # --- СТАТУСЫ БРОНЕЙ (ОБЯЗАТЕЛЬНО ВСЕ 4!) ---
        status_pending = BookingStatus(StatusName="Pending")
        status_confirmed = BookingStatus(StatusName="Confirmed")
        status_completed = BookingStatus(StatusName="Completed")
        status_cancelled = BookingStatus(StatusName="Cancelled")
        db.add_all([status_pending, status_confirmed, status_completed, status_cancelled])

        # --- СТАТУСЫ ЗАЯВОК (ОБЯЗАТЕЛЬНО ВСЕ 4!) ---
        req_open = RequestStatus(StatusName="Open")
        req_in_progress = RequestStatus(StatusName="InProgress")
        req_completed = RequestStatus(StatusName="Completed")
        req_rejected = RequestStatus(StatusName="Rejected")
        db.add_all([req_open, req_in_progress, req_completed, req_rejected])
        db.commit()

        # --- КАТЕГОРИИ ---
        categories = {
            "Room Service": ServiceCategory(CategoryName="Room Service", Description="Доставка еды и напитков в номер"),
            "Ресторан": ServiceCategory(CategoryName="Ресторан", Description="Бронирование столов и банкеты"),
            "СПА": ServiceCategory(CategoryName="СПА", Description="Релакс, красота и здоровье"),
            "Такси": ServiceCategory(CategoryName="Такси", Description="Трансферы и поездки"),
            "Прачечная": ServiceCategory(CategoryName="Прачечная", Description="Чистка и глажка одежды"),
            "Конференц-залы": ServiceCategory(CategoryName="Конференц-залы", Description="Пространства для встреч"),
            "Экскурсии": ServiceCategory(CategoryName="Экскурсии", Description="Познание нового"),
            "Фитнес": ServiceCategory(CategoryName="Фитнес", Description="Спорт и активный отдых")
        }
        for cat in categories.values():
            db.add(cat)
        db.commit()

        # --- ПОЛЬЗОВАТЕЛИ ---
        pwd = get_password_hash("password123")
        admin = User(Email="admin@concierge.ru", PasswordHash=pwd, FirstName="Александр", LastName="Админов", roles=[role_admin])
        staff = User(Email="staff@concierge.ru", PasswordHash=pwd, FirstName="Елена", LastName="Сотрудникова", roles=[role_staff])
        client1 = User(Email="ivan@mail.ru", PasswordHash=pwd, FirstName="Иван", LastName="Иванов", roles=[role_client])
        client2 = User(Email="anna@mail.ru", PasswordHash=pwd, FirstName="Анна", LastName="Смирнова", roles=[role_client])
        db.add_all([admin, staff, client1, client2])
        db.commit()

        # --- УСЛУГИ ---
        food_data = [
            ("Room Service", "Стейк Рибай", "Сочный стейк из мраморной говядины. Подается с картофелем по-деревенски и соусом на выбор.", 4500),
            ("Room Service", "Паста Карбонара", "Классическая итальянская паста с беконом, сливочным соусом и пармезаном.", 1800),
            ("Room Service", "Салат Цезарь с курицей", "Хрустящий романо, куриное филе, гренки, пармезан и фирменный соус.", 1200),
            ("Room Service", "Томатный суп с базиликом", "Согревающий крем-суп из свежих томатов с нежным базиликом.", 900),
            ("Room Service", "Чизкейк Нью-Йорк", "Нежный десерт с ягодным соусом и свежей мятой.", 850),
            ("Room Service", "Завтрак континентальный", "Комбо: свежая выпечка, джемы, кофе и апельсиновый сок.", 1500),
            ("Room Service", "Ужин при свечах (Комбо)", "Романтическое комбо: два горячих блюда на выбор, бутылка шампанского и десерт.", 8500),
        ]

        restaurant_data = [
            ("Ресторан", "Бронь столика в основном зале", "Забронируйте столик на вечер. Укажите количество гостей в комментарии.", 0),
            ("Ресторан", "Бронь VIP-ложи", "Уединенная ложа с видом на сцену. Включает депозит на напитки.", 10000),
            ("Ресторан", "Аренда банкетного зала", "Просторный зал для торжества до 50 человек. Декор и меню обсуждаются.", 50000),
            ("Ресторан", "Предзаказ блюд на мероприятие", "Сформируйте меню заранее, чтобы мы подготовили всё к вашему приходу.", 5000),
        ]

        other_data = [
            ("СПА", "Массаж спины и шеи", "Расслабляющий массаж на основе ароматических масел. Снимает напряжение.", 3500),
            ("СПА", "СПА-ритуал для лица", "Глубокое очищение, пилинг и увлажняющая маска.", 4200),
            ("Такси", "Трансфер из аэропорта", "Встреча с табличкой в зале прилета. Комфортабельный седан бизнес-класса.", 2500),
            ("Такси", "Экскурсия по городу", "3-часовая индивидуальная поездка по главным достопримечательностям.", 5000),
            ("Прачечная", "Химчистка одежды", "Экспресс-химчистка костюма или вечернего платья. Готово за 4 часа.", 1200),
            ("Конференц-залы", "Зал 'Сапфир' (до 20 чел.)", "Оборудован проектором, флипчартом и системой конференц-связи.", 15000),
            ("Экскурсии", "Обзорная по Москве", "Автобусная экскурсия по историческому центру с гидом. 3 часа.", 2500),
            ("Фитнес", "Персональная тренировка", "Занятие с профессиональным тренером в тренажерном зале. 60 минут.", 3000),
        ]

        for cat_name, name, desc, price in food_data + restaurant_data + other_data:
            db.add(Service(CategoryID=categories[cat_name].CategoryID, ServiceName=name, Description=desc, Price=Decimal(price)))
        
        db.commit()
        print("✅ Успех! База данных создана. Все 4 статуса броней и 4 статуса заявок на месте.")
        print("Пароль везде: password123")

    except Exception as e:
        print(f"❌ Ошибка: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()