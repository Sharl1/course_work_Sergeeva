import os
from pathlib import Path

def create_project_structure():
    # Базовые пути для бэкенда и фронтенда
    base_dir = Path.cwd()
    backend_dir = base_dir / "backend"
    frontend_dir = base_dir / "frontend"

    # ==========================================
    # СТРУКТУРА БЭКЕНДА (FastAPI)
    # ==========================================
    backend_dirs = [
        "app",
        "app/api",
        "app/api/v1",
        "app/core",
        "app/db",
        "app/models",
        "app/schemas",
        "app/crud",
        "tests" # Для тестирования по ТЗ
    ]
    
    backend_files = [
        ".env",
        "requirements.txt",
        "app/__init__.py",
        "app/main.py",
        "app/api/__init__.py",
        "app/api/v1/__init__.py",
        "app/api/v1/auth.py",
        "app/api/v1/users.py",
        "app/api/v1/services.py",
        "app/api/v1/bookings.py",
        "app/api/v1/requests.py",
        "app/api/v1/chats.py",
        "app/api/v1/loyalty.py",
        "app/api/v1/reviews.py",
        "app/api/v1/analytics.py",
        "app/core/__init__.py",
        "app/core/config.py",
        "app/core/security.py",
        "app/db/__init__.py",
        "app/db/database.py",
        "app/models/__init__.py",
        "app/models/user.py",
        "app/models/service.py",
        "app/models/booking.py",
        "app/models/chat.py",
        "app/models/loyalty.py",
        "app/models/review.py",
        "app/models/notification.py",
        "app/models/hotel.py",
        "app/schemas/__init__.py",
        "app/schemas/user.py",
        "app/schemas/service.py",
        "app/schemas/booking.py",
        "app/schemas/chat.py",
        "app/schemas/token.py",
        "app/crud/__init__.py",
        "app/crud/crud_user.py",
        "app/crud/crud_service.py",
        "app/crud/crud_booking.py",
        "tests/__init__.py",
        "tests/test_auth.py",
        "tests/test_bookings.py"
    ]

    # ==========================================
    # СТРУКТУРА ФРОНТЕНДА (React + TS + Vite)
    # ==========================================
    frontend_dirs = [
        "src",
        "src/assets",
        "src/assets/icons",
        "src/assets/images",
        "src/components",
        "src/components/ui",       # Кнопки, инпуты, модалки, "пузыри"
        "src/components/layout",   # Хедер, навигация, сайдбар
        "src/components/features", # Компоненты фичей (карточка услуги, чат и т.д.)
        "src/pages",
        "src/pages/auth",
        "src/pages/client",
        "src/pages/staff",
        "src/pages/admin",
        "src/store",
        "src/api",
        "src/hooks",
        "src/types",
        "src/utils",
        "src/styles"
    ]

    frontend_files = [
        "package.json",
        "vite.config.ts",
        "tailwind.config.js",
        "postcss.config.js",
        "tsconfig.json",
        ".env",
        "index.html",
        "src/main.tsx",
        "src/App.tsx",
        "src/index.css",
        "src/styles/theme.css",           # Сюда запишем цвета Apple UI и Postman Orange
        "src/components/ui/Button.tsx",
        "src/components/ui/Modal.tsx",
        "src/components/ui/BubblePopover.tsx",
        "src/components/ui/Input.tsx",
        "src/components/ui/Card.tsx",
        "src/components/layout/Header.tsx",
        "src/components/layout/Sidebar.tsx",
        "src/components/layout/MobileNav.tsx",
        "src/components/features/ServiceCard.tsx",
        "src/components/features/BookingForm.tsx",
        "src/components/features/ChatWindow.tsx",
        "src/pages/auth/Login.tsx",
        "src/pages/auth/Register.tsx",
        "src/pages/client/Dashboard.tsx",
        "src/pages/client/Catalog.tsx",
        "src/pages/client/MyBookings.tsx",
        "src/pages/staff/StaffDashboard.tsx",
        "src/pages/admin/AdminDashboard.tsx",
        "src/pages/admin/ManageServices.tsx",
        "src/store/authStore.ts",
        "src/api/axiosClient.ts",
        "src/api/authApi.ts",
        "src/api/servicesApi.ts",
        "src/api/bookingsApi.ts",
        "src/types/index.ts",
        "src/utils/formatCurrency.ts"
    ]

    print("Начинаю создание структуры проекта... 🚀")

    # Создаем Бэкенд
    for directory in backend_dirs:
        (backend_dir / directory).mkdir(parents=True, exist_ok=True)
    for file in backend_files:
        (backend_dir / file).touch()
    print(f"✅ Бэкенд успешно создан по пути: {backend_dir}")

    # Создаем Фронтенд
    for directory in frontend_dirs:
        (frontend_dir / directory).mkdir(parents=True, exist_ok=True)
    for file in frontend_files:
        (frontend_dir / file).touch()
    print(f"✅ Фронтенд успешно создан по пути: {frontend_dir}")

    print("\n🎉 Структура проекта готова! Теперь мы можем приступать к заполнению файлов по порядку.")

if __name__ == "__main__":
    create_project_structure()