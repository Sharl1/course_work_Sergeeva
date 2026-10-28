import sqlite3
import bcrypt
import datetime

# 1. Данные для админа
EMAIL = "admin@example.com"
PASSWORD = "admin123"
FIRST_NAME = "Главный"
LAST_NAME = "Администратор"

# 2. Хешируем пароль (как в security.py)
pwd_bytes = PASSWORD.encode('utf-8')[:72]
hash_pwd = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode('utf-8')

# 3. Подключаемся к нашей базе SQLite
conn = sqlite3.connect('digital_concierge.db')
cursor = conn.cursor()

try:
    # Проверяем, есть ли уже такой пользователь
    cursor.execute("SELECT UserID FROM Users WHERE Email = ?", (EMAIL,))
    if cursor.fetchone():
        print(f"❌ Пользователь {EMAIL} уже существует!")
    else:
        # Создаем пользователя
        cursor.execute("""
            INSERT INTO Users (Email, PasswordHash, FirstName, LastName, IsActive, CreatedAt)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (EMAIL, hash_pwd, FIRST_NAME, LAST_NAME, 1, datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
        
        user_id = cursor.lastrowid # Получаем ID только что созданного юзера
        
        # Находим ID роли "Admin" (мы засеивали её при старте сервера, она должна быть)
        cursor.execute("SELECT RoleID FROM Roles WHERE RoleName = 'Admin'")
        role_row = cursor.fetchone()
        
        if role_row:
            role_id = role_row[0]
            # Привязываем роль к пользователю
            cursor.execute("INSERT INTO UserRoles (UserID, RoleID) VALUES (?, ?)", (user_id, role_id))
            conn.commit()
            print(f"✅ Админ успешно создан!")
            print(f"📧 Email: {EMAIL}")
            print(f"🔑 Пароль: {PASSWORD}")
        else:
            print("❌ Ошибка: Роль 'Admin' не найдена в базе. Убедись, что сервер хотя бы раз запускался.")
            
except Exception as e:
    print(f"❌ Ошибка при создании: {e}")
finally:
    conn.close()