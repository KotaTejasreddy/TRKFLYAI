import logging
from fastapi import APIRouter
from app.models.bi import (
    BiAnalyzeRequest, BiAnalyzeResponse, KpiItem, ActionItem,
    SqlArtifact, DashboardWidget, AlertRule, ForecastSpec,
)
from app.services.bi_service import analyze_business

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/bi", tags=["BusinessIntelligence"])


def _as_str(v) -> str:
    if v is None: return ""
    if isinstance(v, list): return "\n".join(str(x) for x in v)
    return str(v)


def _as_list(v) -> list[str]:
    if v is None: return []
    if isinstance(v, list): return [str(x) for x in v if x is not None]
    if isinstance(v, str): return [v] if v else []
    return [str(v)]


def _coerce_kpis(raw) -> list[KpiItem]:
    out: list[KpiItem] = []
    if not isinstance(raw, list): return out
    for k in raw[:12]:
        if not isinstance(k, dict): continue
        out.append(KpiItem(
            name=_as_str(k.get("name")),
            current_value=_as_str(k.get("current_value")),
            trend=_as_str(k.get("trend")).lower()[:8],
            health=_as_str(k.get("health")).lower()[:12],
            notes=_as_str(k.get("notes")),
        ))
    return out


def _coerce_actions(raw) -> list[ActionItem]:
    out: list[ActionItem] = []
    if not isinstance(raw, list): return out
    for a in raw[:10]:
        if not isinstance(a, dict): continue
        out.append(ActionItem(
            action=_as_str(a.get("action")),
            owner=_as_str(a.get("owner")),
            priority=_as_str(a.get("priority")).lower()[:8],
            impact=_as_str(a.get("impact")),
        ))
    return out


def _coerce_sql(raw) -> list[SqlArtifact]:
    out: list[SqlArtifact] = []
    if not isinstance(raw, list): return out
    for q in raw[:8]:
        if not isinstance(q, dict): continue
        out.append(SqlArtifact(
            title=_as_str(q.get("title")),
            purpose=_as_str(q.get("purpose")),
            sql=_as_str(q.get("sql")),
            notes=_as_str(q.get("notes")),
        ))
    return out


def _coerce_widgets(raw) -> list[DashboardWidget]:
    out: list[DashboardWidget] = []
    if not isinstance(raw, list): return out
    for w in raw[:12]:
        if not isinstance(w, dict): continue
        out.append(DashboardWidget(
            title=_as_str(w.get("title")),
            chart_type=_as_str(w.get("chart_type")).lower()[:20],
            metric=_as_str(w.get("metric")),
            dimensions=_as_list(w.get("dimensions")),
            refresh=_as_str(w.get("refresh")),
            notes=_as_str(w.get("notes")),
        ))
    return out


def _coerce_alerts(raw) -> list[AlertRule]:
    out: list[AlertRule] = []
    if not isinstance(raw, list): return out
    for a in raw[:8]:
        if not isinstance(a, dict): continue
        out.append(AlertRule(
            name=_as_str(a.get("name")),
            metric=_as_str(a.get("metric")),
            condition=_as_str(a.get("condition")),
            severity=_as_str(a.get("severity")).lower()[:12],
            channel=_as_str(a.get("channel")),
            rationale=_as_str(a.get("rationale")),
        ))
    return out


def _coerce_forecasts(raw) -> list[ForecastSpec]:
    out: list[ForecastSpec] = []
    if not isinstance(raw, list): return out
    for f in raw[:6]:
        if not isinstance(f, dict): continue
        out.append(ForecastSpec(
            metric=_as_str(f.get("metric")),
            horizon=_as_str(f.get("horizon")),
            method=_as_str(f.get("method")),
            expected_outcome=_as_str(f.get("expected_outcome")),
        ))
    return out


@router.post("/analyze", response_model=BiAnalyzeResponse)
async def analyze(request: BiAnalyzeRequest):
    data = await analyze_business(request.model_dump())
    return BiAnalyzeResponse(
        business_understanding=_as_str(data.get("business_understanding")),
        kpis=_coerce_kpis(data.get("kpis")),
        trend_analysis=_as_list(data.get("trend_analysis")),
        customer_insights=_as_list(data.get("customer_insights")),
        product_insights=_as_list(data.get("product_insights")),
        financial_insights=_as_list(data.get("financial_insights")),
        marketing_insights=_as_list(data.get("marketing_insights")),
        operational_insights=_as_list(data.get("operational_insights")),
        root_cause_analysis=_as_list(data.get("root_cause_analysis")),
        anomalies=_as_list(data.get("anomalies")),
        risks=_as_list(data.get("risks")),
        opportunities=_as_list(data.get("opportunities")),
        forecasts=_as_list(data.get("forecasts")),
        strategic_recommendations=_as_list(data.get("strategic_recommendations")),
        dashboard_recommendations=_as_list(data.get("dashboard_recommendations")),
        action_items=_coerce_actions(data.get("action_items")),
        executive_summary=_as_str(data.get("executive_summary")),
        sql_queries=_coerce_sql(data.get("sql_queries")),
        dashboard_widgets=_coerce_widgets(data.get("dashboard_widgets")),
        alert_rules=_coerce_alerts(data.get("alert_rules")),
        forecast_specs=_coerce_forecasts(data.get("forecast_specs")),
        nlp_queries=_as_list(data.get("nlp_queries")),
    )
