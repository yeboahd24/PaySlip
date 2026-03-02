from datetime import datetime, timezone

from app.config.tax_bands import (
    CURRENT_TAX_YEAR,
    EMPLOYER_SSNIT_RATE,
    HISTORIC_TAX_BANDS,
    INSURANCE_SCHEMES,
    NON_RESIDENT_RATE,
    PERSONAL_RELIEF_MONTHLY,
    RELIEF_AMOUNTS,
    SSNIT_RATE,
    TIER2_RATE,
    TIER3_MAX_RATE,
)
from app.models.request import BulkPayslipRequest, PayslipRequest, ReverseRequest
from app.models.response import (
    AggregateSummary,
    BonusImpact,
    BulkPayslipResponse,
    DeductionDetail,
    Deductions,
    EmployerCost,
    PAYEDetail,
    PayslipResponse,
    ReverseResult,
    Summary,
    TaxBand,
    YearComparison,
)
from app.services.paye import calculate_flat_paye, calculate_paye, calculate_paye_with_bands
from app.services.ssnit import calculate_insurance, calculate_ssnit, calculate_tier2


def _resolve_insurance(request: PayslipRequest, basic: float) -> tuple[float, float]:
    """Resolve insurance rate and amount from request. Returns (rate, amount)."""
    if not request.insurance_scheme:
        return 0.0, 0.0
    if request.insurance_scheme == "custom":
        rate = request.insurance_custom_rate
    else:
        rate = INSURANCE_SCHEMES[request.insurance_scheme]["rate"]
    return rate, calculate_insurance(basic, rate)


def calculate_payslip(request: PayslipRequest) -> PayslipResponse:
    basic = request.basic_salary
    allowances = request.allowances or []
    reliefs = request.reliefs
    is_non_resident = request.is_non_resident

    # Gross income
    total_allowances = sum(a.amount for a in allowances)
    gross_income = round(basic + total_allowances, 2)

    # SSNIT & Tier 2 (on basic salary only) — applies to all
    ssnit_amount = calculate_ssnit(basic)
    tier2_amount = calculate_tier2(basic)

    # Insurance (on basic salary, tax-deductible)
    insurance_rate, insurance_amount = _resolve_insurance(request, basic)

    if is_non_resident:
        # Non-residents: no reliefs, no tier 3, flat 25% tax
        chargeable_income = round(max(gross_income - ssnit_amount - insurance_amount, 0), 2)
        paye_result = calculate_flat_paye(chargeable_income, NON_RESIDENT_RATE)

        total_deductions = round(ssnit_amount + tier2_amount + insurance_amount + paye_result["total_tax"], 2)
        net_take_home = round(gross_income - total_deductions, 2)

        employer_ssnit_amount = round(basic * EMPLOYER_SSNIT_RATE, 2)
        total_cost = round(gross_income + employer_ssnit_amount, 2)

        return PayslipResponse(
            summary=Summary(
                gross_income=gross_income,
                total_deductions=total_deductions,
                net_take_home=net_take_home,
            ),
            deductions=Deductions(
                ssnit=DeductionDetail(rate=SSNIT_RATE, amount=ssnit_amount, basis="Basic salary only"),
                tier2_pension=DeductionDetail(rate=TIER2_RATE, amount=tier2_amount, basis="Basic salary only"),
                tier3_pension=None,
                insurance=DeductionDetail(
                    rate=insurance_rate,
                    amount=insurance_amount,
                    basis="Basic salary only",
                ) if insurance_amount > 0 else None,
                paye=PAYEDetail(
                    chargeable_income=paye_result["chargeable_income"],
                    total_tax=paye_result["total_tax"],
                    band_breakdown=[TaxBand(**b) for b in paye_result["band_breakdown"]],
                ),
            ),
            reliefs_applied={"total": 0},
            employer_cost=EmployerCost(
                employer_ssnit=DeductionDetail(rate=EMPLOYER_SSNIT_RATE, amount=employer_ssnit_amount, basis="Basic salary only"),
                total_cost_to_employer=total_cost,
            ),
            bonus_impact=None,
            year_comparison=None,
            meta={
                "tax_year": CURRENT_TAX_YEAR,
                "currency": "GHS",
                "tax_mode": "non_resident",
                "calculated_at": datetime.now(timezone.utc).isoformat(),
            },
        )

    # --- Resident path (unchanged) ---

    # Tier 3 voluntary pension (on gross, tax-deductible)
    tier3_rate = request.tier3_rate or 0
    tier3_amount = round(gross_income * tier3_rate, 2) if tier3_rate > 0 else 0.0

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

    # Chargeable income (Tier 3 and insurance are tax-deductible)
    taxable_allowances = sum(a.amount for a in allowances if a.taxable)
    chargeable_income = basic + taxable_allowances - ssnit_amount - tier3_amount - insurance_amount - total_relief
    chargeable_income = round(max(chargeable_income, 0), 2)

    # PAYE
    paye_result = calculate_paye(chargeable_income)

    # Total deductions
    total_deductions = round(ssnit_amount + tier2_amount + tier3_amount + insurance_amount + paye_result["total_tax"], 2)
    net_take_home = round(gross_income - total_deductions, 2)

    # Employer cost
    employer_ssnit_amount = round(basic * EMPLOYER_SSNIT_RATE, 2)
    total_cost = round(gross_income + employer_ssnit_amount, 2)

    # Bonus impact (if provided)
    bonus_impact = None
    if request.bonus and request.bonus > 0:
        bonus_impact = _calculate_bonus_impact(
            chargeable_income, request.bonus
        )

    # Year-over-year comparison
    year_comparison = _calculate_year_comparison(chargeable_income)

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
            tier3_pension=DeductionDetail(
                rate=tier3_rate,
                amount=tier3_amount,
                basis="Gross salary",
            ) if tier3_amount > 0 else None,
            insurance=DeductionDetail(
                rate=insurance_rate,
                amount=insurance_amount,
                basis="Basic salary only",
            ) if insurance_amount > 0 else None,
            paye=PAYEDetail(
                chargeable_income=paye_result["chargeable_income"],
                total_tax=paye_result["total_tax"],
                band_breakdown=[TaxBand(**b) for b in paye_result["band_breakdown"]],
            ),
        ),
        reliefs_applied=reliefs_applied,
        employer_cost=EmployerCost(
            employer_ssnit=DeductionDetail(
                rate=EMPLOYER_SSNIT_RATE,
                amount=employer_ssnit_amount,
                basis="Basic salary only",
            ),
            total_cost_to_employer=total_cost,
        ),
        bonus_impact=bonus_impact,
        year_comparison=year_comparison,
        meta={
            "tax_year": CURRENT_TAX_YEAR,
            "currency": "GHS",
            "tax_mode": "resident",
            "calculated_at": datetime.now(timezone.utc).isoformat(),
        },
    )


def _calculate_bonus_impact(base_chargeable: float, bonus: float) -> BonusImpact:
    """Calculate the marginal tax impact of a one-off bonus."""
    base_tax = calculate_paye(base_chargeable)["total_tax"]
    with_bonus_tax = calculate_paye(base_chargeable + bonus)["total_tax"]
    tax_on_bonus = round(with_bonus_tax - base_tax, 2)
    net_bonus = round(bonus - tax_on_bonus, 2)
    effective_rate = round(tax_on_bonus / bonus, 4) if bonus > 0 else 0.0

    return BonusImpact(
        bonus_amount=bonus,
        tax_on_bonus=tax_on_bonus,
        net_bonus=net_bonus,
        effective_rate=effective_rate,
    )


def _calculate_year_comparison(chargeable_income: float) -> YearComparison | None:
    """Compare current year tax with most recent previous year."""
    previous_year = CURRENT_TAX_YEAR - 1
    if previous_year not in HISTORIC_TAX_BANDS:
        return None

    previous_bands = HISTORIC_TAX_BANDS[previous_year]
    previous_result = calculate_paye_with_bands(chargeable_income, previous_bands)
    current_result = calculate_paye(chargeable_income)

    return YearComparison(
        previous_year=previous_year,
        previous_tax=previous_result["total_tax"],
        current_tax=current_result["total_tax"],
        difference=round(current_result["total_tax"] - previous_result["total_tax"], 2),
    )


def reverse_calculate(request: ReverseRequest) -> ReverseResult:
    """Given a desired net take-home, find the required basic salary."""
    desired_net = request.desired_net
    allowances = request.allowances or []
    reliefs = request.reliefs
    is_non_resident = request.is_non_resident

    # Binary search for the right basic salary
    low = 0.0
    high = desired_net * 3  # Upper bound: assume at least 1/3 goes to tax

    insurance_scheme = request.insurance_scheme
    insurance_custom_rate = request.insurance_custom_rate

    for _ in range(100):  # Max iterations
        mid = (low + high) / 2
        trial_request = PayslipRequest(
            basic_salary=round(mid, 2) if mid > 0 else 0.01,
            allowances=allowances,
            reliefs=reliefs,
            is_non_resident=is_non_resident,
            insurance_scheme=insurance_scheme,
            insurance_custom_rate=insurance_custom_rate,
        )
        trial_result = calculate_payslip(trial_request)
        trial_net = trial_result.summary.net_take_home

        if abs(trial_net - desired_net) < 0.01:
            break
        elif trial_net < desired_net:
            low = mid
        else:
            high = mid

    final_salary = round((low + high) / 2, 2)
    final_request = PayslipRequest(
        basic_salary=final_salary,
        allowances=allowances,
        reliefs=reliefs,
        is_non_resident=is_non_resident,
        insurance_scheme=insurance_scheme,
        insurance_custom_rate=insurance_custom_rate,
    )
    final_result = calculate_payslip(final_request)

    return ReverseResult(
        required_basic_salary=final_salary,
        result=final_result,
    )


def calculate_bulk(request: BulkPayslipRequest) -> BulkPayslipResponse:
    """Calculate payslips for multiple employees and aggregate totals."""
    results = [calculate_payslip(emp) for emp in request.employees]

    total_gross = sum(r.summary.gross_income for r in results)
    total_ded = sum(r.summary.total_deductions for r in results)
    total_net = sum(r.summary.net_take_home for r in results)
    total_employer = sum(r.employer_cost.total_cost_to_employer for r in results)
    count = len(results)

    return BulkPayslipResponse(
        results=results,
        aggregate=AggregateSummary(
            employee_count=count,
            total_gross_income=round(total_gross, 2),
            total_deductions=round(total_ded, 2),
            total_net_take_home=round(total_net, 2),
            total_employer_cost=round(total_employer, 2),
            average_gross_income=round(total_gross / count, 2),
            average_net_take_home=round(total_net / count, 2),
        ),
    )
