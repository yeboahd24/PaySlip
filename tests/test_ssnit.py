from app.services.ssnit import calculate_ssnit, calculate_tier2


def test_ssnit_basic_calculation():
    assert calculate_ssnit(4500.00) == 247.50


def test_ssnit_zero_salary():
    assert calculate_ssnit(0.01) == 0.0


def test_ssnit_rounding():
    # 1000 * 0.055 = 55.0
    assert calculate_ssnit(1000.00) == 55.00


def test_tier2_basic_calculation():
    assert calculate_tier2(4500.00) == 225.00


def test_tier2_zero_salary():
    assert calculate_tier2(0.01) == 0.0


def test_tier2_rounding():
    # 1000 * 0.05 = 50.0
    assert calculate_tier2(1000.00) == 50.00


def test_ssnit_small_salary():
    # 500 * 0.055 = 27.5
    assert calculate_ssnit(500.00) == 27.50


def test_tier2_small_salary():
    # 500 * 0.05 = 25.0
    assert calculate_tier2(500.00) == 25.00
