# Monthly PAYE bands — update here when GRA revises rates
MONTHLY_TAX_BANDS = [
    {"lower": 0, "upper": 490, "rate": 0.00},
    {"lower": 490, "upper": 600, "rate": 0.05},
    {"lower": 600, "upper": 730, "rate": 0.10},
    {"lower": 730, "upper": 3896.67, "rate": 0.175},
    {"lower": 3896.67, "upper": 19896.67, "rate": 0.25},
    {"lower": 19896.67, "upper": 50416.67, "rate": 0.30},
    {"lower": 50416.67, "upper": None, "rate": 0.35},
]

PERSONAL_RELIEF_MONTHLY = 365.00

RELIEF_AMOUNTS = {
    "marriage": 100.00,        # monthly
    "child_education": 50.00,  # per child per month (max 3)
    "old_age": 125.00,         # monthly
}

SSNIT_RATE = 0.055
TIER2_RATE = 0.05
