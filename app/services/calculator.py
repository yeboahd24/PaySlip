from datetime import datetime, timezone

from app.config.tax_bands import (
    PERSONAL_RELIEF_MONTHLY,
    RELIEF_AMOUNTS,
    SSNIT_RATE,
    TIER2_RATE,
)
from app.models.request import PayslipRequest
from app.models.response import (
    DeductionDetail,
    Deductions,
    PAYEDetail,
    PayslipResponse,
    Summary,
    TaxBand,
)
from app.services.paye import calculate_paye
from app.services.ssnit import calculate_ssnit, calculate_tier2


def calculate_payslip(request: PayslipRequest) -> PayslipResponse:
    basic = request.basic_salary
    allowances = request.allowances or []
    reliefs = request.reliefs

    # Gross income
    total_allowances = sum(a.amount for a in allowances)
    gross_income = round(basic + total_allowances, 2)

    # SSNIT & Tier 2 (on basic salary only)
    ssnit_amount = calculate_ssnit(basic)
    tier2_amount = calculate_tier2(basic)

    # Reliefs
    reliefs_applied = {"personal": PERSONAL_RELIEF_MONTHLY}
    total_relief = PERSONAL_RELIEF_MONTHLY

    if reliefs.marriage:
        reliefs_applied["marriage"] = RELIEF_AMOUNTS["marriage"]
        total_relief += RELIEF_AMOUNTS["marriage"]

    if reliefs.children > 0:
        child_relief = reliefs.children * RELIEF_AMOUNTS["child_education"]
        reliefs_applied["child_education"] = round(child_relief, 2)
        total_relief += child_relief

    if reliefs.disability:
        disability_relief = round(gross_income * 0.25, 2)
        reliefs_applied["disability"] = disability_relief
        total_relief += disability_relief

    if reliefs.old_age:
        reliefs_applied["old_age"] = RELIEF_AMOUNTS["old_age"]
        total_relief += RELIEF_AMOUNTS["old_age"]

    reliefs_applied["total"] = round(total_relief, 2)

    # Chargeable income
    taxable_allowances = sum(a.amount for a in allowances if a.taxable)
    chargeable_income = basic + taxable_allowances - ssnit_amount - total_relief
    chargeable_income = round(max(chargeable_income, 0), 2)

    # PAYE
    paye_result = calculate_paye(chargeable_income)

    # Total deductions
    total_deductions = round(ssnit_amount + tier2_amount + paye_result["total_tax"], 2)
    net_take_home = round(gross_income - total_deductions, 2)

    return PayslipResponse(
        summary=Summary(
            gross_income=gross_income,
            total_deductions=total_deductions,
            net_take_home=net_take_home,
        ),
        deductions=Deductions(
            ssnit=DeductionDetail(
                rate=SSNIT_RATE,
                amount=ssnit_amount,
                basis="Basic salary only",
            ),
            tier2_pension=DeductionDetail(
                rate=TIER2_RATE,
                amount=tier2_amount,
                basis="Basic salary only",
            ),
            paye=PAYEDetail(
                chargeable_income=paye_result["chargeable_income"],
                total_tax=paye_result["total_tax"],
                band_breakdown=[TaxBand(**b) for b in paye_result["band_breakdown"]],
            ),
        ),
        reliefs_applied=reliefs_applied,
        meta={
            "tax_year": datetime.now(timezone.utc).year,
            "currency": "GHS",
            "calculated_at": datetime.now(timezone.utc).isoformat(),
        },
    )
