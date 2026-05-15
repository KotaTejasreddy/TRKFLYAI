import logging
from fastapi import APIRouter
from app.models.ds import (
    AnalyzeRequest, AnalyzeResponse,
    DataQuality, MLApproach, BusinessImpact,
    CodeArtifact, CostEstimate,
)
from app.services.ds_service import analyze_dataset

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/ds", tags=["DataScience"])


def _as_str(v) -> str:
    if v is None: return ""
    if isinstance(v, list): return "\n".join(str(x) for x in v)
    return str(v)


def _as_list(v) -> list[str]:
    if v is None: return []
    if isinstance(v, list): return [str(x) for x in v if x is not None]
    if isinstance(v, str): return [v] if v else []
    return [str(v)]


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    data = await analyze_dataset(request.model_dump())

    dq = data.get("data_quality") or {}
    try: dq_score = max(0, min(100, int(dq.get("score", 0))))
    except (TypeError, ValueError): dq_score = 0

    mla = data.get("ml_approach") or {}
    bi = data.get("business_impact") or {}

    # Engineering artifacts
    def _coerce_artifact(v) -> CodeArtifact:
        if not isinstance(v, dict): return CodeArtifact()
        return CodeArtifact(
            language=_as_str(v.get("language")),
            title=_as_str(v.get("title")),
            code=_as_str(v.get("code")),
            notes=_as_str(v.get("notes")),
        )

    def _coerce_artifact_list(v) -> list[CodeArtifact]:
        if not isinstance(v, list): return []
        return [_coerce_artifact(x) for x in v[:8]]

    ce = data.get("cost_estimate") or {}
    cost = CostEstimate(
        monthly_usd=_as_str(ce.get("monthly_usd")),
        breakdown=_as_list(ce.get("breakdown")),
        optimization_tips=_as_list(ce.get("optimization_tips")),
    )

    raw_hp = data.get("hyperparameters") or {}
    hyper = {str(k): str(v) for k, v in raw_hp.items()} if isinstance(raw_hp, dict) else {}

    return AnalyzeResponse(
        problem_understanding=_as_str(data.get("problem_understanding")),
        assumptions=_as_list(data.get("assumptions")),
        data_quality=DataQuality(
            summary=_as_str(dq.get("summary")),
            issues=_as_list(dq.get("issues")),
            score=dq_score,
        ),
        eda_findings=_as_list(data.get("eda_findings")),
        statistical_insights=_as_list(data.get("statistical_insights")),
        feature_engineering=_as_list(data.get("feature_engineering")),
        ml_approach=MLApproach(
            problem_type=_as_str(mla.get("problem_type")),
            recommended_models=_as_list(mla.get("recommended_models")),
            reasoning=_as_str(mla.get("reasoning")),
        ),
        risks=_as_list(data.get("risks")),
        bias_warnings=_as_list(data.get("bias_warnings")),
        business_impact=BusinessImpact(
            summary=_as_str(bi.get("summary")),
            estimated_value=_as_str(bi.get("estimated_value")),
            kpis=_as_list(bi.get("kpis")),
        ),
        deployment_strategy=_as_str(data.get("deployment_strategy")),
        monitoring_strategy=_as_str(data.get("monitoring_strategy")),
        next_steps=_as_list(data.get("next_steps")),
        executive_summary=_as_str(data.get("executive_summary")),
        sql_queries=_coerce_artifact_list(data.get("sql_queries")),
        production_code=_coerce_artifact(data.get("production_code")),
        deployment_artifacts=_coerce_artifact_list(data.get("deployment_artifacts")),
        architecture_diagram=_as_str(data.get("architecture_diagram")),
        hyperparameters=hyper,
        cost_estimate=cost,
    )
