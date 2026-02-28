# Ghana Take-Home Pay Calculator
### Technical Design Document v1.1

---

## 1. Project Overview

A stateless REST API built with FastAPI that calculates a Ghanaian employee's net take-home pay based on GRA's PAYE tax bands, SSNIT, and Tier 2 pension rules. The frontend consumes the API and presents a transparent, band-by-band breakdown of all deductions.

**Design principle:** One input → one detailed calculation response. No user accounts, no data persistence, no payment processing.

---

## 2. System Architecture

```
┌─────────────────┐         HTTPS          ┌──────────────────────┐
│   Frontend      │  ─────────────────────▶ │   FastAPI Backend    │
│  (React / HTML) │ ◀─────────────────────  │  (Render / Railway)  │
└─────────────────┘       JSON REST         └──────────────────────┘
```

- **Backend:** FastAPI (Python 3.11+)
- **Frontend:** React + Tailwind CSS (Vite)
- **Hosting:** Render (free tier) for API, Vercel/Netlify for frontend
- **No database required**

---

## 3. Project Structure

```
ghana-payslip-api/
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI app entry point
│   ├── routers/
│   │   └── calculator.py     # /calculate endpoint
│   ├── models/
│   │   ├── request.py        # Pydantic input models
│   │   └── response.py       # Pydantic output models
│   ├── services/
│   │   ├── ssnit.py          # SSNIT & Tier 2 logic
│   │   ├── paye.py           # PAYE tax band logic
│   │   └── calculator.py     # Orchestrates all services
│   └── config/
│       └── tax_bands.py      # GRA tax bands & rates (easy to update)
├── frontend/
│   ├── index.html
│   ├── vite.config.js        # Tailwind plugin + dev proxy to :8000
│   ├── package.json
│   ├── .env                  # VITE_API_URL
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            # Two-column responsive layout
│       ├── index.css          # Tailwind + Ghana theme colors
│       ├── api/
│       │   └── client.js      # fetch wrapper, base URL from env
│       ├── hooks/
│       │   └── useCalculator.js  # calculate() → {result, loading, error}
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── Footer.jsx
│       │   ├── form/
│       │   │   ├── CalculatorForm.jsx   # Parent form, owns form state
│       │   │   ├── SalaryInput.jsx      # GHS-prefixed number input
│       │   │   ├── AllowanceList.jsx    # Dynamic add/remove rows
│       │   │   ├── AllowanceRow.jsx     # name + amount + taxable toggle
│       │   │   └── ReliefSelector.jsx   # Checkboxes + children stepper
│       │   └── results/
│       │       ├── ResultsPanel.jsx     # Container for all results
│       │       ├── SummaryCards.jsx     # Gross, deductions, net cards
│       │       ├── DeductionDetails.jsx # SSNIT, Tier 2, PAYE amounts
│       │       ├── BandBreakdown.jsx    # PAYE band table
│       │       └── ReliefsApplied.jsx   # Applied reliefs list
│       └── utils/
│           └── formatCurrency.js  # "GHS 1,234.56" formatter
├── tests/
│   ├── test_ssnit.py
│   ├── test_paye.py
│   └── test_calculator.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .env
```

---

## 4. Calculation Rules

### 4.1 SSNIT (Social Security)
- Employee contribution: **5.5% of basic salary**
- Applied before tax calculation
- Capped at a ceiling set by SSNIT (verify current ceiling on ssnit.org.gh)

### 4.2 Tier 2 Pension
- Employee contribution: **5% of basic salary**
- Goes to an approved occupational pension fund
- Also deducted before tax

### 4.3 PAYE (Chargeable Income Calculation)

```
Chargeable Income = Basic Salary + Taxable Allowances
                  - SSNIT Contribution
                  - Approved Reliefs
```

**Personal Relief:** GHS 365/month (GHS 4,380/year) — automatically applied.

**Optional Reliefs (user-selected):**
| Relief | Annual Amount |
|---|---|
| Marriage/responsibility | GHS 1,200 |
| Child education (per child, max 3) | GHS 600 |
| Disability | 25% of income |
| Old age (60+) | GHS 1,500 |

### 4.4 PAYE Tax Bands (Monthly — verify against latest GRA schedule)

| Band | Monthly Income (GHS) | Annual Equivalent (GHS) | Rate |
|---|---|---|---|
| 1st | 0 – 490 | 0 – 5,880 | 0% |
| 2nd | 490 – 600 | 5,880 – 7,200 | 5% |
| 3rd | 600 – 730 | 7,200 – 8,760 | 10% |
| 4th | 730 – 3,896.67 | 8,760 – 46,760 | 17.5% |
| 5th | 3,896.67 – 19,896.67 | 46,760 – 238,760 | 25% |
| 6th | 19,896.67 – 50,416.67 | 238,760 – 605,000 | 30% |
| 7th | Above 50,416.67 | Above 605,000 | 35% |

> ⚠️ These bands change periodically. Store them in `config/tax_bands.py` so they can be updated without touching business logic.
> Rates last verified against [PWC Ghana Tax Summary](https://taxsummaries.pwc.com/ghana/individual/taxes-on-personal-income) and [GRA](https://gra.gov.gh/portfolio/paye/) (August 2025).

---

## 5. API Design

### Base URL
```
https://your-api.onrender.com/api/v1
```

### 5.1 `POST /calculate`

**Request Body:**
```json
{
  "basic_salary": 4500.00,
  "allowances": [
    { "name": "Transport", "amount": 500.00, "taxable": false },
    { "name": "Housing", "amount": 800.00, "taxable": true }
  ],
  "reliefs": {
    "marriage": false,
    "children": 2,
    "disability": false,
    "old_age": false
  },
  "currency": "GHS"
}
```

**Response Body:**
```json
{
  "summary": {
    "gross_income": 5800.00,
    "total_deductions": 1423.50,
    "net_take_home": 4376.50
  },
  "deductions": {
    "ssnit": {
      "rate": 0.055,
      "amount": 247.50,
      "basis": "Basic salary only"
    },
    "tier2_pension": {
      "rate": 0.05,
      "amount": 225.00,
      "basis": "Basic salary only"
    },
    "paye": {
      "chargeable_income": 4922.50,
      "total_tax": 951.00,
      "band_breakdown": [
        { "band": 1, "income_in_band": 490.00, "rate": 0.00, "tax": 0.00 },
        { "band": 2, "income_in_band": 110.00, "rate": 0.05, "tax": 5.50 },
        { "band": 3, "income_in_band": 130.00, "rate": 0.10, "tax": 13.00 },
        { "band": 4, "income_in_band": 3166.67, "rate": 0.175, "tax": 554.17 },
        { "band": 5, "income_in_band": 1025.83, "rate": 0.25, "tax": 256.46 }
      ]
    }
  },
  "reliefs_applied": {
    "personal": 365.00,
    "child_education": 100.00,
    "total": 465.00
  },
  "meta": {
    "tax_year": 2025,
    "currency": "GHS",
    "calculated_at": "2026-02-27T10:00:00Z"
  }
}
```

### 5.2 `GET /tax-bands`
Returns the current tax bands and rates in use. Useful for the frontend to display a reference table.

### 5.3 `GET /reliefs`
Returns all available reliefs and their amounts.

### 5.4 `GET /health`
Health check endpoint.

---

## 6. Pydantic Models

### Request (`models/request.py`)
```python
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
```

### Response (`models/response.py`)
```python
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
```

---

## 7. Core Service Logic

### PAYE Calculation (`services/paye.py`)
```python
from app.config.tax_bands import MONTHLY_TAX_BANDS

def calculate_paye(chargeable_income: float) -> dict:
    total_tax = 0.0
    breakdown = []
    remaining = chargeable_income

    for i, band in enumerate(MONTHLY_TAX_BANDS):
        lower = band["lower"]
        upper = band["upper"]  # None means no ceiling
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
            "tax": tax
        })
        remaining -= income_in_band

    return {
        "chargeable_income": chargeable_income,
        "total_tax": round(total_tax, 2),
        "band_breakdown": breakdown
    }
```

### Tax Bands Config (`config/tax_bands.py`)
```python
# Monthly PAYE bands — update here when GRA revises rates
MONTHLY_TAX_BANDS = [
    {"lower": 0,        "upper": 490,      "rate": 0.00},
    {"lower": 490,      "upper": 600,      "rate": 0.05},
    {"lower": 600,      "upper": 730,      "rate": 0.10},
    {"lower": 730,      "upper": 3896.67,  "rate": 0.175},
    {"lower": 3896.67,  "upper": 19896.67, "rate": 0.25},
    {"lower": 19896.67, "upper": 50416.67, "rate": 0.30},
    {"lower": 50416.67, "upper": None,     "rate": 0.35},
]

PERSONAL_RELIEF_MONTHLY = 365.00

RELIEF_AMOUNTS = {
    "marriage": 100.00,           # monthly (GHS 1,200/yr per GRA)
    "child_education": 50.00,     # per child per month, max 3 (GHS 600/child/yr per GRA)
    "old_age": 125.00,            # monthly (GHS 1,500/yr per GRA)
}

SSNIT_RATE = 0.055   # Employee contribution (5.5% of basic salary)
TIER2_RATE = 0.05    # Occupational pension (5% of basic salary)
```

---

## 8. Testing Strategy

Each service gets its own unit test file with known salary inputs verified against GRA's own examples.

```python
# tests/test_paye.py
def test_zero_tax_band():
    result = calculate_paye(400.00)
    assert result["total_tax"] == 0.0

def test_multi_band_calculation():
    result = calculate_paye(4500.00)
    assert len(result["band_breakdown"]) >= 4
    assert result["total_tax"] > 0

def test_band_breakdown_sums_correctly():
    result = calculate_paye(3000.00)
    total = sum(b["tax"] for b in result["band_breakdown"])
    assert round(total, 2) == result["total_tax"]
```

---

## 9. Deployment

| Component | Platform | Cost |
|---|---|---|
| FastAPI backend | Render (free tier) | Free |
| Frontend | Vercel / Netlify | Free |
| Domain (optional) | Namecheap .com.gh | ~$15/yr |

**Steps:**
1. Push to GitHub
2. Connect repo to Render → set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Build frontend: `cd frontend && npm run build` → deploy `dist/` to Vercel/Netlify
4. Set `VITE_API_URL` env var to your Render API URL
5. Enable CORS in FastAPI for your frontend domain

**Local Development:**
```bash
# Terminal 1 — Backend
docker compose up

# Terminal 2 — Frontend (proxies /api to localhost:8000)
cd frontend && npm run dev    # http://localhost:3000
```

---

## 10. Future Enhancements (Post-MVP)

- PDF payslip export (use `reportlab` or `weasyprint`)
- Bulk CSV upload for HR officers (calculate for a whole team)
- Annual vs monthly toggle
- WhatsApp bot via Twilio or Africa's Talking
- GRA tax band auto-update checker

---

## 11. Important References

- GRA PAYE Guide: https://gra.gov.gh/portfolio/paye/
- GRA Personal Tax Reliefs: https://gra.gov.gh/domestic-tax/personal-tax-relief/
- PWC Ghana Tax Summary: https://taxsummaries.pwc.com/ghana/individual/taxes-on-personal-income
- SSNIT Contribution Rates: https://www.ssnit.org.gh
- NPRA Tier 2 Rules: https://www.npra.gov.gh

> ⚠️ Always verify the current tax bands and relief amounts directly from GRA before launching. These change with the annual budget.
