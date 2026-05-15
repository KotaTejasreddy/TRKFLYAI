from pydantic import BaseModel, Field
from typing import Optional


class ColumnProfile(BaseModel):
    name: str
    inferred_type: str               # "number" | "string" | "boolean" | "date" | "mixed"
    missing_count: int = 0
    unique_count: int = 0
    sample_values: list[str] = []


class AnalyzeRequest(BaseModel):
    file_name: str = Field(..., max_length=200)
    business_question: str = Field(..., min_length=4, max_length=2000)
    row_count: int = Field(..., ge=1)
    columns: list[ColumnProfile] = Field(..., min_length=1, max_length=200)
    csv_preview: str = Field(..., max_length=20_000)  # first ~100 rows as raw text
    response_language: str = Field(default="English")


class DataQuality(BaseModel):
    summary: str = ""
    issues: list[str] = []
    score: int = 0  # 0-100


class MLApproach(BaseModel):
    problem_type: str = ""           # classification | regression | clustering | forecasting | ranking | anomaly
    recommended_models: list[str] = []
    reasoning: str = ""


class BusinessImpact(BaseModel):
    summary: str = ""
    estimated_value: str = ""
    kpis: list[str] = []


class CodeArtifact(BaseModel):
    language: str = ""        # python | sql | yaml | dockerfile | bash
    title: str = ""
    code: str = ""
    notes: str = ""


class CostEstimate(BaseModel):
    monthly_usd: str = ""
    breakdown: list[str] = []
    optimization_tips: list[str] = []


class AnalyzeResponse(BaseModel):
    success: bool = True
    problem_understanding: str = ""
    assumptions: list[str] = []
    data_quality: DataQuality = DataQuality()
    eda_findings: list[str] = []
    statistical_insights: list[str] = []
    feature_engineering: list[str] = []
    ml_approach: MLApproach = MLApproach()
    risks: list[str] = []
    bias_warnings: list[str] = []
    business_impact: BusinessImpact = BusinessImpact()
    deployment_strategy: str = ""
    monitoring_strategy: str = ""
    next_steps: list[str] = []
    executive_summary: str = ""
    # NEW — concrete engineering artifacts
    sql_queries: list[CodeArtifact] = []
    production_code: CodeArtifact = CodeArtifact()
    deployment_artifacts: list[CodeArtifact] = []
    architecture_diagram: str = ""        # ASCII / text diagram
    hyperparameters: dict[str, str] = {}
    cost_estimate: CostEstimate = CostEstimate()
