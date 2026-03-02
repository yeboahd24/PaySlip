from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_bulk_single_employee():
    """Bulk with one employee should match single calculate."""
    single = client.post("/api/v1/calculate", json={"basic_salary": 5000.00})
    bulk = client.post("/api/v1/calculate-bulk", json={
        "employees": [{"basic_salary": 5000.00}],
    })
    assert bulk.status_code == 200
    bulk_data = bulk.json()

    assert len(bulk_data["results"]) == 1
    assert bulk_data["results"][0]["summary"] == single.json()["summary"]
    assert bulk_data["aggregate"]["employee_count"] == 1


def test_bulk_multiple_employees():
    """Bulk with multiple employees should return correct count."""
    response = client.post("/api/v1/calculate-bulk", json={
        "employees": [
            {"basic_salary": 3000.00},
            {"basic_salary": 5000.00},
            {"basic_salary": 8000.00},
        ],
    })
    assert response.status_code == 200
    data = response.json()

    assert len(data["results"]) == 3
    assert data["aggregate"]["employee_count"] == 3


def test_bulk_aggregate_totals():
    """Aggregate totals should sum individual results."""
    response = client.post("/api/v1/calculate-bulk", json={
        "employees": [
            {"basic_salary": 3000.00},
            {"basic_salary": 5000.00},
        ],
    })
    data = response.json()
    results = data["results"]
    agg = data["aggregate"]

    total_gross = sum(r["summary"]["gross_income"] for r in results)
    total_ded = sum(r["summary"]["total_deductions"] for r in results)
    total_net = sum(r["summary"]["net_take_home"] for r in results)

    assert agg["total_gross_income"] == round(total_gross, 2)
    assert agg["total_deductions"] == round(total_ded, 2)
    assert agg["total_net_take_home"] == round(total_net, 2)


def test_bulk_aggregate_averages():
    """Aggregate averages should be totals / count."""
    response = client.post("/api/v1/calculate-bulk", json={
        "employees": [
            {"basic_salary": 4000.00},
            {"basic_salary": 6000.00},
        ],
    })
    data = response.json()
    agg = data["aggregate"]

    assert agg["average_gross_income"] == round(agg["total_gross_income"] / 2, 2)
    assert agg["average_net_take_home"] == round(agg["total_net_take_home"] / 2, 2)


def test_bulk_limit_exceeded():
    """More than 50 employees should return 422."""
    employees = [{"basic_salary": 1000.00}] * 51
    response = client.post("/api/v1/calculate-bulk", json={"employees": employees})
    assert response.status_code == 422


def test_bulk_empty_list():
    """Empty employees list should return 422."""
    response = client.post("/api/v1/calculate-bulk", json={"employees": []})
    assert response.status_code == 422


def test_bulk_mixed_resident_non_resident():
    """Bulk should handle mixed resident and non-resident employees."""
    response = client.post("/api/v1/calculate-bulk", json={
        "employees": [
            {"basic_salary": 5000.00, "is_non_resident": False},
            {"basic_salary": 5000.00, "is_non_resident": True},
        ],
    })
    assert response.status_code == 200
    data = response.json()

    assert data["results"][0]["meta"]["tax_mode"] == "resident"
    assert data["results"][1]["meta"]["tax_mode"] == "non_resident"
    # Non-resident pays more tax (flat 25% vs progressive)
    assert data["results"][1]["deductions"]["paye"]["total_tax"] > data["results"][0]["deductions"]["paye"]["total_tax"]


def test_bulk_employer_cost_aggregate():
    """Aggregate employer cost should sum individual employer costs."""
    response = client.post("/api/v1/calculate-bulk", json={
        "employees": [
            {"basic_salary": 3000.00},
            {"basic_salary": 7000.00},
        ],
    })
    data = response.json()
    results = data["results"]
    total_ec = sum(r["employer_cost"]["total_cost_to_employer"] for r in results)
    assert data["aggregate"]["total_employer_cost"] == round(total_ec, 2)
