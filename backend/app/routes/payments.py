import logging
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from bson import ObjectId

from app.database import get_collection
from app.exceptions import AppException
from app.config import settings
from app.services.auth_service import get_current_user
from app.services.payments_service import create_order, verify_signature, is_mock_mode
from app.models.payments import (
    PLAN_CATALOG, PlanInfo, PlansResponse,
    CreateOrderRequest, CreateOrderResponse,
    VerifyPaymentRequest, AccessStatus,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/payments", tags=["Payments"])


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _parse_iso(s: str | None) -> datetime | None:
    if not s: return None
    try: return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception: return None


@router.get("/plans", response_model=PlansResponse)
async def list_plans():
    """Public — return all available plans."""
    plans = [PlanInfo(id=pid, **p) for pid, p in PLAN_CATALOG.items()]
    return PlansResponse(trial_days=settings.TRIAL_DAYS, plans=plans)


@router.get("/access", response_model=AccessStatus)
async def check_access(current: dict = Depends(get_current_user)):
    """Returns whether the current user can access paid features (LearnAI).
    Trial users get N days from signup. Paid users get until expires_at."""
    users = get_collection("users")
    u = await users.find_one({"_id": ObjectId(current["sub"])})
    if not u:
        raise AppException(status_code=404, detail="User not found")

    now = _now()
    plan = u.get("plan") or "trial"
    sub_expires = _parse_iso(u.get("subscription_expires_at"))
    trial_started = _parse_iso(u.get("trial_started_at"))

    if not trial_started:
        # Legacy users without trial start — set now and grant trial.
        trial_started = now
        await users.update_one(
            {"_id": u["_id"]},
            {"$set": {"trial_started_at": now.isoformat(), "plan": "trial"}},
        )

    # Paid subscription wins if active
    if sub_expires and sub_expires > now and plan in PLAN_CATALOG:
        days_left = max(0, (sub_expires - now).days)
        return AccessStatus(
            has_access=True, plan=plan,
            expires_at=sub_expires.isoformat(),
            days_left=days_left,
            reason=f"{PLAN_CATALOG[plan]['label']} plan active.",
        )

    # Trial check
    trial_end = trial_started + timedelta(days=settings.TRIAL_DAYS)
    if trial_end > now and (plan == "trial" or not plan):
        days_left = max(0, (trial_end - now).days + (1 if (trial_end - now).seconds else 0))
        return AccessStatus(
            has_access=True, plan="trial",
            expires_at=trial_end.isoformat(),
            days_left=days_left,
            reason=f"{settings.TRIAL_DAYS}-day free trial active.",
        )

    # Expired
    return AccessStatus(
        has_access=False, plan="none",
        expires_at=(sub_expires or trial_end).isoformat() if (sub_expires or trial_end) else None,
        days_left=0,
        reason="Trial or subscription expired. Pick a plan to continue.",
    )


@router.post("/order", response_model=CreateOrderResponse)
async def create_payment_order(req: CreateOrderRequest, current: dict = Depends(get_current_user)):
    """Create a Razorpay order for the chosen plan."""
    if req.plan not in PLAN_CATALOG:
        raise AppException(status_code=400, detail=f"Unknown plan: {req.plan}")
    plan = PLAN_CATALOG[req.plan]
    amount_paise = plan["amount"] * 100  # Razorpay uses smallest unit

    receipt = f"trkfly_{current['sub'][:8]}_{int(_now().timestamp())}"
    order = await create_order(amount_paise, plan["currency"], receipt)

    return CreateOrderResponse(
        order_id=order["id"],
        amount=amount_paise,
        currency=plan["currency"],
        key_id=settings.RAZORPAY_KEY_ID or "mock_key",
        plan=req.plan,
        mock=order.get("mock", False),
    )


@router.post("/verify")
async def verify_payment(req: VerifyPaymentRequest, current: dict = Depends(get_current_user)):
    """Verify Razorpay payment signature + activate subscription."""
    if req.plan not in PLAN_CATALOG:
        raise AppException(status_code=400, detail=f"Unknown plan: {req.plan}")

    if not verify_signature(req.razorpay_order_id, req.razorpay_payment_id, req.razorpay_signature):
        logger.warning("Payment signature verification FAILED for order=%s", req.razorpay_order_id)
        raise AppException(status_code=400, detail="Payment verification failed")

    plan = PLAN_CATALOG[req.plan]
    now = _now()
    expires_at = now + timedelta(days=plan["days"])

    users = get_collection("users")
    payment_record = {
        "amount": plan["amount"],
        "currency": plan["currency"],
        "plan": req.plan,
        "razorpay_order_id": req.razorpay_order_id,
        "razorpay_payment_id": req.razorpay_payment_id,
        "razorpay_signature": req.razorpay_signature,
        "paid_at": now.isoformat(),
        "mock": is_mock_mode(),
    }
    await users.update_one(
        {"_id": ObjectId(current["sub"])},
        {
            "$set": {
                "plan": req.plan,
                "subscription_started_at": now.isoformat(),
                "subscription_expires_at": expires_at.isoformat(),
            },
            "$push": {"payment_history": payment_record},
        },
    )

    logger.info("Subscription activated: user=%s plan=%s expires=%s mock=%s",
                current["sub"], req.plan, expires_at.isoformat(), is_mock_mode())

    return {
        "success": True,
        "plan": req.plan,
        "expires_at": expires_at.isoformat(),
        "days_active": plan["days"],
    }
