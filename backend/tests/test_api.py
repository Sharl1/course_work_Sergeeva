import pytest

def test_read_root(test_client):
    """Тест 1: Проверка доступности сервера"""
    response = test_client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_get_services(test_client):
    """Тест 2: Проверка получения каталога услуг"""
    response = test_client.get("/api/v1/services/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_register_and_login(test_client):
    """Тест 3: Сквозной тест регистрации и авторизации"""
    # 1. Регистрация
    user_data = {
        "Email": "testuser@example.com",
        "Password": "strongpassword123",
        "FirstName": "Тест",
        "LastName": "Тестов"
    }
    reg_response = test_client.post("/api/v1/auth/register", json=user_data)
    assert reg_response.status_code == 201
    assert reg_response.json()["Email"] == user_data["Email"]

    # 2. Логин
    login_data = {
        "username": "testuser@example.com",
        "password": "strongpassword123"
    }
    login_response = test_client.post("/api/v1/auth/login", data=login_data)
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()

def test_invalid_login(test_client):
    """Тест 4: Проверка защиты от неверного пароля"""
    login_data = {
        "username": "wrong@mail.ru",
        "password": "wrongpassword"
    }
    response = test_client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Неверный email или пароль"