"""
Admin-only analytics endpoint.
Gated by matching the authenticated user's email against ADMIN_EMAIL env var.
"""
import logging
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from app.config import settings
from app.database import get_collection
from app.exceptions import AppException
from app.services.auth_service import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _parse_iso(s: str | None) -> datetime | None:
    if not s: return None
    try: return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception: return None


async def require_admin(current: dict = Depends(get_current_user)) -> dict:
    """Strict gate — only the configured ADMIN_EMAIL can access these endpoints."""
    admin_email = (settings.ADMIN_EMAIL or "").lower().strip()
    if not admin_email:
        # No admin configured — refuse everyone
        raise AppException(status_code=503, detail="Admin dashboard not configured")
    if (current.get("email") or "").lower() != admin_email:
        raise AppException(status_code=403, detail="Forbidden")
    return current


@router.get("/stats")
async def admin_stats(_admin: dict = Depends(require_admin)):
    """
    Aggregated platform stats from MongoDB:
    - User counts (total, today, this week, this month)
    - Plan breakdown (trial / monthly / quarterly / yearly / expired)
    - Active paid subscribers
    - Revenue totals from payment_history
    - Trial → paid conversion rate
    - Recent signups + recent payments
    """
    users = get_collection("users")
    now = _now()

    total = await users.count_documents({})

    # Signups by time window — use created_at ISO string >= cutoff
    day_iso = (now - timedelta(days=1)).isoformat()
    week_iso = (now - timedelta(days=7)).isoformat()
    month_iso = (now - timedelta(days=30)).isoformat()

    signups_24h   = await users.count_documents({"created_at": {"$gte": day_iso}})
    signups_7d    = await users.count_documents({"created_at": {"$gte": week_iso}})
    signups_30d   = await users.count_documents({"created_at": {"$gte": month_iso}})

    # Plan breakdown
    plan_counts = {"trial": 0, "monthly": 0, "quarterly": 0, "yearly": 0, "expired": 0, "none": 0}
    paid_active = 0
    trial_active = 0
    revenue_total_inr = 0
    revenue_24h = 0
    revenue_7d = 0
    revenue_30d = 0
    payments_count = 0

    recent_signups: list[dict] = []
    recent_payments: list[dict] = []

    async for u in users.find({}, {
        "email": 1, "handle": 1, "plan": 1,
        "subscription_expires_at": 1, "trial_started_at": 1,
        "created_at": 1, "payment_history": 1, "auth_provider": 1,
    }).sort("created_at", -1):
        plan = u.get("plan") or "trial"
        sub_exp = _parse_iso(u.get("subscription_expires_at"))
        trial_started = _parse_iso(u.get("trial_started_at"))
        trial_end = trial_started + timedelta(days=settings.TRIAL_DAYS) if trial_started else None

        # Bucket the plan
        if plan in plan_counts:
            plan_counts[plan] += 1
        else:
            plan_counts["none"] += 1

        # Is this user currently active?
        if sub_exp and sub_exp > now and plan in ("monthly", "quarterly", "yearly"):
            paid_active += 1
        elif plan == "trial" and trial_end and trial_end > now:
            trial_active += 1

        # Revenue
        for p in (u.get("payment_history") or []):
            payments_count += 1
            amt = int(p.get("amount") or 0)
            revenue_total_inr += amt
            paid_at = _parse_iso(p.get("paid_at"))
            if paid_at:
                if paid_at > now - timedelta(days=1):  revenue_24h += amt
                if paid_at > now - timedelta(days=7):  revenue_7d  += amt
                if paid_at > now - timedelta(days=30): revenue_30d += amt

        # Collect for the recent lists
        if len(recent_signups) < 15:
            recent_signups.append({
                "email": u.get("email"),
                "handle": u.get("handle"),
                "plan": plan,
                "created_at": u.get("created_at"),
                "auth_provider": u.get("auth_provider") or "password",
            })
        for p in (u.get("payment_history") or []):
            recent_payments.append({
                "email": u.get("email"),
                "plan": p.get("plan"),
                "amount": p.get("amount"),
                "paid_at": p.get("paid_at"),
                "mock": p.get("mock", False),
            })

    # Newest payments first, top 15
    recent_payments.sort(key=lambda x: x.get("paid_at") or "", reverse=True)
    recent_payments = recent_payments[:15]

    # Conversion rate: paid customers / (paid + expired-trial accounts)
    converted = sum(plan_counts[p] for p in ("monthly", "quarterly", "yearly"))
    funnel_total = max(converted + plan_counts["expired"] + plan_counts["trial"], 1)
    conversion_pct = round((converted / funnel_total) * 100, 1)

    return {
        "success": True,
        "generated_at": now.isoformat(),
        "users": {
            "total": total,
            "signups_24h": signups_24h,
            "signups_7d": signups_7d,
            "signups_30d": signups_30d,
        },
        "plans": plan_counts,
        "active": {
            "trial": trial_active,
            "paid": paid_active,
            "total_active": trial_active + paid_active,
        },
        "revenue_inr": {
            "total": revenue_total_inr,
            "last_24h": revenue_24h,
            "last_7d": revenue_7d,
            "last_30d": revenue_30d,
            "payments_count": payments_count,
        },
        "conversion": {
            "paid_customers": converted,
            "conversion_pct": conversion_pct,
        },
        "recent_signups": recent_signups,
        "recent_payments": recent_payments,
    }
