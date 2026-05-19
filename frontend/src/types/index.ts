export interface Product {
  _id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  problem: string;
  solution: string;
  tech_stack: string[];
  features: string[];
  github_link: string | null;
  demo_link: string | null;
  launch_url?: string | null;
  case_study: string;
  category: string;
  status: string;
  metrics: Record<string, string>;
  created_at: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ApplicationFormData {
  name: string;
  email: string;
  role: string;
  resume_link: string;
  cover_note: string;
}

export interface OpenRole {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  description: string;
}

export interface Stat {
  label: string;
  value: number;
}

export interface RoadmapTopic {
  id: string;
  title: string;
  description: string;
}

export interface RoadmapSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  topics: RoadmapTopic[];
}

export interface Roadmap {
  success?: boolean;
  language: string;
  title: string;
  description: string;
  sections: RoadmapSection[];
  total_topics: number;
}

export interface RoadmapLanguage {
  id: string;
  language: string;
  title: string;
  description: string;
  sections_count: number;
  topics_count: number;
}

export interface LearnRequest {
  topic: string;
  language: string;
  mode: string;
  subtopic?: string;
}

export interface LearnResponse {
  success: boolean;
  topic: string;
  language: string;
  mode: string;
  content: string;
  subtopic: string | null;
}

export interface QuizItem {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface CheatSheetRequest {
  topic: string;
  subtopic?: string;
  language?: string;
}

export interface CheatSheetResponse {
  success: boolean;
  bullets: string[];
  one_liner: string;
}

export interface InterviewQuestionsRequest {
  topic: string;
  subtopic?: string;
  language?: string;
  difficulty?: "easy" | "medium" | "hard";
}
export interface InterviewQuestionsResponse {
  success: boolean;
  questions: string[];
}
export interface InterviewAnswer {
  question: string;
  answer: string;
}
export interface InterviewGradeRequest {
  topic: string;
  subtopic?: string;
  language?: string;
  answers: InterviewAnswer[];
}
export interface InterviewGradeItem {
  score: number;
  strengths: string;
  improvements: string;
  ideal_answer: string;
}
export interface InterviewGradeResponse {
  success: boolean;
  overall_score: number;
  overall_feedback: string;
  per_question: InterviewGradeItem[];
}

export interface DebugRequest {
  code: string;
  error: string;
  language?: string;
  response_language?: string;
}

export interface DebugResponse {
  success: boolean;
  explanation: string;
  likely_cause: string;
  suggested_fix: string;
  fixed_code: string;
}

export interface CompilerRunRequest {
  language: string;
  code: string;
  stdin?: string;
  timeout?: number;
}

export interface CompilerRunResponse {
  success: boolean;
  ok: boolean;
  stdout: string;
  stderr: string;
  exit_code: number;
  runtime_ms: number;
  timed_out: boolean;
  compile_error?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  handle?: string | null;
  xp: number;
  streak_days: number;
  last_active_date?: string | null;
  created_at?: string | null;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export interface DsColumnProfile {
  name: string;
  inferred_type: string;
  missing_count: number;
  unique_count: number;
  sample_values: string[];
}

export interface DsAnalyzeRequest {
  file_name: string;
  business_question: string;
  row_count: number;
  columns: DsColumnProfile[];
  csv_preview: string;
  response_language?: string;
}

export interface CodeArtifact {
  language: string;
  title: string;
  code: string;
  notes: string;
}

export interface CostEstimate {
  monthly_usd: string;
  breakdown: string[];
  optimization_tips: string[];
}

export interface DsAnalyzeResponse {
  success: boolean;
  problem_understanding: string;
  assumptions: string[];
  data_quality: { summary: string; issues: string[]; score: number };
  eda_findings: string[];
  statistical_insights: string[];
  feature_engineering: string[];
  ml_approach: { problem_type: string; recommended_models: string[]; reasoning: string };
  risks: string[];
  bias_warnings: string[];
  business_impact: { summary: string; estimated_value: string; kpis: string[] };
  deployment_strategy: string;
  monitoring_strategy: string;
  next_steps: string[];
  executive_summary: string;
  sql_queries?: CodeArtifact[];
  production_code?: CodeArtifact;
  deployment_artifacts?: CodeArtifact[];
  architecture_diagram?: string;
  hyperparameters?: Record<string, string>;
  cost_estimate?: CostEstimate;
}

export interface BiAnalyzeRequest {
  file_name: string;
  business_question: string;
  industry?: string;
  row_count: number;
  columns: DsColumnProfile[];
  csv_preview: string;
  response_language?: string;
}

export interface KpiItem {
  name: string;
  current_value: string;
  trend: string;          // "up" | "down" | "flat"
  health: string;         // "good" | "warning" | "critical"
  notes: string;
}

export interface ActionItem {
  action: string;
  owner: string;
  priority: string;       // "high" | "medium" | "low"
  impact: string;
}

export interface SqlArtifact {
  title: string;
  purpose: string;
  sql: string;
  notes: string;
}

export interface DashboardWidget {
  title: string;
  chart_type: string;
  metric: string;
  dimensions: string[];
  refresh: string;
  notes: string;
}

export interface AlertRule {
  name: string;
  metric: string;
  condition: string;
  severity: string;
  channel: string;
  rationale: string;
}

export interface ForecastSpec {
  metric: string;
  horizon: string;
  method: string;
  expected_outcome: string;
}

export interface BiAnalyzeResponse {
  success: boolean;
  business_understanding: string;
  kpis: KpiItem[];
  trend_analysis: string[];
  customer_insights: string[];
  product_insights: string[];
  financial_insights: string[];
  marketing_insights: string[];
  operational_insights: string[];
  root_cause_analysis: string[];
  anomalies: string[];
  risks: string[];
  opportunities: string[];
  forecasts: string[];
  strategic_recommendations: string[];
  dashboard_recommendations: string[];
  action_items: ActionItem[];
  executive_summary: string;
  sql_queries?: SqlArtifact[];
  dashboard_widgets?: DashboardWidget[];
  alert_rules?: AlertRule[];
  forecast_specs?: ForecastSpec[];
  nlp_queries?: string[];
}

export interface StructuredLearnResponse {
  success: boolean;
  topic: string;
  language: string;
  mode: string;
  subtopic: string | null;
  definition: string;
  analogy: string;
  code_example: string;
  explanation: string;
  next_topics: string[];
  motivation: string;
  quiz?: QuizItem[];
}

export interface DoubtRequest {
  question: string;
  context_topic: string;
  language: string;
}

export interface DoubtResponse {
  success: boolean;
  answer: string;
  follow_up_suggestions: string[];
}

export interface SimplifyRequest {
  content: string;
  topic: string;
  language: string;
}

export interface SimplifyResponse {
  success: boolean;
  simplified: string;
  analogy: string;
}

export interface GuideRequest {
  current_topic: string;
  completed_topics: string[];
  language: string;
}

export interface GuideResponse {
  success: boolean;
  next_topic: string;
  reason: string;
  motivation: string;
  progress_message: string;
}

export interface TopicProgress {
  topicId: string;
  completed: boolean;
  completedAt?: string;
}
