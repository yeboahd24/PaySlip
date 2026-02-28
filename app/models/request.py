from pydantic import BaseModel, Field
from typing import List, Optional


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
