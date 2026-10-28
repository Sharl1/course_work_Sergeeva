import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    """Тест 1: Проверка, что сервер запускается"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_login_invalid_user():
    """Тест 2: Проверка, что неверный пароль не пускает в систему"""
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "wrong@mail.ru", "password": "wrongpassword"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Неверный email или пароль"

def test_get_services():
    """Тест 3: Проверка, что каталог услуг доступен"""
    response = client.get("/api/v1/services/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0