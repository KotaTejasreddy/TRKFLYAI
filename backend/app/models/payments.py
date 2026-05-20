from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from typing import Optional, Literal


PLAN_CATALOG = {
    "monthly":   {"label": "Monthly",   "amount": 49,  "currency": "INR", "days": 30,  "popular": False},
    "quarterly": {"label": "Quarterly", "amount": 99,  "currency": "INR", "days": 90,  "popular": True},
    "yearly":    {"label": "Yearly",    "amount": 299, "currency": "INR", "days": 365, "popular": False},
}

PlanId = Literal["monthly", "quarterly", "yearly"]


class PlanInfo(BaseModel):
    id: str
    label: str
    amount: int       # in major units (₹49 = 49)
    currency: str
    days: int
    popular: bool


class PlansResponse(BaseModel):
    success: bool = True
    trial_days: int
    plans: list[PlanInfo]


class CreateOrderRequest(BaseModel):
    plan: PlanId


class CreateOrderResponse(BaseModel):
    success: bool = True
    order_id: str
    amount: int           # in paise (₹49 = 4900) — Razorpay's unit
    currency: str
    key_id: str           # Razorpay public key for the frontend checkout
    plan: PlanId
    mock: bool = False


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan: PlanId


class AccessStatus(BaseModel):
    success: bool = True
    has_access: bool
    plan: str             # "trial" | "monthly" | "quarterly" | "yearly" | "none"
    expires_at: Optional[str] = None
    days_left: int = 0
    reason: str = ""      # human-readable
