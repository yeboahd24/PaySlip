from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_non_resident_flat_tax():
    """Non-resident should pay flat 25% on chargeable income."""
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 5000.00,
        "is_non_resident": True,
    })
    assert response.status_code == 200
    data = response.json()

    ssnit = data["deductions"]["ssnit"]["amount"]  # 5000 * 0.055 = 275
    chargeable = data["deductions"]["paye"]["chargeable_income"]  # 5000 - 275 = 4725
    paye = data["deductions"]["paye"]["total_tax"]

    assert ssnit == 275.0
    assert chargeable == 4725.0
    assert paye == round(4725.0 * 0.25, 2)


def test_non_resident_no_reliefs():
    """Non-resident should have zero reliefs even if provided."""
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 5000.00,
        "is_non_resident": True,
        "reliefs": {"marriage": True, "children": 3, "old_age": True},
    })
    assert response.status_code == 200
    data = response.json()

    assert data["reliefs_applied"]["total"] == 0
    assert "personal" not in data["reliefs_applied"]


def test_non_resident_ssnit_still_applies():
    """SSNIT and Tier 2 still apply for non-residents."""
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 4000.00,
        "is_non_resident": True,
    })
    assert response.status_code == 200
    data = response.json()

    assert data["deductions"]["ssnit"]["amount"] == 220.0   # 4000 * 0.055
    assert data["deductions"]["tier2_pension"]["amount"] == 200.0  # 4000 * 0.05


def test_non_resident_single_band():
    """Non-resident should have exactly one band in breakdown."""
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 3000.00,
        "is_non_resident": True,
    })
    assert response.status_code == 200
    data = response.json()

    bands = data["deductions"]["paye"]["band_breakdown"]
    assert len(bands) == 1
    assert bands[0]["rate"] == 0.25


def test_non_resident_meta_tag():
    """Meta should contain tax_mode: non_resident."""
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 3000.00,
        "is_non_resident": True,
    })
    assert response.status_code == 200
    data = response.json()

    assert data["meta"]["tax_mode"] == "non_resident"


def test_resident_meta_tag():
    """Resident should have tax_mode: resident."""
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 3000.00,
    })
    assert response.status_code == 200
    data = response.json()

    assert data["meta"]["tax_mode"] == "resident"


def test_non_resident_no_year_comparison():
    """Non-resident should have no year comparison."""
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 5000.00,
        "is_non_resident": True,
    })
    assert response.status_code == 200
    data = response.json()

    assert data["year_comparison"] is None
    assert data["bonus_impact"] is None


def test_non_resident_no_tier3():
    """Non-resident should have no tier 3 pension."""
    response = client.post("/api/v1/calculate", json={
        "basic_salary": 5000.00,
        "is_non_resident": True,
        "tier3_rate": 0.10,
    })
    assert response.status_code == 200
    data = response.json()

    assert data["deductions"]["tier3_pension"] is None


def test_non_resident_reverse_mode():
    """Reverse calculation should work for non-residents."""
    response = client.post("/api/v1/reverse-calculate", json={
        "desired_net": 3000.00,
        "is_non_resident": True,
    })
    assert response.status_code == 200
    data = response.json()

    assert data["required_basic_salary"] > 0
    assert data["result"]["meta"]["tax_mode"] == "non_resident"
    # Verify the result net is close to desired
    assert abs(data["result"]["summary"]["net_take_home"] - 3000.00) < 1.0
