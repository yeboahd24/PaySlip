# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Summary

Ghana Take-Home Pay Calculator — a stateless REST API (FastAPI, Python 3.11+) that computes net take-home pay based on GRA PAYE tax bands, SSNIT, and Tier 2 pension rules. A React or plain HTML/JS frontend consumes the API. No database, no auth, no persistence.

## Build & Run Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn app.main:app --reload

# Run all tests
pytest

# Run a single test file
pytest tests/test_paye.py

# Run a single test
pytest tests/test_paye.py::test_zero_tax_band -v
```

## Architecture

```
Frontend (React/HTML) --HTTPS/JSON--> FastAPI Backend (stateless)
```

- **Entry point:** `app/main.py` — FastAPI app instance, CORS config, router registration
- **Router:** `app/routers/calculator.py` — `POST /calculate`, `GET /tax-bands`, `GET /reliefs`, `GET /health`
- **Services layer:** `app/services/` — business logic separated by concern:
  - `calculator.py` — orchestrator, calls ssnit and paye services
  - `ssnit.py` — SSNIT (5.5%) and Tier 2 (5%) pension deductions on basic salary
  - `paye.py` — progressive tax band calculation on chargeable income
- **Config:** `app/config/tax_bands.py` — all tax rates, band thresholds, and relief amounts in one place. Update here when GRA revises rates; do not hardcode rates in service logic.
- **Models:** `app/models/request.py` and `app/models/response.py` — Pydantic schemas for API I/O

## Domain Rules (Ghana Payroll)

- **SSNIT:** 5.5% of basic salary only (not allowances). Deducted before tax.
- **Tier 2 pension:** 5% of basic salary only. Deducted before tax.
- **Chargeable Income** = Basic Salary + Taxable Allowances − SSNIT − Approved Reliefs
- **Personal relief:** GHS 365/month — always applied automatically.
- **PAYE:** Progressive bands applied to chargeable income (6 bands, 0%–30%). See `config/tax_bands.py`.
- Tax bands and relief amounts change with Ghana's annual budget — always verify against GRA before updating.

## Key Design Decisions

- Fully stateless: one input → one detailed calculation response
- All monetary values in GHS, rounded to 2 decimal places
- API versioned under `/api/v1`
- CORS must be configured for the frontend domain
- Deployment: backend on Render (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`), frontend on Vercel/Netlify
