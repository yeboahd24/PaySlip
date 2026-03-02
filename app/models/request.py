from pydantic import BaseModel, Field, model_validator
from typing import List, Optional

from app.config.tax_bands import INSURANCE_SCHEMES


class Allowance(BaseModel):
    name: str
    amount: float = Field(gt=0)
    taxable: bool = True


class Reliefs(BaseModel):
    marriage: bool = False
    children: int = Field(default=0, ge=0, le=3)
    disability: bool = False
    old_age: bool = False


class PayslipRequest(BaseModel):
    basic_salary: float = Field(gt=0, description="Monthly basic salary in GHS")
    allowances: Optional[List[Allowance]] = []
    reliefs: Optional[Reliefs] = Reliefs()
    bonus: Optional[float] = Field(default=None, ge=0, description="One-off bonus amount in GHS")
    tier3_rate: Optional[float] = Field(default=0, ge=0, le=0.165, description="Tier 3 voluntary pension rate (0 to 0.165)")
    is_non_resident: bool = False
    insurance_scheme: Optional[str] = Field(default=None, description="Key from INSURANCE_SCHEMES or 'custom'")
    insurance_custom_rate: Optional[float] = Field(default=None, ge=0, le=1, description="Custom insurance rate (0-1), required when scheme is 'custom'")

    @model_validator(mode="after")
    def validate_insurance(self):
        if self.insurance_scheme is not None:
            if self.insurance_scheme != "custom" and self.insurance_scheme not in INSURANCE_SCHEMES:
                raise ValueError(f"Unknown insurance scheme '{self.insurance_scheme}'. Valid schemes: {list(INSURANCE_SCHEMES.keys())} or 'custom'")
            if self.insurance_scheme == "custom" and self.insurance_custom_rate is None:
                raise ValueError("insurance_custom_rate is required when insurance_scheme is 'custom'")
        return self


class BulkPayslipRequest(BaseModel):
    employees: List[PayslipRequest] = Field(..., min_length=1, max_length=50, description="List of employee payslip requests (max 50)")


class ReverseRequest(BaseModel):
    desired_net: float = Field(gt=0, description="Desired monthly take-home pay in GHS")
    allowances: Optional[List[Allowance]] = []
    reliefs: Optional[Reliefs] = Reliefs()
    is_non_resident: bool = False
    insurance_scheme: Optional[str] = Field(default=None, description="Key from INSURANCE_SCHEMES or 'custom'")
    insurance_custom_rate: Optional[float] = Field(default=None, ge=0, le=1, description="Custom insurance rate (0-1), required when scheme is 'custom'")

    @model_validator(mode="after")
    def validate_insurance(self):
        if self.insurance_scheme is not None:
            if self.insurance_scheme != "custom" and self.insurance_scheme not in INSURANCE_SCHEMES:
                raise ValueError(f"Unknown insurance scheme '{self.insurance_scheme}'. Valid schemes: {list(INSURANCE_SCHEMES.keys())} or 'custom'")
            if self.insurance_scheme == "custom" and self.insurance_custom_rate is None:
                raise ValueError("insurance_custom_rate is required when insurance_scheme is 'custom'")
        return self
