"""
Seed script for the products collection.
Run with: python -m app.seed
"""

import asyncio
import logging
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.logging_config import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

PRODUCTS = [
    {
        "title": "NeuralForge",
        "slug": "neuralforge",
        "tagline": "Train production ML models without the infrastructure headaches.",
        "description": "NeuralForge is a managed AI model training platform that abstracts away the complexity of GPU provisioning, distributed training, hyperparameter optimization, and model deployment. Engineers focus on model architecture and data while NeuralForge handles everything else.",
        "problem": "Training machine learning models at production scale requires deep infrastructure knowledge. Teams spend months configuring GPU clusters, managing distributed training, and building deployment pipelines instead of iterating on model quality. Small and mid-size teams are locked out of advanced training techniques because the infrastructure barrier is too high.",
        "solution": "NeuralForge provides a fully managed training platform that automatically provisions GPU resources, runs intelligent hyperparameter sweeps, and deploys trained models to scalable inference endpoints. Users submit a training configuration and dataset, and NeuralForge handles orchestration, fault tolerance, checkpointing, and cost optimization across cloud providers.",
        "tech_stack": ["Python", "PyTorch", "Kubernetes", "Redis", "PostgreSQL"],
        "features": [
            "Auto-scaling GPU clusters with spot instance optimization for up to 70% cost reduction",
            "Bayesian hyperparameter tuning with early stopping and pruning strategies",
            "Built-in experiment tracking with full lineage from data to deployed model",
            "One-click model deployment to auto-scaling inference endpoints with A/B testing",
            "Real-time training dashboards with loss curves, resource utilization, and cost tracking"
        ],
        "github_link": None,
        "demo_link": "https://neuralforge.TRKFLY.ai",
        "case_study": (
            "## Background\n\n"
            "A mid-stage fintech startup needed to train fraud detection models across millions of transactions daily. "
            "Their data science team of four engineers spent roughly 40% of their time managing training infrastructure "
            "rather than improving model accuracy. GPU costs were unpredictable, and failed training runs wasted thousands "
            "of dollars each month.\n\n"
            "## Implementation\n\n"
            "After migrating to NeuralForge, the team defined their training pipelines as declarative YAML configurations. "
            "NeuralForge automatically selected optimal GPU types, managed distributed training across nodes, and ran "
            "parallel hyperparameter sweeps. The platform's spot instance orchestration reduced compute costs by 62% while "
            "maintaining training reliability through automatic checkpointing and failover.\n\n"
            "## Results\n\n"
            "Within three months, the team shipped 5x more model iterations. Their fraud detection accuracy improved from "
            "94.2% to 97.8% as engineers redirected infrastructure time toward feature engineering and architecture "
            "experiments. Monthly GPU spend dropped from $28,000 to $10,500 while training throughput tripled.\n\n"
            "## Key Takeaway\n\n"
            "NeuralForge eliminated the infrastructure tax that was slowing down the team's ML lifecycle. By abstracting "
            "GPU management and training orchestration, the platform let a small team compete with organizations that have "
            "dedicated ML platform teams."
        ),
        "category": "AI/ML",
        "status": "Live",
        "metrics": {"models_trained": "50K+", "avg_training_speedup": "3.2x", "gpu_utilization": "94%"},
        "created_at": datetime(2024, 3, 15, tzinfo=timezone.utc),
    },
    {
        "title": "DataPulse",
        "slug": "datapulse",
        "tagline": "Real-time analytics at any scale, with sub-10ms latency.",
        "description": "DataPulse is a stream processing and analytics engine built for companies that need real-time insights from high-volume event streams. It combines a high-throughput ingestion layer with a columnar analytics store and built-in anomaly detection.",
        "problem": "Companies generating millions of events per second struggle to derive real-time insights. Traditional batch processing introduces hours of delay, while existing stream processors require significant engineering effort to operate reliably. Most teams end up with fragile pipelines that break under load and miss critical anomalies.",
        "solution": "DataPulse provides an end-to-end real-time analytics pipeline that ingests, processes, and serves queries with sub-10ms latency. The platform includes built-in anomaly detection powered by statistical models that learn normal patterns and alert on deviations without manual threshold configuration.",
        "tech_stack": ["Apache Kafka", "Rust", "ClickHouse", "gRPC", "React"],
        "features": [
            "Ingestion layer handling 2M+ events per second with exactly-once delivery semantics",
            "Columnar storage engine with automatic partitioning and compression for cost-efficient retention",
            "Built-in anomaly detection that adapts to seasonal patterns and trend shifts",
            "Real-time dashboards with sub-second query response on billions of rows",
            "SQL-compatible query interface with streaming materialized views"
        ],
        "github_link": None,
        "demo_link": "https://datapulse.TRKFLY.ai",
        "case_study": (
            "## Background\n\n"
            "A large e-commerce platform was processing 800K order events per second during peak traffic. Their existing "
            "analytics stack relied on hourly batch jobs, meaning fraud patterns and inventory anomalies were detected "
            "hours after they occurred. During a major sales event, a pricing error went undetected for 90 minutes, "
            "resulting in significant revenue loss.\n\n"
            "## Implementation\n\n"
            "DataPulse was deployed alongside the existing Kafka infrastructure. The ingestion layer consumed the full "
            "event stream without backpressure, while the analytics engine provided real-time materialized views for "
            "pricing validation, inventory tracking, and fraud scoring. The anomaly detection module was trained on "
            "three months of historical data and began flagging deviations within the first week.\n\n"
            "## Results\n\n"
            "Detection latency dropped from 90 minutes to under 3 seconds. The platform caught 23 pricing anomalies "
            "in the first month that would have previously gone unnoticed for hours. Query performance on the analytics "
            "dashboard improved from 12 seconds to 200 milliseconds, enabling operations teams to make decisions in "
            "real time during high-traffic events.\n\n"
            "## Key Takeaway\n\n"
            "DataPulse bridged the gap between raw event streams and actionable insights. The combination of "
            "high-throughput ingestion, fast analytics, and adaptive anomaly detection gave the operations team "
            "real-time visibility they never had before."
        ),
        "category": "Platform",
        "status": "Live",
        "metrics": {"events_per_second": "2M+", "p99_latency": "<8ms", "customers": "120+"},
        "created_at": datetime(2024, 5, 20, tzinfo=timezone.utc),
    },
    {
        "title": "ShieldAI",
        "slug": "shieldai",
        "tagline": "Autonomous threat detection that cuts through the noise.",
        "description": "ShieldAI is an AI-powered security platform that monitors network traffic, endpoint behavior, and application logs to detect threats in real time. It learns normal patterns for each environment and surfaces only genuine threats, reducing alert fatigue by over 90%.",
        "problem": "Traditional security information and event management (SIEM) tools flood security teams with thousands of alerts daily, the vast majority of which are false positives. Analysts spend hours triaging noise instead of investigating real threats. Meanwhile, sophisticated attacks slip through rule-based detection systems that cannot adapt to evolving tactics.",
        "solution": "ShieldAI deploys lightweight agents that build behavioral baselines for every host, user, and application. Its detection engine combines unsupervised anomaly detection with supervised threat classifiers trained on millions of real attack patterns. When a genuine threat is identified, ShieldAI provides a full attack narrative with timeline, affected assets, and recommended response actions.",
        "tech_stack": ["Python", "TensorFlow", "Elasticsearch", "Go", "Docker"],
        "features": [
            "Behavioral baselining that automatically adapts to each environment without manual tuning",
            "Multi-signal correlation across network, endpoint, and application layers",
            "Attack narrative generation with full kill-chain visualization and timeline",
            "Automated response playbooks that isolate compromised assets within seconds",
            "Compliance reporting for SOC 2, HIPAA, and PCI-DSS frameworks"
        ],
        "github_link": None,
        "demo_link": "https://shieldai.TRKFLY.ai",
        "case_study": (
            "## Background\n\n"
            "A healthcare SaaS company with strict HIPAA requirements was drowning in security alerts. Their existing "
            "SIEM generated over 4,000 alerts per day, but the three-person security team could only investigate about "
            "200. An internal audit revealed that critical alerts were being lost in the noise, and the mean time to "
            "detect a real incident was over 14 hours.\n\n"
            "## Implementation\n\n"
            "ShieldAI agents were deployed across the company's cloud infrastructure and began building behavioral "
            "baselines within 48 hours. The platform ingested the same data sources as the existing SIEM but applied "
            "ML-based correlation and scoring. Over the first two weeks, ShieldAI learned normal traffic patterns for "
            "each microservice and user group, progressively reducing false positives.\n\n"
            "## Results\n\n"
            "Daily alert volume dropped from 4,000 to 340, a 92% reduction. Every alert surfaced by ShieldAI included "
            "a confidence score, full context narrative, and suggested remediation steps. The mean time to detect "
            "genuine threats fell from 14 hours to 8 minutes. During month two, ShieldAI detected and auto-contained "
            "a credential stuffing attack that the legacy SIEM had classified as normal traffic.\n\n"
            "## Key Takeaway\n\n"
            "ShieldAI transformed the security team's workflow from reactive alert triage to proactive threat hunting. "
            "By eliminating false positives and providing rich attack context, the platform effectively tripled the "
            "team's capacity without adding headcount."
        ),
        "category": "Security",
        "status": "Live",
        "metrics": {"threats_blocked": "1.2M", "false_positive_reduction": "92%", "response_time": "<500ms"},
        "created_at": datetime(2024, 1, 10, tzinfo=timezone.utc),
    },
    {
        "title": "CloudWeave",
        "slug": "cloudweave",
        "tagline": "Declarative infrastructure that heals itself.",
        "description": "CloudWeave is an infrastructure orchestration platform for multi-cloud environments. It provides a declarative configuration language, continuous drift detection, and automated remediation to keep infrastructure in its desired state at all times.",
        "problem": "Organizations running workloads across multiple cloud providers face exponential complexity. Manual changes introduce configuration drift, terraform state conflicts block deployments, and a single misconfiguration can cause cascading outages. Infrastructure teams spend more time firefighting drift than building new capabilities.",
        "solution": "CloudWeave introduces a higher-level declarative layer on top of existing infrastructure-as-code tools. It continuously monitors deployed resources against their declared state, detects drift within minutes, and can auto-remediate or alert based on policy. The platform provides a unified control plane across AWS, GCP, and Azure with full audit trails.",
        "tech_stack": ["Go", "Terraform", "AWS", "GCP", "Prometheus", "Grafana"],
        "features": [
            "Unified declarative language that compiles to provider-specific configurations",
            "Continuous drift detection with configurable scan intervals down to 60 seconds",
            "Policy-based auto-remediation with approval workflows for critical resources",
            "Multi-cloud cost optimization with rightsizing recommendations and unused resource detection",
            "Full deployment history with one-click rollback and infrastructure diffing"
        ],
        "github_link": None,
        "demo_link": "https://cloudweave.TRKFLY.ai",
        "case_study": (
            "## Background\n\n"
            "A Series B startup running across AWS and GCP experienced three major outages in one quarter, all caused "
            "by configuration drift. Engineers were making manual changes to production resources that diverged from "
            "their Terraform state. The platform team had no visibility into what changed, when, or why, and rollbacks "
            "often introduced new inconsistencies.\n\n"
            "## Implementation\n\n"
            "CloudWeave was integrated with the existing Terraform codebase and cloud accounts. The platform imported "
            "current state across both providers and established a continuous reconciliation loop. Drift detection scans "
            "ran every 5 minutes, and auto-remediation policies were configured for networking and security group "
            "resources. All manual changes were flagged in real time with full attribution.\n\n"
            "## Results\n\n"
            "Drift-related incidents dropped to zero in the first full quarter. The platform detected and remediated "
            "847 drift events, 73% of which were auto-resolved without human intervention. Deployment frequency "
            "increased from twice weekly to multiple times daily as engineers gained confidence that infrastructure "
            "changes would not cause unexpected side effects. Cloud spend decreased 18% through automated rightsizing.\n\n"
            "## Key Takeaway\n\n"
            "CloudWeave turned infrastructure management from a reactive firefighting exercise into a predictable, "
            "automated workflow. The combination of continuous monitoring and policy-driven remediation eliminated an "
            "entire category of production incidents."
        ),
        "category": "Infrastructure",
        "status": "Live",
        "metrics": {"deployments": "500K+", "drift_detected": "99.7%", "downtime_prevented": "2400hrs"},
        "created_at": datetime(2023, 11, 5, tzinfo=timezone.utc),
    },
    {
        "title": "VoiceForge",
        "slug": "voiceforge",
        "tagline": "Build production voice AI agents in hours, not months.",
        "description": "VoiceForge is an end-to-end platform for building, training, and deploying conversational voice AI agents. It handles speech recognition, natural language understanding, dialog management, and speech synthesis in a unified pipeline with support for 42 languages.",
        "problem": "Building a production-grade voice assistant requires stitching together speech-to-text, NLU, dialog management, and text-to-speech systems. Each component has different latency profiles, failure modes, and scaling characteristics. Most teams spend 6-12 months on integration before they can even test their conversational design, and the resulting systems are brittle and expensive to maintain.",
        "solution": "VoiceForge provides a unified platform where teams design conversation flows visually, train custom language models with their domain data, and deploy voice agents to phone, web, and IoT channels. The platform manages the entire audio pipeline with optimized end-to-end latency, automatic language detection, and graceful fallback handling.",
        "tech_stack": ["Python", "Whisper", "LLaMA", "FastAPI", "WebSockets", "Redis"],
        "features": [
            "Visual conversation designer with branching logic, slot filling, and context management",
            "Custom wake word and domain-specific language model fine-tuning",
            "Sub-300ms end-to-end voice response latency with streaming synthesis",
            "Multi-channel deployment to phone (SIP/PSTN), web, mobile, and IoT devices",
            "Conversation analytics dashboard with sentiment tracking and drop-off analysis"
        ],
        "github_link": None,
        "demo_link": "https://voiceforge.TRKFLY.ai",
        "case_study": (
            "## Background\n\n"
            "A national insurance provider wanted to automate their claims intake process, which handled 50,000 calls "
            "per day. Their IVR system had a 34% abandonment rate due to rigid menu trees, and human agents spent an "
            "average of 8 minutes per call collecting basic information before any actual claims processing began.\n\n"
            "## Implementation\n\n"
            "VoiceForge was used to build a conversational agent that replaced the IVR menu with natural language "
            "interaction. The agent was trained on 100,000 historical call transcripts to understand insurance "
            "terminology and common caller intents. It collected claim details through natural conversation, verified "
            "policy information against the backend, and either resolved simple claims automatically or warm-transferred "
            "complex cases with full context.\n\n"
            "## Results\n\n"
            "Call abandonment dropped from 34% to 9%. The voice agent fully automated 62% of claims intake calls, "
            "reducing average handle time from 8 minutes to 2.5 minutes for routed calls. The system processed calls "
            "in English and Spanish with 96.8% intent recognition accuracy. Annual savings exceeded $4.2M in reduced "
            "agent staffing costs.\n\n"
            "## Key Takeaway\n\n"
            "VoiceForge enabled the insurance provider to deploy a sophisticated voice AI agent in 6 weeks instead of "
            "the 8-month timeline estimated for a custom build. The platform's pre-built components for telephony "
            "integration, language understanding, and conversation management eliminated the most time-consuming "
            "aspects of voice AI development."
        ),
        "category": "AI/ML",
        "status": "Live",
        "metrics": {"conversations": "10M+", "languages": "42", "accuracy": "96.8%"},
        "created_at": datetime(2024, 7, 1, tzinfo=timezone.utc),
    },
    {
        "title": "CodeLens",
        "slug": "codelens",
        "tagline": "AI-powered code review that catches what humans miss.",
        "description": "CodeLens is an AI code review agent that integrates directly into the pull request workflow. It performs deep static analysis, detects bugs and security vulnerabilities, identifies performance bottlenecks, and suggests concrete improvements with explanations.",
        "problem": "Code reviews are a bottleneck in every engineering organization. Senior engineers spend hours reviewing pull requests, reviews are inconsistent across reviewers, and subtle bugs and security issues regularly slip through to production. The problem compounds as teams grow and codebases become more complex.",
        "solution": "CodeLens acts as an always-available senior engineer that reviews every pull request within minutes. It combines traditional static analysis with LLM-powered semantic understanding to catch logical errors, security vulnerabilities, and design issues that rule-based tools miss. Every finding includes a clear explanation, severity rating, and suggested fix.",
        "tech_stack": ["Python", "Tree-sitter", "GPT-4", "GitHub API", "PostgreSQL"],
        "features": [
            "Deep semantic analysis that understands code intent, not just syntax patterns",
            "Security vulnerability detection covering OWASP Top 10 with proof-of-concept explanations",
            "Performance analysis identifying N+1 queries, memory leaks, and algorithmic inefficiencies",
            "Automated fix suggestions as ready-to-apply patches with test coverage validation",
            "Team analytics showing code quality trends, common defect patterns, and review metrics"
        ],
        "github_link": None,
        "demo_link": "https://codelens.TRKFLY.ai",
        "case_study": (
            "## Background\n\n"
            "A 200-engineer organization was struggling with code review throughput. The average pull request waited "
            "18 hours for initial review, and post-deployment bug rate was climbing quarter over quarter. A root cause "
            "analysis showed that 40% of production bugs were in code that had been reviewed but the issues were not "
            "caught by human reviewers.\n\n"
            "## Implementation\n\n"
            "CodeLens was integrated into the organization's GitHub Enterprise instance. It was configured to "
            "automatically review every pull request and post findings as inline comments. The team customized severity "
            "thresholds and added repository-specific rules for their internal frameworks. Over the first month, "
            "CodeLens analyzed 2,400 pull requests and flagged 5,200 issues across security, performance, and "
            "correctness categories.\n\n"
            "## Results\n\n"
            "Average time to first review feedback dropped from 18 hours to under 2 minutes. Post-deployment bug rate "
            "decreased 43% in the first quarter. CodeLens caught 127 security vulnerabilities that had not been flagged "
            "by human reviewers, including 8 critical SQL injection vectors and 12 authentication bypass issues. Senior "
            "engineers reported spending 60% less time on routine reviews and more time on architectural guidance.\n\n"
            "## Key Takeaway\n\n"
            "CodeLens did not replace human code review but fundamentally changed its nature. By handling the mechanical "
            "aspects of review, including correctness checking, security scanning, and style enforcement, the tool freed "
            "senior engineers to focus on design decisions and mentorship. The result was faster reviews, fewer bugs, "
            "and a more effective engineering organization."
        ),
        "category": "Developer Tools",
        "status": "Live",
        "metrics": {"repos_analyzed": "15K+", "bugs_caught": "340K", "avg_review_time": "< 2min"},
        "created_at": datetime(2024, 9, 12, tzinfo=timezone.utc),
    },
]


async def seed_products() -> None:
    logger.info("Connecting to MongoDB at %s", settings.MONGO_URI)
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]
    collection = db["products"]

    # Clear existing products
    result = await collection.delete_many({})
    logger.info("Cleared %d existing products", result.deleted_count)

    # Insert seed data
    insert_result = await collection.insert_many(PRODUCTS)
    logger.info("Seeded %d products", len(insert_result.inserted_ids))

    # Create index on slug for fast lookups
    await collection.create_index("slug", unique=True)
    logger.info("Created unique index on 'slug' field")

    client.close()
    logger.info("Seed complete")


if __name__ == "__main__":
    asyncio.run(seed_products())
