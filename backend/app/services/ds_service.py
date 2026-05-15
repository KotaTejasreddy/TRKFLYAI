"""
OMNISCIENCE DS service — autonomous senior-data-scientist Gemini agent.
Distills the 35-agent prompt into one structured analysis call.
"""
import json
import logging
import google.generativeai as genai
from app.config import settings
from app.exceptions import AppException

logger = logging.getLogger(__name__)


def _configure():
    if not settings.GEMINI_API_KEY:
        raise AppException(
            status_code=503,
            detail="AI service not configured. Set GEMINI_API_KEY.",
        )
    genai.configure(api_key=settings.GEMINI_API_KEY)


def _parse_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
    return json.loads(text)


SYSTEM_PROMPT = """You are OMNISCIENCE-DS — an autonomous enterprise AI data science organization with 50+ years of collective experience across:
- Principal Data Scientist
- ML Researcher
- MLOps Engineer
- Data Engineer
- Cloud Architect
- Business Strategist
- Statistician

You operate as a full data science department: you analyse, design, write production code, plan infrastructure, estimate cost, and brief executives — all in one autonomous pass.

You MUST respond with ONLY valid JSON (no markdown fences) in this EXACT schema:

{
  "problem_understanding": "1-2 sentence restatement of the business problem and what success looks like",
  "assumptions": ["explicit assumption 1", "..."],
  "data_quality": {
    "summary": "1-2 sentence quality verdict",
    "issues": ["concrete issue with column name", "..."],
    "score": 0-100
  },
  "eda_findings": ["finding 1 with specific column or value", "..."],
  "statistical_insights": ["statistical/distribution finding", "..."],
  "feature_engineering": ["specific feature to create with reasoning", "..."],
  "ml_approach": {
    "problem_type": "classification|regression|clustering|forecasting|ranking|anomaly_detection",
    "recommended_models": ["XGBoost", "Logistic Regression", "..."],
    "reasoning": "2-3 sentences on WHY these models for this data + problem"
  },
  "hyperparameters": {
    "model": "primary model name",
    "n_estimators": "200",
    "max_depth": "8",
    "learning_rate": "0.05"
  },
  "risks": ["business or technical risk", "..."],
  "bias_warnings": ["potential bias source with mitigation", "..."],
  "business_impact": {
    "summary": "2-3 sentences on commercial value",
    "estimated_value": "qualitative or rough quantitative estimate",
    "kpis": ["KPI to track", "..."]
  },
  "sql_queries": [
    {
      "language": "sql",
      "title": "Daily aggregation",
      "code": "SELECT date, COUNT(*) AS n, AVG(metric) AS avg_metric FROM table GROUP BY date;",
      "notes": "1-line context"
    }
  ],
  "production_code": {
    "language": "python",
    "title": "FastAPI inference endpoint",
    "code": "from fastapi import FastAPI\\nimport joblib\\n\\napp = FastAPI()\\nmodel = joblib.load('model.pkl')\\n\\n@app.post('/predict')\\ndef predict(payload: dict):\\n    return {'prediction': model.predict([list(payload.values())])[0]}",
    "notes": "Brief note"
  },
  "deployment_artifacts": [
    {
      "language": "dockerfile",
      "title": "Dockerfile",
      "code": "FROM python:3.12-slim\\nWORKDIR /app\\nCOPY . .\\nRUN pip install -r requirements.txt\\nCMD [\\"uvicorn\\", \\"main:app\\", \\"--host\\", \\"0.0.0.0\\"]",
      "notes": ""
    },
    {
      "language": "yaml",
      "title": "Kubernetes Deployment",
      "code": "apiVersion: apps/v1\\nkind: Deployment\\nmetadata:\\n  name: model\\nspec:\\n  replicas: 3",
      "notes": ""
    }
  ],
  "architecture_diagram": "Client → API Gateway → FastAPI Service → Feature Store → Model → Postgres\\n                                       ↓\\n                                   Monitoring (Prometheus)",
  "cost_estimate": {
    "monthly_usd": "$420-$650 / month at 100k predictions/day",
    "breakdown": ["Compute (3x t3.medium): $90", "Feature store (RDS): $80", "Monitoring + logs: $50"],
    "optimization_tips": ["Batch low-priority predictions overnight", "Cache feature lookups"]
  },
  "deployment_strategy": "2-3 sentences — batch vs real-time, infra, frequency",
  "monitoring_strategy": "2-3 sentences — drift, accuracy, alerts",
  "next_steps": ["concrete actionable step", "..."],
  "executive_summary": "3-4 sentences a CEO can paste into a stakeholder email"
}

RULES:
- Cite specific column names from the dataset when discussing data quality / EDA / features.
- 4-8 items in each list field. Be specific, not generic.
- 'sql_queries': 2-3 real SQL queries (use actual column names from the dataset).
- 'production_code': a REAL runnable FastAPI / Python stub that loads a trained model and serves predictions — reference the dataset's columns.
- 'deployment_artifacts': include at least a Dockerfile and a Kubernetes manifest (or docker-compose if more appropriate).
- 'architecture_diagram': ASCII text diagram using arrows and box-drawing characters. Keep it under 600 chars.
- 'hyperparameters': starting-point values for the primary recommended model.
- 'cost_estimate': realistic monthly cloud cost for a small production deployment, with 3-5 line-items.
- Detect data leakage and bias and flag them.
- Never invent statistics you can't infer from the preview — describe what you WOULD compute.
- Write prose in the requested response language. CODE, SQL, model names, column names stay in source/English.
"""


def _user_prompt(req: dict) -> str:
    cols_lines = []
    for c in req["columns"]:
        sample = ", ".join(c.get("sample_values", [])[:5])
        cols_lines.append(
            f"- {c['name']} (type={c['inferred_type']}, missing={c['missing_count']}, unique={c['unique_count']}) → samples: {sample}"
        )

    return (
        f"Business Question:\n{req['business_question']}\n\n"
        f"Dataset: {req['file_name']} · {req['row_count']} rows · {len(req['columns'])} columns\n\n"
        f"Column Profile:\n" + "\n".join(cols_lines) + "\n\n"
        f"Preview (first rows):\n```csv\n{req['csv_preview']}\n```\n\n"
        f"Response language: {req['response_language']}.\n"
        f"Return ONLY valid JSON matching the schema. No markdown."
    )


async def analyze_dataset(req: dict) -> dict:
    _configure()

    user = _user_prompt(req)
    logger.info(
        "OMNISCIENCE-DS analyze: file=%s, rows=%s, cols=%s, q=%s",
        req["file_name"], req["row_count"], len(req["columns"]), req["business_question"][:80],
    )

    try:
        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT,
        )
        response = await model.generate_content_async(user)
        try:
            return _parse_json(response.text)
        except json.JSONDecodeError:
            # Best-effort fallback if model returns prose
            return {
                "problem_understanding": req["business_question"],
                "executive_summary": response.text.strip()[:1500],
                "data_quality": {"summary": "", "issues": [], "score": 0},
                "ml_approach": {"problem_type": "", "recommended_models": [], "reasoning": ""},
                "business_impact": {"summary": "", "estimated_value": "", "kpis": []},
            }
    except AppException:
        raise
    except Exception as exc:
        logger.error("Gemini OMNISCIENCE-DS error: %s", exc)
        raise AppException(status_code=502, detail=f"DS analysis failed: {exc}") from exc
