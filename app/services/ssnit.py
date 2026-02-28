from app.config.tax_bands import SSNIT_RATE, TIER2_RATE


def calculate_ssnit(basic_salary: float) -> float:
    return round(basic_salary * SSNIT_RATE, 2)


def calculate_tier2(basic_salary: float) -> float:
    return round(basic_salary * TIER2_RATE, 2)
