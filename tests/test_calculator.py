from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_tax_bands_endpoint():
    response = client.get("/api/v1/tax-bands")
    assert response.status_code == 200
    data = response.json()
    assert "tax_bands" in data
    assert len(data["tax_bands"]) == 7


def test_reliefs_endpoint():
    response = client.get("/api/v1/reliefs")
    assert response.status_code == 200
    data = response.json()
    assert "personal_relief_monthly" in data
    assert data["personal_relief_monthly"] == 365.00


def test_calculate_basic_salary_only():
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 4500.00,
    })
    assert response.status_code == 200
    data = response.json()

    assert data["summary"]["gross_income"] == 4500.00
    assert data["deductions"]["ssnit"]["amount"] == 247.50
    assert data["deductions"]["tier2_pension"]["amount"] == 225.00
    assert data["deductions"]["paye"]["total_tax"] > 0
    assert data["summary"]["net_take_home"] > 0


def test_calculate_with_allowances():
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 4500.00,
        "allowances": [
            {"name": "Transport", "amount": 500.00, "taxable": False},
            {"name": "Housing", "amount": 800.00, "taxable": True},
        ],
    })
    assert response.status_code == 200
    data = response.json()

    assert data["summary"]["gross_income"] == 5800.00
    # Non-taxable allowance should not affect PAYE
    assert data["deductions"]["ssnit"]["amount"] == 247.50


def test_calculate_with_reliefs():
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 4500.00,
        "allowances": [
            {"name": "Housing", "amount": 800.00, "taxable": True},
        ],
        "reliefs": {
            "marriage": False,
            "children": 2,
            "disability": False,
            "old_age": False,
        },
    })
    assert response.status_code == 200
    data = response.json()

    assert data["reliefs_applied"]["personal"] == 365.00
    assert data["reliefs_applied"]["child_education"] == 100.00
    assert data["reliefs_applied"]["total"] == 465.00


def test_calculate_response_structure():
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 3000.00,
    })
    assert response.status_code == 200
    data = response.json()

    assert "summary" in data
    assert "deductions" in data
    assert "reliefs_applied" in data
    assert "meta" in data
    assert data["meta"]["currency"] == "GHS"


def test_calculate_net_equals_gross_minus_deductions():
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 5000.00,
    })
    data = response.json()
    summary = data["summary"]
    expected_net = round(summary["gross_income"] - summary["total_deductions"], 2)
    assert summary["net_take_home"] == expected_net


def test_calculate_invalid_salary():
    response = client.post("/api/v1/calculate", json={
        "basic_salary": -100.00,
    })
    assert response.status_code == 422


def test_calculate_missing_salary():
    response = client.post("/api/v1/calculate", json={})
    assert response.status_code == 422
