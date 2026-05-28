from pydantic import BaseModel, Field


TOPICS = [
    "Python",
    "JavaScript",
    "TypeScript",
    "Java",
    "C++",
    "Go",
    "DSA",
    "React",
    "Node.js",
    "System Design",
    "SQL",
    "Docker",
    "Git",
    "Big Data",
    "Kubernetes",
    "Machine Learning",
    "Deep Learning",
    "Generative AI",
    "Agentic AI",
]

MODES = ["story", "technical", "interview", "easy"]


class LearnRequest(BaseModel):
    topic: str = Field(..., description="Topic to learn about")
    language: str = Field(default="English", description="Language for the explanation")
    mode: str = Field(..., description="Learning mode: story, technical, interview, or easy")
    subtopic: str | None = Field(default=None, description="Optional subtopic for deeper focus")


class LearnResponse(BaseModel):
    """Legacy response model kept for backward compatibility."""
    success: bool = True
    topic: str
    language: str
    mode: str
    content: str
    subtopic: str | None = None


class QuizItem(BaseModel):
    question: str
    options: list[str] = []
    correct_index: int = 0
    explanation: str = ""


class StructuredLearnResponse(BaseModel):
    """Structured AI response with definition, analogy, code, explanation."""
    success: bool = True
    topic: str
    language: str
    mode: str
    subtopic: str | None = None
    definition: str
    analogy: str
    code_example: str
    explanation: str
    next_topics: list[str] = []
    motivation: str = ""
    quiz: list[QuizItem] = []


class DoubtRequest(BaseModel):
    question: str = Field(..., description="User's doubt/question")
    context_topic: str = Field(..., description="Current topic context")
    language: str = Field(default="English")


class DoubtResponse(BaseModel):
    success: bool = True
    answer: str
    follow_up_suggestions: list[str] = []


class SimplifyRequest(BaseModel):
    content: str = Field(..., description="Content to simplify")
    topic: str
    language: str = Field(default="English")


class SimplifyResponse(BaseModel):
    success: bool = True
    simplified: str
    analogy: str = ""


class GuideRequest(BaseModel):
    current_topic: str
    completed_topics: list[str] = []
    language: str


class GuideResponse(BaseModel):
    success: bool = True
    next_topic: str
    reason: str
    motivation: str
    progress_message: str


class CheatSheetRequest(BaseModel):
    topic: str
    subtopic: str | None = None
    language: str = Field(default="English")


class CheatSheetResponse(BaseModel):
    success: bool = True
    bullets: list[str] = []
    one_liner: str = ""


class InterviewQuestionsRequest(BaseModel):
    topic: str
    subtopic: str | None = None
    language: str = Field(default="English")
    difficulty: str = Field(default="medium")  # easy | medium | hard


class InterviewQuestionsResponse(BaseModel):
    success: bool = True
    questions: list[str] = []


class InterviewAnswer(BaseModel):
    question: str
    answer: str


class InterviewGradeRequest(BaseModel):
    topic: str
    subtopic: str | None = None
    language: str = Field(default="English")
    answers: list[InterviewAnswer]


class InterviewGradeItem(BaseModel):
    score: int          # 0-10
    strengths: str
    improvements: str
    ideal_answer: str


class InterviewGradeResponse(BaseModel):
    success: bool = True
    overall_score: int = 0      # 0-10
    overall_feedback: str = ""
    per_question: list[InterviewGradeItem] = []
