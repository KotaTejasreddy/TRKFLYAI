import { Product, OpenRole, Stat } from "@/types";

export const SITE = {
  name: "TRKFLY AI",
  tagline: "Engineering Intelligence at Scale",
  description:
    "We build AI-powered systems that solve real-world problems at production scale.",
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "LearnAI", href: "/learn" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Community", href: "/community" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export const STATS: Stat[] = [
  { label: "Products Shipped", value: 12 },
  { label: "Enterprise Clients", value: 120 },
  { label: "Engineers", value: 45 },
  { label: "Countries Served", value: 28 },
];

export const OPEN_ROLES: OpenRole[] = [
  {
    id: "1",
    title: "Senior ML Engineer",
    team: "AI Research",
    location: "Remote",
    type: "Full-time",
    description:
      "Design and implement large-scale ML training pipelines. Work on cutting-edge model architectures and optimization techniques.",
  },
  {
    id: "2",
    title: "Staff Backend Engineer",
    team: "Platform",
    location: "San Francisco, CA",
    type: "Full-time",
    description:
      "Build the core infrastructure powering our AI products. Design distributed systems handling millions of requests per second.",
  },
  {
    id: "3",
    title: "Frontend Engineer",
    team: "Product",
    location: "Remote",
    type: "Full-time",
    description:
      "Create beautiful, performant interfaces for complex AI systems. Work with Next.js, React, and WebGL.",
  },
  {
    id: "4",
    title: "DevOps / SRE",
    team: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    description:
      "Manage Kubernetes clusters, CI/CD pipelines, and monitoring systems. Ensure 99.99% uptime across all products.",
  },
  {
    id: "5",
    title: "AI Product Manager",
    team: "Product",
    location: "New York, NY",
    type: "Full-time",
    description:
      "Define product strategy for AI-powered products. Bridge the gap between technical capabilities and market needs.",
  },
];

export const STATIC_PRODUCTS: Product[] = [
  {
    _id: "1",
    title: "NeuralForge",
    slug: "neuralforge",
    tagline: "AI Model Training Platform",
    description:
      "Enterprise-grade platform for training, fine-tuning, and deploying custom AI models. Supports distributed training across GPU clusters with automatic hyperparameter optimization.",
    problem:
      "Training production-quality AI models requires deep ML expertise, massive infrastructure management, and months of iteration. Most teams waste 70% of their time on infrastructure instead of model development.",
    solution:
      "NeuralForge abstracts away infrastructure complexity with a declarative training pipeline. Teams define their model architecture and data sources, and NeuralForge handles distributed training, hyperparameter search, model versioning, and one-click deployment to production endpoints.",
    tech_stack: ["Python", "PyTorch", "Kubernetes", "Ray", "FastAPI", "Redis"],
    features: [
      "Distributed training across multi-GPU clusters",
      "Automated hyperparameter optimization with Bayesian search",
      "Real-time training metrics and experiment tracking",
      "One-click model deployment with auto-scaling",
      "Built-in data versioning and lineage tracking",
      "Support for custom training loops and architectures",
    ],
    github_link: null,
    demo_link: "https://demo.TRKFLY.ai/neuralforge",
    case_study:
      "A Fortune 500 retail company used NeuralForge to build a demand forecasting model that reduced inventory waste by 34%. The team of 3 ML engineers shipped a production model in 6 weeks instead of the estimated 6 months, training across 128 GPUs with automatic failover and checkpointing.",
    category: "AI/ML",
    status: "Live",
    metrics: {
      "Training Speed": "10x faster",
      "GPU Utilization": "94%",
      "Models Deployed": "2,400+",
    },
    created_at: "2024-01-15T00:00:00Z",
  },
  {
    _id: "2",
    title: "DataMesh Pro",
    slug: "datamesh-pro",
    tagline: "Intelligent Data Pipeline Orchestrator",
    description:
      "Self-healing data pipelines that automatically detect schema changes, optimize query performance, and ensure data quality across your entire data ecosystem.",
    problem:
      "Data teams spend 60% of their time fixing broken pipelines, debugging schema drift, and manually monitoring data quality. Traditional orchestrators like Airflow require constant babysitting and lack intelligent error recovery.",
    solution:
      "DataMesh Pro uses AI-powered anomaly detection to predict and prevent pipeline failures before they happen. It automatically adapts to schema changes, optimizes query execution plans, and provides end-to-end data lineage with quality scoring.",
    tech_stack: [
      "Go",
      "Apache Kafka",
      "PostgreSQL",
      "dbt",
      "Terraform",
      "gRPC",
    ],
    features: [
      "AI-powered anomaly detection and self-healing pipelines",
      "Automatic schema evolution handling",
      "Real-time data quality scoring and alerting",
      "End-to-end data lineage visualization",
      "Query performance optimization engine",
      "Multi-cloud data federation",
    ],
    github_link: "https://github.com/TRKFLY/datamesh-pro",
    demo_link: null,
    case_study:
      "A fintech startup processing 50M transactions daily deployed DataMesh Pro to replace their fragile Airflow setup. Pipeline failures dropped by 89%, and the team reclaimed 20 engineering hours per week previously spent on pipeline maintenance. Data freshness improved from 4 hours to 12 minutes.",
    category: "Platform",
    status: "Live",
    metrics: {
      "Pipeline Uptime": "99.97%",
      "Data Freshness": "< 1 min",
      "Pipelines Managed": "15,000+",
    },
    created_at: "2024-02-20T00:00:00Z",
  },
  {
    _id: "3",
    title: "SecureAI Gateway",
    slug: "secureai-gateway",
    tagline: "AI-Powered API Security Layer",
    description:
      "Intelligent API gateway that uses machine learning to detect and block threats in real-time, with zero-config protection against OWASP Top 10 and emerging attack vectors.",
    problem:
      "API attacks are growing 300% year-over-year, and traditional WAFs rely on static rules that miss novel attack patterns. Security teams are overwhelmed by false positives and cannot keep up with evolving threats.",
    solution:
      "SecureAI Gateway deploys ML models trained on billions of API transactions to detect anomalous patterns in real-time. It automatically generates and updates protection rules, provides contextual threat intelligence, and offers a developer-friendly SDK for custom security policies.",
    tech_stack: [
      "Rust",
      "TensorFlow",
      "eBPF",
      "Envoy Proxy",
      "ClickHouse",
      "React",
    ],
    features: [
      "ML-powered threat detection with 99.7% accuracy",
      "Zero-config OWASP Top 10 protection",
      "Real-time API traffic analysis and visualization",
      "Automatic rule generation from attack patterns",
      "Developer SDK for custom security policies",
      "SOC 2 and HIPAA compliance reporting",
    ],
    github_link: null,
    demo_link: "https://demo.TRKFLY.ai/secureai-gateway",
    case_study:
      "A healthcare SaaS platform handling PHI data deployed SecureAI Gateway and blocked 2.3M malicious requests in the first month. False positive rate dropped from 12% to 0.3% compared to their previous WAF, and the security team reduced incident response time by 78%.",
    category: "Security",
    status: "Live",
    metrics: {
      Accuracy: "99.7%",
      "Avg Latency": "< 2ms",
      "Threats Blocked": "50M+",
    },
    created_at: "2024-03-10T00:00:00Z",
  },
  {
    _id: "4",
    title: "CloudScale Orchestrator",
    slug: "cloudscale-orchestrator",
    tagline: "Autonomous Infrastructure Management",
    description:
      "AI-driven infrastructure orchestrator that automatically provisions, scales, and optimizes cloud resources across AWS, GCP, and Azure based on real-time workload analysis.",
    problem:
      "Cloud infrastructure costs are spiraling out of control, with most organizations over-provisioning by 40-60%. Manual scaling decisions are slow, error-prone, and cannot keep up with dynamic workload patterns.",
    solution:
      "CloudScale Orchestrator uses predictive ML models to forecast resource demand and automatically right-size infrastructure in real-time. It provides unified multi-cloud management, cost optimization recommendations, and automated compliance enforcement.",
    tech_stack: [
      "Go",
      "Kubernetes",
      "Prometheus",
      "Terraform",
      "Python",
      "TimescaleDB",
    ],
    features: [
      "Predictive auto-scaling with 15-minute lookahead",
      "Multi-cloud resource optimization",
      "Real-time cost analytics and anomaly detection",
      "Automated compliance policy enforcement",
      "Infrastructure drift detection and remediation",
      "Custom scaling policies with ML-driven recommendations",
    ],
    github_link: "https://github.com/TRKFLY/cloudscale",
    demo_link: "https://demo.TRKFLY.ai/cloudscale",
    case_study:
      "An e-commerce platform with $2M monthly cloud spend deployed CloudScale Orchestrator and reduced costs by 41% in the first quarter. Auto-scaling accuracy improved to 96%, eliminating the performance degradation during flash sales that previously cost $500K in lost revenue per event.",
    category: "Infrastructure",
    status: "Live",
    metrics: {
      "Cost Reduction": "41%",
      "Scale Accuracy": "96%",
      "Clusters Managed": "800+",
    },
    created_at: "2024-04-05T00:00:00Z",
  },
  {
    _id: "5",
    title: "CodeLens AI",
    slug: "codelens-ai",
    tagline: "Intelligent Code Review Assistant",
    description:
      "AI-powered code review tool that goes beyond linting to understand code semantics, detect architectural anti-patterns, and suggest performance optimizations with full context awareness.",
    problem:
      "Code reviews are a bottleneck in most engineering teams. Senior engineers spend 30% of their time reviewing code, yet still miss subtle bugs, security vulnerabilities, and architectural issues that only surface in production.",
    solution:
      "CodeLens AI uses large language models fine-tuned on millions of code reviews to provide instant, context-aware feedback. It understands your codebase architecture, identifies potential issues before they reach production, and learns your team's coding standards over time.",
    tech_stack: [
      "Python",
      "TypeScript",
      "Tree-sitter",
      "OpenAI API",
      "Neo4j",
      "Next.js",
    ],
    features: [
      "Context-aware code review with architectural understanding",
      "Security vulnerability detection (SAST)",
      "Performance anti-pattern identification",
      "Team-specific coding standard enforcement",
      "Automated refactoring suggestions with diffs",
      "Integration with GitHub, GitLab, and Bitbucket",
    ],
    github_link: "https://github.com/TRKFLY/codelens-ai",
    demo_link: null,
    case_study:
      "A Series B startup with 40 engineers integrated CodeLens AI into their CI pipeline. Bug escape rate to production dropped by 56%, code review turnaround time decreased from 2 days to 4 hours, and the team shipped 30% more features per sprint while maintaining code quality metrics.",
    category: "Developer Tools",
    status: "Beta",
    metrics: {
      "Bugs Caught": "56% more",
      "Review Time": "4 hours",
      "Repos Analyzed": "5,000+",
    },
    created_at: "2024-05-18T00:00:00Z",
  },
  {
    _id: "6",
    title: "SynthVoice Studio",
    slug: "synthvoice-studio",
    tagline: "Enterprise Voice AI Platform",
    description:
      "Production-ready voice AI platform for building custom voice assistants, real-time speech analytics, and voice cloning with enterprise-grade security and compliance.",
    problem:
      "Building voice AI applications requires stitching together multiple fragile services for ASR, NLU, TTS, and dialog management. Latency is unacceptable for real-time use cases, and most solutions lack enterprise security controls.",
    solution:
      "SynthVoice Studio provides an end-to-end voice AI platform with sub-200ms latency. It combines state-of-the-art speech recognition, natural language understanding, and voice synthesis in a single API with built-in dialog management, voice cloning, and enterprise SSO.",
    tech_stack: [
      "Python",
      "C++",
      "WebRTC",
      "ONNX Runtime",
      "Redis",
      "Docker",
    ],
    features: [
      "Sub-200ms end-to-end voice pipeline latency",
      "Custom voice cloning with 30 seconds of audio",
      "Real-time speech analytics and sentiment detection",
      "Multi-language support (40+ languages)",
      "Enterprise SSO and audit logging",
      "On-premise deployment option for regulated industries",
    ],
    github_link: null,
    demo_link: "https://demo.TRKFLY.ai/synthvoice",
    case_study:
      "A major telecom provider deployed SynthVoice Studio to power their customer service voice assistant, handling 2M calls per month. Customer satisfaction scores increased by 23%, average call handling time dropped by 45%, and the system achieved 97.3% intent recognition accuracy across 15 languages.",
    category: "AI/ML",
    status: "Beta",
    metrics: {
      Latency: "< 200ms",
      Languages: "40+",
      "Calls Processed": "10M+",
    },
    created_at: "2024-06-22T00:00:00Z",
  },
  {
    _id: "7",
    title: "PulseAI — Content Intelligence Platform",
    slug: "pulseai",
    tagline: "AI-Powered Content Intelligence Platform (SaaS)",
    description:
      "PulseAI is a production-grade SaaS platform that transforms how businesses create, analyze, and optimize content. Powered by advanced AI models, it delivers real-time content analysis, sentiment detection, SEO optimization, and intelligent recommendations through an intuitive dashboard — enabling teams to produce higher-quality content at 10x the speed.",
    problem:
      "Content teams are drowning in manual workflows — writing, editing, SEO optimization, and performance analysis are siloed across dozens of tools. Most content goes live without data-driven insights, leading to poor engagement, low search visibility, and wasted creative effort.",
    solution:
      "PulseAI unifies the entire content lifecycle into a single intelligent platform. Its AI engine analyzes content in real-time for readability, sentiment, SEO strength, and audience fit. Writers get instant, actionable suggestions while editors get a bird's-eye view of content quality across the entire pipeline — all from one dashboard.",
    tech_stack: [
      "React",
      "Node.js",
      "Python",
      "FastAPI",
      "MongoDB",
      "OpenAI API",
      "TailwindCSS",
      "Redis",
      "Docker",
    ],
    features: [
      "AI-powered content analysis with quality scoring",
      "Real-time sentiment detection and tone analysis",
      "SEO optimization engine with keyword intelligence",
      "Content performance analytics dashboard",
      "Team collaboration with role-based access",
      "Smart content recommendations and topic clustering",
      "Readability scoring with improvement suggestions",
      "Multi-format support: blogs, social media, emails, landing pages",
    ],
    github_link: null,
    demo_link: null,
    launch_url: "https://smic-fj6m.onrender.com",
    case_study:
      "A digital marketing agency managing content for 30+ brands deployed PulseAI to centralize their content operations. Content production speed increased by 4x, average SEO scores improved by 62%, and the editorial team eliminated 15+ hours per week of manual review. Client satisfaction scores rose by 38% within the first quarter.",
    category: "SaaS",
    status: "Live",
    metrics: {
      "Content Analyzed": "500K+",
      "Avg SEO Boost": "+62%",
      "Active Teams": "200+",
    },
    created_at: "2024-07-10T00:00:00Z",
  },
  {
    _id: "8",
    title: "AI Digital Twin Platform",
    slug: "ai-digital-twin",
    tagline: "Autonomous Personality-Driven Digital Replicas",
    description:
      "The AI Digital Twin Platform is a next-generation intelligent system that creates autonomous, personality-driven digital replicas of individuals. Built on a multi-agent AI architecture powered by Anthropic Claude and OpenAI GPT-4o with automatic failover, it orchestrates seven specialized AI agents through a central Supervisor that classifies intent, decomposes tasks, executes with dependency-aware parallelism, and synthesizes coherent responses — all while maintaining strict personality consistency.",
    problem:
      "Leaders and professionals face an impossible scaling challenge: 42% of institutional knowledge is never documented, CEOs can't personally respond to every stakeholder, executives make 35,000+ decisions daily with low-value ones consuming strategic bandwidth, global operations demand 24/7 presence, and maintaining a consistent voice across hundreds of interactions is humanly impossible.",
    solution:
      "The platform creates an intelligent digital replica that thinks, communicates, and decides like you — available 24/7, infinitely scalable, and continuously learning. It uses Big Five personality modeling with 10 communication traits, a three-tier semantic memory system (Working, Long-Term, Episodic), and seven specialized AI agents orchestrated by a Supervisor with dependency-aware parallel execution.",
    tech_stack: [
      "Python",
      "FastAPI",
      "Anthropic Claude",
      "OpenAI GPT-4o",
      "FAISS",
      "Redis",
      "JWT Auth",
      "Pydantic",
      "Docker",
      "WebSocket",
    ],
    features: [
      "7 specialized AI agents with central Supervisor orchestration",
      "Big Five personality cloning with 10 communication trait dimensions",
      "Three-tier memory: Working (Redis), Long-Term (FAISS vectors), Episodic",
      "Dual-LLM failover (Claude + GPT-4o) for 99.9%+ availability",
      "Document understanding with auto-extraction, chunking, and vector embedding",
      "Platform-aware adaptive communication (Chat, Email, Business, Social)",
      "Personality-aligned decision intelligence with confidence scoring",
      "Real-time WebSocket streaming chat with JWT authentication",
    ],
    github_link: null,
    demo_link: null,
    launch_url: "https://ai-digital-twin-platform.onrender.com",
    case_study:
      "A Fortune 500 executive team deployed the AI Digital Twin Platform to scale leadership presence across 12 time zones. The CEO's digital twin handled 2,000+ stakeholder interactions per month with 94% personality consistency scores. Response time dropped from 48 hours to under 2 minutes, and the executive team reclaimed 20+ hours per week previously spent on routine communications. Knowledge retention improved by 67% as institutional expertise was captured in queryable, interactive twin profiles.",
    category: "SaaS",
    status: "Live",
    metrics: {
      "AI Agents": "7",
      "Memory Tiers": "3",
      "LLM Providers": "2",
    },
    created_at: "2024-08-15T00:00:00Z",
  },
  {
    _id: "9",
    title: "OMNISCIENCE DS",
    slug: "omniscience-ds",
    tagline: "Autonomous Multi-Agent Data Science Platform",
    description:
      "An end-to-end autonomous data science ecosystem that operates like an elite enterprise AI team. OMNISCIENCE DS orchestrates 35 specialized AI agents through a central Supervisor to perform the complete data science workflow — from business understanding to production deployment to continuous monitoring — with zero human dependency. It thinks, reasons, validates, and self-improves like a 50-year veteran data scientist combined with a senior ML researcher, MLOps engineer, and business strategist.",
    problem:
      "Building a world-class data science capability requires 6+ specialists per use case (engineers, analysts, ML researchers, MLOps engineers), takes 6–12 months from concept to production, and 70% of insights die in PowerPoint instead of operating systems. Most companies cannot hire fast enough or afford the talent depth to compete with the data science teams of Google, Netflix, or Bloomberg.",
    solution:
      "OMNISCIENCE DS replaces an entire data science department with an autonomous multi-agent AI system. A central Supervisor Agent coordinates 35 specialized agents — Business Understanding, Data Engineering, Statistics, ML, Deep Learning, NLP, Time-Series, Explainable AI, MLOps, Deployment, Drift Monitoring, Anomaly Detection, Root-Cause, Governance, and more — executing the full 0→100 workflow with continuous self-validation, bias detection, hallucination guards, and explainable reasoning at every step. Every output is enterprise-grade and every decision is auditable.",
    tech_stack: [
      "Python",
      "FastAPI",
      "PyTorch",
      "TensorFlow",
      "XGBoost",
      "LightGBM",
      "Apache Spark",
      "Kafka",
      "Airflow",
      "MLflow",
      "Docker",
      "Kubernetes",
      "Anthropic Claude",
      "OpenAI",
      "LangGraph",
      "FAISS",
      "PostgreSQL",
      "Redis",
      "Snowflake",
      "Grafana",
    ],
    features: [
      "35-agent ecosystem orchestrated by a central Supervisor with dependency-aware parallel execution",
      "Autonomous end-to-end workflow: ingest → clean → analyze → model → deploy → monitor",
      "Multi-source data collection: SQL, NoSQL, REST/streaming APIs, Kafka, IoT, PDFs, web, sensors",
      "Automated feature engineering with leakage and bias detection",
      "Full ML stack: classification, regression, clustering, ranking, ensembles, AutoML hyperparameter tuning",
      "Deep learning agents for CNN, RNN, LSTM, Transformer, and attention-based architectures",
      "Time-series forecasting with ARIMA, Prophet, LSTM, and Transformer models",
      "NLP agent with embedding, summarization, sentiment, NER, and RAG pipelines",
      "Explainable AI: SHAP, LIME, feature importance, plus business-translated insight reports",
      "MLOps automation — experiment tracking, model versioning, CI/CD, autoscaling, Kubernetes deploy",
      "Real-time drift detection with automatic retraining triggers and rollback safety",
      "Anomaly Detection Agent for fraud, cyber threats, and operational failures",
      "Root-Cause Analysis Agent that traces metric drops back to source events",
      "Executive Report & Dashboard agents that turn technical outputs into stakeholder-ready artifacts",
      "Compliance, governance, and PII-safety enforced at every pipeline stage",
      "Continuous self-improvement loop with periodic model audit and re-benchmarking",
    ],
    github_link: null,
    demo_link: null,
    launch_url: "/ds",
    case_study:
      "A Fortune 100 retail client replaced a 24-person internal data science team with OMNISCIENCE DS for forecasting and dynamic pricing. Time-to-production for new models dropped from 4 months to 6 days, monthly forecast accuracy improved by 18%, and operational anomalies were caught on average 14 hours earlier than the previous manual workflow. The Supervisor Agent flagged two data-leakage incidents that had already shipped to production under the prior team, preventing an estimated $4.2M in margin erosion across the holiday quarter.",
    category: "AI/ML",
    status: "Beta",
    metrics: {
      "AI Agents": "35",
      "Time to Production": "6 days",
      "Forecast Accuracy": "+18%",
    },
    created_at: "2024-09-12T00:00:00Z",
  },
  {
    _id: "10",
    title: "HELIOS BI",
    slug: "helios-bi",
    tagline: "Autonomous Multi-Agent Business Intelligence Platform",
    description:
      "An end-to-end autonomous business intelligence ecosystem that thinks like a Chief Analytics Officer. HELIOS BI orchestrates 35 specialist analyst agents — KPI tracking, customer/product/financial/marketing/operations analytics, forecasting, root-cause analysis, and executive synthesis — turning raw operational data into board-ready strategic action plans within minutes.",
    problem:
      "Most companies drown in dashboards but starve for insight. Analytics teams spend 70% of their time wrangling SQL and 30% generating reports, leaving almost no time for strategic interpretation. Critical KPI drops are caught days late, root causes are guessed at, and executive decisions are made on outdated PDF reports. Hiring a McKinsey-grade analytics function costs $5M+/year and still takes weeks to deliver one insight.",
    solution:
      "HELIOS BI replaces an entire BI team with an autonomous multi-agent system. A Supervisor Analytics Agent coordinates 35 specialists — Business Understanding, KPI Management, SQL Analytics, EDA, Product Analytics, Customer Analytics, Financial Analytics, Operations, Sales, Marketing, Funnel, Cohort, Retention, User Behavior, Forecasting, Root-Cause, Anomaly Detection, Decision Support, Executive Summary, and more — that ingest business data, validate it, analyze it from every strategic angle, and deliver a CEO-ready brief with prioritized action items, owners, and expected impact.",
    tech_stack: [
      "Python",
      "FastAPI",
      "Anthropic Claude",
      "OpenAI",
      "LangGraph",
      "PostgreSQL",
      "Snowflake",
      "BigQuery",
      "Apache Airflow",
      "dbt",
      "Apache Superset",
      "Grafana",
      "Redis",
      "Kafka",
      "Prophet",
      "scikit-learn",
      "Docker",
      "Kubernetes",
    ],
    features: [
      "35-agent BI ecosystem orchestrated by a central Supervisor Analytics Agent",
      "Autonomous workflow: ingest → validate → analyze → forecast → recommend → brief executives",
      "Multi-domain analytics: customer, product, financial, marketing, operations, sales",
      "Auto-generated KPI panel with health scoring (good / warning / critical) and trend direction",
      "Funnel, cohort, retention, and user-behavior analytics with drop-off detection",
      "Forecasting agent (revenue, demand, traffic, growth) with confidence framing",
      "Root-Cause Analysis Agent that traces KPI drops back to source segments and events",
      "Anomaly Detection across revenue, traffic, transactions, and operational signals",
      "Strategic recommendations + prioritized action items with owner and expected impact",
      "Auto-suggested dashboard widgets ready for Power BI / Tableau / Grafana / Looker",
      "Executive summary in plain business language — board-ready in one click",
      "Multi-source ingestion: SQL, BigQuery, Snowflake, CRM, ERP, APIs, Kafka, CSV/Excel",
      "Data governance, lineage, and PII safety enforced at every step",
      "Multi-language reporting for global stakeholder teams",
    ],
    github_link: null,
    demo_link: null,
    launch_url: "/bi",
    case_study:
      "A Series C SaaS company replaced its 12-person analytics team with HELIOS BI for revenue, retention, and product analytics. Weekly executive reports that took 14 person-hours to compile were generated in 6 minutes. The Root-Cause Analysis Agent identified that 64% of churn was concentrated in one onboarding step the team had not instrumented — a fix the next sprint recovered $1.8M in annual recurring revenue. CAC across paid channels dropped by 23% after the Marketing Analytics Agent reallocated budget from underperforming attribution paths.",
    category: "SaaS",
    status: "Beta",
    metrics: {
      "Analyst Agents": "35",
      "Report Time": "6 min",
      "ARR Recovered": "$1.8M",
    },
    created_at: "2024-10-08T00:00:00Z",
  },
];

export const PRODUCT_CATEGORIES = [
  "All",
  "AI/ML",
  "Platform",
  "Infrastructure",
  "Security",
  "Developer Tools",
  "SaaS",
];

export const ENGINEERING_PRINCIPLES = [
  {
    title: "System Design First",
    description:
      "Every product begins with a rigorous system design phase. We model failure modes, define SLAs, and architect for 10x growth before writing a single line of code.",
    icon: "blueprint",
  },
  {
    title: "Production-Grade Code",
    description:
      "We ship code that meets the standards of top-tier tech companies. Comprehensive testing, observability, and documentation are non-negotiable in every release.",
    icon: "code",
  },
  {
    title: "Scalable Architecture",
    description:
      "Our systems are designed to handle millions of requests per second. We leverage distributed computing, intelligent caching, and event-driven patterns to ensure linear scalability.",
    icon: "scale",
  },
  {
    title: "Security by Default",
    description:
      "Security is not an afterthought. Every system undergoes threat modeling, implements zero-trust principles, and maintains compliance with SOC 2, HIPAA, and GDPR standards.",
    icon: "shield",
  },
];

export const COMPANY_VALUES = [
  {
    title: "Relentless Innovation",
    description:
      "We push the boundaries of what AI can do. Our team publishes research, contributes to open source, and constantly experiments with emerging technologies.",
    icon: "lightbulb",
  },
  {
    title: "Ownership Mentality",
    description:
      "Every engineer owns their domain end-to-end. From design to deployment to on-call, we build it, we run it, we improve it.",
    icon: "flag",
  },
  {
    title: "Transparent by Default",
    description:
      "We share context openly across teams. Our architecture decisions, postmortems, and roadmaps are accessible to everyone in the company.",
    icon: "eye",
  },
  {
    title: "Impact Over Output",
    description:
      "We measure success by the problems we solve, not the code we ship. A 10-line fix that saves customers hours is worth more than a 10,000-line feature nobody uses.",
    icon: "target",
  },
];
