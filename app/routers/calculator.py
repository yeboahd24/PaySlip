from fastapi import APIRouter

from app.config.tax_bands import (
    MONTHLY_TAX_BANDS,
    PERSONAL_RELIEF_MONTHLY,
    RELIEF_AMOUNTS,
)
from app.models.request import PayslipRequest
from app.models.response import PayslipResponse
from app.services.calculator import calculate_payslip

router = APIRouter()


@router.post("/calculate", response_model=PayslipResponse)
def calculate(request: PayslipRequest):
    return calculate_payslip(request)


@router.get("/tax-bands")
def get_tax_bands():
    return {"tax_bands": MONTHLY_TAX_BANDS}


@router.get("/reliefs")
def get_reliefs():
    return {
        "personal_relief_monthly": PERSONAL_RELIEF_MONTHLY,
        "optional_reliefs": RELIEF_AMOUNTS,
    }


@router.get("/health")
def health():
    return {"status": "ok"}
