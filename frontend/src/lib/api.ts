import { Product, ContactFormData, ApplicationFormData, LearnRequest, LearnResponse, StructuredLearnResponse, DoubtRequest, DoubtResponse, SimplifyRequest, SimplifyResponse, GuideRequest, GuideResponse, Roadmap, RoadmapLanguage, CheatSheetRequest, CheatSheetResponse, InterviewQuestionsRequest, InterviewQuestionsResponse, InterviewGradeRequest, InterviewGradeResponse, DebugRequest, DebugResponse, CompilerRunRequest, CompilerRunResponse, AuthResponse, AuthUser, DsAnalyzeRequest, DsAnalyzeResponse, BiAnalyzeRequest, BiAnalyzeResponse, PlansResponse, AccessStatus, CreateOrderResponse } from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface ApiResponse<T> {
  data: T;
  error?: string;
}

/**
 * fetchApi with cold-start tolerance.
 * Render free tier sleeps after 15 min idle and takes 30-60s to wake.
 * We retry on network errors / aborts with a 75s total budget so the
 * first call of the day still succeeds.
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const TIMEOUT_MS = 35_000;   // each attempt
  const MAX_ATTEMPTS = 3;      // 3 × 35s = ~75s budget

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...options?.headers },
        signal: controller.signal,
        ...options,
      });
      clearTimeout(timer);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          data: null as unknown as T,
          error: errorData.detail || `Request failed with status ${response.status}`,
        };
      }
      const data = await response.json();
      return { data };
    } catch (error) {
      clearTimeout(timer);
      const isNetwork =
        error instanceof TypeError ||
        (error instanceof DOMException && error.name === "AbortError");
      // Retry on network/timeout errors only, not the final attempt
      if (isNetwork && attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      return {
        data: null as unknown as T,
        error: isNetwork
          ? "Server is waking up — please try again in 30 seconds."
          : (error instanceof Error ? error.message : "An unexpected error occurred"),
      };
    }
  }
  return { data: null as unknown as T, error: "Request failed after retries." };
}

export async function getProducts(): Promise<ApiResponse<Product[]>> {
  return fetchApi<Product[]>("/products");
}

export async function getProductBySlug(
  slug: string
): Promise<ApiResponse<Product>> {
  return fetchApi<Product>(`/products/${slug}`);
}

export async function submitContact(
  data: ContactFormData
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>("/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function submitApplication(
  data: ApplicationFormData
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>("/careers/apply", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generateLesson(
  data: LearnRequest
): Promise<ApiResponse<LearnResponse>> {
  return fetchApi<LearnResponse>("/learn/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getRoadmap(
  language: string
): Promise<ApiResponse<Roadmap>> {
  return fetchApi<Roadmap>(`/roadmap/${language}`);
}

export async function getRoadmapLanguages(): Promise<
  ApiResponse<{ languages: RoadmapLanguage[] }>
> {
  return fetchApi<{ languages: RoadmapLanguage[] }>("/roadmap/");
}

export async function generateStructuredLesson(
  data: LearnRequest
): Promise<ApiResponse<StructuredLearnResponse>> {
  return fetchApi<StructuredLearnResponse>("/learn/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function solveDoubt(
  data: DoubtRequest
): Promise<ApiResponse<DoubtResponse>> {
  return fetchApi<DoubtResponse>("/learn/doubt", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function simplifyContent(
  data: SimplifyRequest
): Promise<ApiResponse<SimplifyResponse>> {
  return fetchApi<SimplifyResponse>("/learn/simplify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getNextSuggestion(
  data: GuideRequest
): Promise<ApiResponse<GuideResponse>> {
  return fetchApi<GuideResponse>("/learn/guide", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCheatSheet(
  data: CheatSheetRequest
): Promise<ApiResponse<CheatSheetResponse>> {
  return fetchApi<CheatSheetResponse>("/learn/cheatsheet", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getInterviewQuestions(
  data: InterviewQuestionsRequest
): Promise<ApiResponse<InterviewQuestionsResponse>> {
  return fetchApi<InterviewQuestionsResponse>("/learn/interview/questions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function gradeInterview(
  data: InterviewGradeRequest
): Promise<ApiResponse<InterviewGradeResponse>> {
  return fetchApi<InterviewGradeResponse>("/learn/interview/grade", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function runCode(
  data: CompilerRunRequest
): Promise<ApiResponse<CompilerRunResponse>> {
  return fetchApi<CompilerRunResponse>("/compiler/run", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function debugError(
  data: DebugRequest
): Promise<ApiResponse<DebugResponse>> {
  return fetchApi<DebugResponse>("/compiler/debug", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function signup(email: string, password: string, handle?: string): Promise<ApiResponse<AuthResponse>> {
  return fetchApi<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, handle }),
  });
}

export async function login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  return fetchApi<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(token: string): Promise<ApiResponse<AuthUser>> {
  return fetchApi<AuthUser>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function analyzeDataset(
  data: DsAnalyzeRequest
): Promise<ApiResponse<DsAnalyzeResponse>> {
  return fetchApi<DsAnalyzeResponse>("/ds/analyze", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function analyzeBusinessIntelligence(
  data: BiAnalyzeRequest
): Promise<ApiResponse<BiAnalyzeResponse>> {
  return fetchApi<BiAnalyzeResponse>("/bi/analyze", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ─── Payments / Subscription ─── */

export async function getPlans(): Promise<ApiResponse<PlansResponse>> {
  return fetchApi<PlansResponse>("/payments/plans");
}

export async function getAccess(token: string): Promise<ApiResponse<AccessStatus>> {
  return fetchApi<AccessStatus>("/payments/access", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createPaymentOrder(
  token: string,
  plan: "monthly" | "quarterly" | "yearly",
): Promise<ApiResponse<CreateOrderResponse>> {
  return fetchApi<CreateOrderResponse>("/payments/order", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ plan }),
  });
}

export async function verifyPayment(
  token: string,
  payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    plan: "monthly" | "quarterly" | "yearly";
  },
): Promise<ApiResponse<{ success: boolean; plan: string; expires_at: string; days_active: number }>> {
  return fetchApi("/payments/verify", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
