import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)


def test_register_user():
    """Test user registration endpoint"""
    # Use a unique email each time to avoid conflicts
    unique_id = str(uuid.uuid4())[:8]
    response = client.post("/auth/register", json={
        "email": f"test_{unique_id}@example.com",
        "full_name": "Pytest User",
        "mobile_number": "09123456789",
        "password": "test123",
        "role": "renter"
    })
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert data["role"] == "renter"


def test_login_invalid_credentials():
    """Test login with wrong credentials"""
    response = client.post("/auth/login", data={
        "username": "nonexistent@email.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_needs_setup():
    """Test setup check endpoint"""
    response = client.get("/auth/needs-setup")
    assert response.status_code == 200
    assert "needs_setup" in response.json()