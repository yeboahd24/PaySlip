# Monthly PAYE bands — update here when GRA revises rates

# Current year bands (2026)
MONTHLY_TAX_BANDS = [
    {"lower": 0, "upper": 490, "rate": 0.00},
    {"lower": 490, "upper": 600, "rate": 0.05},
    {"lower": 600, "upper": 730, "rate": 0.10},
    {"lower": 730, "upper": 3896.67, "rate": 0.175},
    {"lower": 3896.67, "upper": 19896.67, "rate": 0.25},
    {"lower": 19896.67, "upper": 50416.67, "rate": 0.30},
    {"lower": 50416.67, "upper": None, "rate": 0.35},
]

# Historic tax bands for year-over-year comparison
HISTORIC_TAX_BANDS = {
    2025: [
        {"lower": 0, "upper": 490, "rate": 0.00},
        {"lower": 490, "upper": 600, "rate": 0.05},
        {"lower": 600, "upper": 730, "rate": 0.10},
        {"lower": 730, "upper": 3896.67, "rate": 0.175},
        {"lower": 3896.67, "upper": 19896.67, "rate": 0.25},
        {"lower": 19896.67, "upper": 50416.67, "rate": 0.30},
        {"lower": 50416.67, "upper": None, "rate": 0.35},
    ],
    2024: [
        {"lower": 0, "upper": 402, "rate": 0.00},
        {"lower": 402, "upper": 512, "rate": 0.05},
        {"lower": 512, "upper": 642, "rate": 0.10},
        {"lower": 642, "upper": 3642, "rate": 0.175},
        {"lower": 3642, "upper": 19642, "rate": 0.25},
        {"lower": 19642, "upper": 50000, "rate": 0.30},
        {"lower": 50000, "upper": None, "rate": 0.35},
    ],
}

CURRENT_TAX_YEAR = 2026

PERSONAL_RELIEF_MONTHLY = 365.00

RELIEF_AMOUNTS = {
    "marriage": 100.00,        # monthly
    "child_education": 50.00,  # per child per month (max 3)
    "old_age": 125.00,         # monthly
}

# Employee deduction rates
SSNIT_RATE = 0.055
TIER2_RATE = 0.05

# Employer contribution rates
EMPLOYER_SSNIT_RATE = 0.13    # 13% of basic salary
EMPLOYER_TIER2_RATE = 0.00    # Employer Tier 2 is part of the 13% SSNIT

# Tier 3 voluntary pension
TIER3_MAX_RATE = 0.165        # Up to 16.5% of gross salary, tax-deductible

# Non-resident flat tax rate
NON_RESIDENT_RATE = 0.25

# Predefined insurance schemes (rate applied to basic salary, tax-deductible)
INSURANCE_SCHEMES = {
    "ges_teacher": {"name": "GES Teacher's Insurance", "rate": 0.01},
}
