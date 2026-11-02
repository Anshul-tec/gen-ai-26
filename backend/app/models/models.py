from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), unique=True, index=True, nullable=False)
    topic = Column(String(100), nullable=False)
    difficulty = Column(String(50), nullable=False)
    interview_type = Column(String(100), nullable=False)
    total_questions = Column(Integer, default=5)
    questions_attempted = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    status = Column(String(50), default="In Progress") # "In Progress", "Completed"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Session summary fields generated at completion
    summary_text = Column(Text, nullable=True)
    strongest_areas = Column(Text, nullable=True) # JSON or text
    weakest_areas = Column(Text, nullable=True)
    revision_concepts = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)

    # Relationship
    questions = relationship("QuestionRecord", back_populates="session", cascade="all, delete-orphan")


class QuestionRecord(Base):
    __tablename__ = "question_records"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("practice_sessions.session_id", ondelete="CASCADE"), nullable=False, index=True)
    question_number = Column(Integer, nullable=False)
    topic = Column(String(100), nullable=False)
    difficulty = Column(String(50), nullable=False)
    category = Column(String(100), default="Fundamentals")
    question_text = Column(Text, nullable=False)
    
    # User submission
    user_answer = Column(Text, nullable=True)
    word_count = Column(Integer, default=0)
    is_answered = Column(Boolean, default=False)
    is_evaluated = Column(Boolean, default=False)
    
    # Evaluation scores (0 to 10)
    overall_score = Column(Float, nullable=True)
    technical_accuracy_score = Column(Float, nullable=True)
    conceptual_understanding_score = Column(Float, nullable=True)
    completeness_score = Column(Float, nullable=True)
    clarity_score = Column(Float, nullable=True)
    
    # Detailed AI feedback
    what_went_well = Column(Text, nullable=True)
    areas_to_improve = Column(Text, nullable=True)
    missing_concepts = Column(Text, nullable=True)
    corrected_explanation = Column(Text, nullable=True)
    improved_sample_answer = Column(Text, nullable=True)
    personalized_recommendation = Column(Text, nullable=True)
    follow_up_question = Column(Text, nullable=True)
    
    evaluated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("PracticeSession", back_populates="questions")
