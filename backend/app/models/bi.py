from pydantic import BaseModel, Field
from typing import Optional


class BiColumnProfile(BaseModel):
    name: str
    inferred_type: str               # number | string | boolean | date | mixed
    missing_count: int = 0
    unique_count: int = 0
    sample_values: list[str] = []


class BiAnalyzeRequest(BaseModel):
    file_name: str = Field(..., max_length=200)
    business_question: str = Field(..., min_length=4, max_length=2000)
    industry: Optional[str] = Field(default="", max_length=100)
    row_count: int = Field(..., ge=1)
    columns: list[BiColumnProfile] = Field(..., min_length=1, max_length=200)
    csv_preview: str = Field(..., max_length=20_000)
    response_language: str = Field(default="English")


class KpiItem(BaseModel):
    name: str
    current_value: str = ""
    trend: str = ""                  # "up" | "down" | "flat"
    health: str = ""                 # "good" | "warning" | "critical"
    notes: str = ""


class ActionItem(BaseModel):
    action: str
    owner: str = ""
    priority: str = ""               # "high" | "medium" | "low"
    impact: str = ""


class SqlArtifact(BaseModel):
    title: str = ""
    purpose: str = ""                # what business question this query answers
    sql: str = ""
    notes: str = ""


class DashboardWidget(BaseModel):
    title: str = ""
    chart_type: str = ""             # line | bar | pie | kpi_card | table | gauge | funnel | heatmap
    metric: str = ""                 # what to plot
    dimensions: list[str] = []       # group-by axes
    refresh: str = ""                # e.g. "5 min" | "hourly" | "daily"
    notes: str = ""


class AlertRule(BaseModel):
    name: str = ""
    metric: str = ""
    condition: str = ""              # e.g. "drops > 20% week-over-week"
    severity: str = ""               # critical | warning | info
    channel: str = ""                # slack | email | pagerduty
    rationale: str = ""


class ForecastSpec(BaseModel):
    metric: str = ""
    horizon: str = ""                # e.g. "next 4 weeks"
    method: str = ""                 # prophet | arima | exponential_smoothing | linear
    expected_outcome: str = ""


class BiAnalyzeResponse(BaseModel):
    success: bool = True
    business_understanding: str = ""
    kpis: list[KpiItem] = []
    trend_analysis: list[str] = []
    customer_insights: list[str] = []
    product_insights: list[str] = []
    financial_insights: list[str] = []
    marketing_insights: list[str] = []
    operational_insights: list[str] = []
    root_cause_analysis: list[str] = []
    anomalies: list[str] = []
    risks: list[str] = []
    opportunities: list[str] = []
    forecasts: list[str] = []
    strategic_recommendations: list[str] = []
    dashboard_recommendations: list[str] = []
    action_items: list[ActionItem] = []
    executive_summary: str = ""
    # NEW — production analytics artifacts
    sql_queries: list[SqlArtifact] = []
    dashboard_widgets: list[DashboardWidget] = []
    alert_rules: list[AlertRule] = []
    forecast_specs: list[ForecastSpec] = []
    nlp_queries: list[str] = []      # sample questions for conversational BI
