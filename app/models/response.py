from pydantic import BaseModel
from typing import List
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
    paye: PAYEDetail


class Summary(BaseModel):
    gross_income: float
    total_deductions: float
    net_take_home: float


class PayslipResponse(BaseModel):
    summary: Summary
    deductions: Deductions
    reliefs_applied: dict
    meta: dict
