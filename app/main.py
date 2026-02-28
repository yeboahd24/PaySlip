from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import calculator

app = FastAPI(
    title="Ghana Take-Home Pay Calculator",
    description="Calculates net take-home pay based on GRA PAYE tax bands, SSNIT, and Tier 2 pension rules.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calculator.router, prefix="/api/v1")
