"""Tests for admin/health endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    response = client.get("/api/v1/admin/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_info_endpoint(client):
    response = client.get("/api/v1/admin/info")
    assert response.status_code == 200
    data = response.json()
    assert "supervisor_agent" in data["components"]
