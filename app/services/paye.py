from app.config.tax_bands import MONTHLY_TAX_BANDS, NON_RESIDENT_RATE


def calculate_paye(chargeable_income: float) -> dict:
    return calculate_paye_with_bands(chargeable_income, MONTHLY_TAX_BANDS)


def calculate_flat_paye(chargeable_income: float, rate: float = NON_RESIDENT_RATE) -> dict:
    """Flat-rate PAYE for non-residents (no progressive bands)."""
    tax = round(chargeable_income * rate, 2)
    return {
        "chargeable_income": round(chargeable_income, 2),
        "total_tax": tax,
        "band_breakdown": [
            {
                "band": 1,
                "income_in_band": round(chargeable_income, 2),
                "rate": rate,
                "tax": tax,
            }
        ],
    }


def calculate_paye_with_bands(chargeable_income: float, bands: list) -> dict:
    total_tax = 0.0
    breakdown = []
    remaining = chargeable_income

    for i, band in enumerate(bands):
        lower = band["lower"]
        upper = band["upper"]
        rate = band["rate"]

        band_size = (upper - lower) if upper else remaining
        income_in_band = min(remaining, band_size)

        if income_in_band <= 0:
            break

        tax = round(income_in_band * rate, 2)
        total_tax += tax
        breakdown.append({
            "band": i + 1,
            "income_in_band": round(income_in_band, 2),
            "rate": rate,
            "tax": tax,
        })
        remaining -= income_in_band

    return {
        "chargeable_income": round(chargeable_income, 2),
        "total_tax": round(total_tax, 2),
        "band_breakdown": breakdown,
    }
