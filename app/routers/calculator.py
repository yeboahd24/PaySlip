from fastapi import APIRouter

from app.config.tax_bands import (
    CURRENT_TAX_YEAR,
    HISTORIC_TAX_BANDS,
    MONTHLY_TAX_BANDS,
    PERSONAL_RELIEF_MONTHLY,
    RELIEF_AMOUNTS,
)
from app.models.request import BulkPayslipRequest, PayslipRequest, ReverseRequest
from app.models.response import BulkPayslipResponse, PayslipResponse, ReverseResult
from app.services.calculator import calculate_bulk, calculate_payslip, reverse_calculate

router = APIRouter()


@router.post("/calculate", response_model=PayslipResponse)
def calculate(request: PayslipRequest):
    return calculate_payslip(request)


@router.post("/reverse-calculate", response_model=ReverseResult)
def reverse(request: ReverseRequest):
    return reverse_calculate(request)


@router.post("/calculate-bulk", response_model=BulkPayslipResponse)
def bulk(request: BulkPayslipRequest):
    return calculate_bulk(request)


@router.get("/tax-bands")
def get_tax_bands():
    return {"tax_bands": MONTHLY_TAX_BANDS}


@router.get("/tax-years")
def get_tax_years():
    years = sorted(set([CURRENT_TAX_YEAR] + list(HISTORIC_TAX_BANDS.keys())), reverse=True)
    return {
        "current_year": CURRENT_TAX_YEAR,
        "available_years": years,
        "bands_by_year": {
            CURRENT_TAX_YEAR: MONTHLY_TAX_BANDS,
            **HISTORIC_TAX_BANDS,
        },
    }


@router.get("/reliefs")
def get_reliefs():
    return {
        "personal_relief_monthly": PERSONAL_RELIEF_MONTHLY,
        "optional_reliefs": RELIEF_AMOUNTS,
    }


@router.get("/health")
def health():
    return {"status": "ok"}
