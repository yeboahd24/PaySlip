from app.services.paye import calculate_paye


def test_zero_tax_band():
    result = calculate_paye(400.00)
    assert result["total_tax"] == 0.0
    assert len(result["band_breakdown"]) == 1
    assert result["band_breakdown"][0]["rate"] == 0.00


def test_exactly_first_band():
    result = calculate_paye(490.00)
    assert result["total_tax"] == 0.0


def test_into_second_band():
    # 490 at 0% + 10 at 5% = 0.50
    result = calculate_paye(500.00)
    assert result["total_tax"] == 0.50
    assert len(result["band_breakdown"]) == 2


def test_multi_band_calculation():
    result = calculate_paye(4500.00)
    assert len(result["band_breakdown"]) >= 4
    assert result["total_tax"] > 0


def test_band_breakdown_sums_correctly():
    result = calculate_paye(3000.00)
    total = sum(b["tax"] for b in result["band_breakdown"])
    assert round(total, 2) == result["total_tax"]


def test_high_income_reaches_30_percent_band():
    result = calculate_paye(25000.00)
    assert len(result["band_breakdown"]) == 6
    top_band = result["band_breakdown"][-1]
    assert top_band["rate"] == 0.30


def test_very_high_income_reaches_top_band():
    result = calculate_paye(60000.00)
    assert len(result["band_breakdown"]) == 7
    top_band = result["band_breakdown"][-1]
    assert top_band["rate"] == 0.35


def test_zero_chargeable_income():
    result = calculate_paye(0)
    assert result["total_tax"] == 0.0
    assert result["band_breakdown"] == []


def test_chargeable_income_returned():
    result = calculate_paye(3000.00)
    assert result["chargeable_income"] == 3000.00
