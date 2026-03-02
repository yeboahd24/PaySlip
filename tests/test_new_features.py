from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


# --- Employer Cost ---

def test_employer_cost_in_response():
    response = client.post("/api/v1/calculate", json={"basic_salary": 4500.00})
    data = response.json()
    assert "employer_cost" in data
    ec = data["employer_cost"]
    assert ec["employer_ssnit"]["rate"] == 0.13
    assert ec["employer_ssnit"]["amount"] == 585.00  # 4500 * 0.13
    assert ec["total_cost_to_employer"] == 5085.00  # 4500 + 585


def test_employer_cost_with_allowances():
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 4500.00,
        "allowances": [{"name": "Housing", "amount": 800.00, "taxable": True}],
    })
    data = response.json()
    ec = data["employer_cost"]
    # Employer SSNIT is on basic only
    assert ec["employer_ssnit"]["amount"] == 585.00
    # Total cost = gross (4500+800) + employer SSNIT (585)
    assert ec["total_cost_to_employer"] == 5885.00


# --- Bonus Impact ---

def test_bonus_impact():
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 4500.00,
        "bonus": 2000.00,
    })
    data = response.json()
    assert data["bonus_impact"] is not None
    bi = data["bonus_impact"]
    assert bi["bonus_amount"] == 2000.00
    assert bi["tax_on_bonus"] > 0
    assert bi["net_bonus"] > 0
    assert bi["net_bonus"] == round(2000.00 - bi["tax_on_bonus"], 2)
    assert 0 < bi["effective_rate"] < 1


def test_no_bonus_returns_null():
    response = client.post("/api/v1/calculate", json={"basic_salary": 4500.00})
    data = response.json()
    assert data["bonus_impact"] is None


# --- Year-over-Year Comparison ---

def test_year_comparison_in_response():
    response = client.post("/api/v1/calculate", json={"basic_salary": 4500.00})
    data = response.json()
    assert "year_comparison" in data
    yc = data["year_comparison"]
    if yc is not None:
        assert "previous_year" in yc
        assert "previous_tax" in yc
        assert "current_tax" in yc
        assert "difference" in yc
        assert yc["difference"] == round(yc["current_tax"] - yc["previous_tax"], 2)


# --- Reverse Calculator ---

def test_reverse_calculate():
    # First calculate forward to get a known net
    forward = client.post("/api/v1/calculate", json={"basic_salary": 4500.00})
    known_net = forward.json()["summary"]["net_take_home"]

    # Now reverse calculate
    response = client.post("/api/v1/reverse-calculate", json={
        "desired_net": known_net,
    })
    assert response.status_code == 200
    data = response.json()
    assert "required_basic_salary" in data
    assert "result" in data
    # The found salary should be close to 4500
    assert abs(data["required_basic_salary"] - 4500.00) < 1.0


def test_reverse_calculate_with_reliefs():
    response = client.post("/api/v1/reverse-calculate", json={
        "desired_net": 3000.00,
        "reliefs": {"marriage": True, "children": 2},
    })
    assert response.status_code == 200
    data = response.json()
    assert data["required_basic_salary"] > 0
    # Net should be close to 3000
    assert abs(data["result"]["summary"]["net_take_home"] - 3000.00) < 1.0


def test_reverse_invalid_net():
    response = client.post("/api/v1/reverse-calculate", json={"desired_net": -100})
    assert response.status_code == 422


# --- Tax Years Endpoint ---

def test_tax_years_endpoint():
    response = client.get("/api/v1/tax-years")
    assert response.status_code == 200
    data = response.json()
    assert "current_year" in data
    assert "available_years" in data
    assert "bands_by_year" in data
    assert data["current_year"] in data["available_years"]
    assert len(data["available_years"]) >= 2


# --- Tier 3 Voluntary Pension ---

def test_tier3_reduces_tax():
    # Without Tier 3
    without = client.post("/api/v1/calculate", json={"basic_salary": 5000.00})
    tax_without = without.json()["deductions"]["paye"]["total_tax"]

    # With Tier 3 at 5%
    with_t3 = client.post("/api/v1/calculate", json={"basic_salary": 5000.00, "tier3_rate": 0.05})
    data = with_t3.json()
    tax_with = data["deductions"]["paye"]["total_tax"]

    # Tier 3 is tax-deductible, so PAYE should be lower
    assert tax_with < tax_without
    assert data["deductions"]["tier3_pension"] is not None
    assert data["deductions"]["tier3_pension"]["amount"] == 250.00  # 5000 * 0.05
    assert data["deductions"]["tier3_pension"]["rate"] == 0.05


def test_tier3_zero_by_default():
    response = client.post("/api/v1/calculate", json={"basic_salary": 5000.00})
    data = response.json()
    assert data["deductions"]["tier3_pension"] is None


def test_tier3_max_rate_validation():
    response = client.post("/api/v1/calculate", json={"basic_salary": 5000.00, "tier3_rate": 0.20})
    assert response.status_code == 422


def test_tier3_included_in_total_deductions():
    response = client.post("/api/v1/calculate", json={"basic_salary": 5000.00, "tier3_rate": 0.10})
    data = response.json()
    ded = data["deductions"]
    total = ded["ssnit"]["amount"] + ded["tier2_pension"]["amount"] + ded["tier3_pension"]["amount"] + ded["paye"]["total_tax"]
    assert data["summary"]["total_deductions"] == round(total, 2)
