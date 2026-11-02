from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

# --- Interview Generation Schemas ---
class InterviewGenerateRequest(BaseModel):
    topic: str = Field(..., example="Python")
    difficulty: str = Field(..., example="Beginner")
    num_questions: int = Field(5, ge=1, le=15, example=5)
    interview_type: str = Field("Technical Interview", example="Technical Interview")

class GeneratedQuestionItem(BaseModel):
    question_number: int
    question_text: str
    topic: str
    difficulty: str
    category: str

class InterviewGenerateResponse(BaseModel):
    session_id: str
    topic: str
    difficulty: str
    interview_type: str
    questions: List[GeneratedQuestionItem]
    is_demo_mode: bool = False
    ai_provider: str = "Google Gemini"
    message: Optional[str] = None

# --- Answer Evaluation Schemas ---
class AnswerEvaluationRequest(BaseModel):
    session_id: str
    question_number: int
    question_text: str
    user_answer: str = Field(..., max_length=5000)
    topic: str
    difficulty: str

class AnswerEvaluationResponse(BaseModel):
    overall_score: float = Field(..., ge=0, le=10)
    technical_accuracy_score: float = Field(..., ge=0, le=10)
    conceptual_understanding_score: float = Field(..., ge=0, le=10)
    completeness_score: float = Field(..., ge=0, le=10)
    clarity_score: float = Field(..., ge=0, le=10)
    what_went_well: str
    areas_to_improve: str
    missing_concepts: str
    corrected_explanation: Optional[str] = None
    improved_sample_answer: str
    personalized_recommendation: str
    follow_up_question: Optional[str] = None
    is_demo_mode: bool = False
    ai_provider: str = "Google Gemini"


# --- Follow-up Question Schemas ---
class FollowUpQuestionRequest(BaseModel):
    session_id: Optional[str] = None
    question_number: Optional[int] = None
    question_text: str
    user_answer: str
    topic: str
    difficulty: str

class FollowUpQuestionResponse(BaseModel):
    follow_up_question: str
    rationale: Optional[str] = None
    is_demo_mode: bool = False

# --- Session Summary Schemas ---
class SessionSummaryRequest(BaseModel):
    session_id: str

class SessionSummaryResponse(BaseModel):
    session_id: str
    total_questions: int
    questions_attempted: int
    average_score: float
    summary_text: str
    strongest_areas: List[str]
    weakest_areas: List[str]
    revision_concepts: List[str]
    recommendations: List[str]
    is_demo_mode: bool = False

# --- Session Details & History Schemas ---
class QuestionRecordDetail(BaseModel):
    id: int
    question_number: int
    topic: str
    difficulty: str
    category: str
    question_text: str
    user_answer: Optional[str] = None
    word_count: int = 0
    is_answered: bool = False
    is_evaluated: bool = False
    overall_score: Optional[float] = None
    technical_accuracy_score: Optional[float] = None
    conceptual_understanding_score: Optional[float] = None
    completeness_score: Optional[float] = None
    clarity_score: Optional[float] = None
    what_went_well: Optional[str] = None
    areas_to_improve: Optional[str] = None
    missing_concepts: Optional[str] = None
    corrected_explanation: Optional[str] = None
    improved_sample_answer: Optional[str] = None
    personalized_recommendation: Optional[str] = None
    follow_up_question: Optional[str] = None
    created_at: Optional[datetime] = None


    class Config:
        from_attributes = True

class PracticeSessionListItem(BaseModel):
    id: int
    session_id: str
    topic: str
    difficulty: str
    interview_type: str
    total_questions: int
    questions_attempted: int
    average_score: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class PracticeSessionDetail(BaseModel):
    id: int
    session_id: str
    topic: str
    difficulty: str
    interview_type: str
    total_questions: int
    questions_attempted: int
    average_score: float
    status: str
    created_at: datetime
    summary_text: Optional[str] = None
    strongest_areas: Optional[str] = None
    weakest_areas: Optional[str] = None
    revision_concepts: Optional[str] = None
    recommendations: Optional[str] = None
    questions: List[QuestionRecordDetail] = []

    class Config:
        from_attributes = True

# --- Analytics Schemas ---
class TopicPerformanceItem(BaseModel):
    topic: str
    average_score: float
    questions_count: int
    sessions_count: int

class ProgressionItem(BaseModel):
    session_id: str
    date: str
    topic: str
    average_score: float

class AnalyticsResponse(BaseModel):
    total_sessions: int
    questions_attempted: int
    average_score: float
    topics_practiced_count: int
    strongest_topic: Optional[str] = None
    weakest_topic: Optional[str] = None
    topic_performance: List[TopicPerformanceItem] = []
    session_score_progression: List[ProgressionItem] = []
    difficulty_breakdown: List[dict] = []

# --- Question Bank Schemas ---
class QuestionBankItem(BaseModel):
    id: int
    topic: str
    difficulty: str
    category: str
    question_text: str
    sample_answer: Optional[str] = None
    created_at: Optional[datetime] = None

class QuestionBankResponse(BaseModel):
    total: int
    questions: List[QuestionBankItem]
