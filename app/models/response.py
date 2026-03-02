from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TaxBand(BaseModel):
    band: int
    income_in_band: float
    rate: float
    tax: float


class PAYEDetail(BaseModel):
    chargeable_income: float
    total_tax: float
    band_breakdown: List[TaxBand]


class DeductionDetail(BaseModel):
    rate: float
    amount: float
    basis: str


class Deductions(BaseModel):
    ssnit: DeductionDetail
    tier2_pension: DeductionDetail
    tier3_pension: Optional[DeductionDetail] = None
    insurance: Optional[DeductionDetail] = None
    paye: PAYEDetail


class Summary(BaseModel):
    gross_income: float
    total_deductions: float
    net_take_home: float


class EmployerCost(BaseModel):
    employer_ssnit: DeductionDetail
    total_cost_to_employer: float


class BonusImpact(BaseModel):
    bonus_amount: float
    tax_on_bonus: float
    net_bonus: float
    effective_rate: float


class YearComparison(BaseModel):
    previous_year: int
    previous_tax: float
    current_tax: float
    difference: float


class PayslipResponse(BaseModel):
    summary: Summary
    deductions: Deductions
    reliefs_applied: dict
    employer_cost: EmployerCost
    bonus_impact: Optional[BonusImpact] = None
    year_comparison: Optional[YearComparison] = None
    meta: dict


class AggregateSummary(BaseModel):
    employee_count: int
    total_gross_income: float
    total_deductions: float
    total_net_take_home: float
    total_employer_cost: float
    average_gross_income: float
    average_net_take_home: float


class BulkPayslipResponse(BaseModel):
    results: List[PayslipResponse]
    aggregate: AggregateSummary


class ReverseResult(BaseModel):
    required_basic_salary: float
    result: PayslipResponse
