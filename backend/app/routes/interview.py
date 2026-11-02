import uuid
import json
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import PracticeSession, QuestionRecord
from app.schemas.schemas import (
    InterviewGenerateRequest,
    InterviewGenerateResponse,
    GeneratedQuestionItem,
    AnswerEvaluationRequest,
    AnswerEvaluationResponse,
    FollowUpQuestionRequest,
    FollowUpQuestionResponse,
    SessionSummaryRequest,
    SessionSummaryResponse
)
from app.services.gemini_service import gemini_service

logger = logging.getLogger("ai_interview.routes")
router = APIRouter(prefix="/api/interview", tags=["Interview"])

@router.post("/generate", response_model=InterviewGenerateResponse)
def generate_interview(request: InterviewGenerateRequest, db: Session = Depends(get_db)):
    """Generate interview questions via Gemini and create a practice session in SQLite."""
    try:
        result = gemini_service.generate_interview_questions(
            topic=request.topic,
            difficulty=request.difficulty,
            num_questions=request.num_questions,
            interview_type=request.interview_type
        )
    except Exception as e:
        logger.error(f"Error during interview generation: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Question Generation Error: {str(e)}"
        )

    questions_data = result["questions"]
    session_id = str(uuid.uuid4())

    # Create new practice session in DB
    new_session = PracticeSession(
        session_id=session_id,
        topic=request.topic,
        difficulty=request.difficulty,
        interview_type=request.interview_type,
        total_questions=len(questions_data),
        questions_attempted=0,
        average_score=0.0,
        status="In Progress",
        created_at=datetime.utcnow()
    )
    db.add(new_session)

    # Add question records
    for q in questions_data:
        record = QuestionRecord(
            session_id=session_id,
            question_number=q["question_number"],
            topic=request.topic,
            difficulty=request.difficulty,
            category=q.get("category", "Fundamentals"),
            question_text=q["question_text"],
            is_answered=False,
            is_evaluated=False,
            created_at=datetime.utcnow()
        )
        db.add(record)

    db.commit()

    return InterviewGenerateResponse(
        session_id=session_id,
        topic=request.topic,
        difficulty=request.difficulty,
        interview_type=request.interview_type,
        questions=[GeneratedQuestionItem(**q) for q in questions_data],
        is_demo_mode=result.get("is_demo_mode", False),
        ai_provider="Google Gemini AI" if not result.get("is_demo_mode") else "Curated Practice Bank (Demo Mode)",
        message=result.get("message")
    )


@router.post("/evaluate", response_model=AnswerEvaluationResponse)
def evaluate_answer(request: AnswerEvaluationRequest, db: Session = Depends(get_db)):
    """Evaluate candidate answer using Gemini and persist score and constructive feedback."""
    session_record = db.query(PracticeSession).filter(PracticeSession.session_id == request.session_id).first()
    if not session_record:
        raise HTTPException(status_code=404, detail="Practice session not found.")

    # Find the question record
    q_record = db.query(QuestionRecord).filter(
        QuestionRecord.session_id == request.session_id,
        QuestionRecord.question_number == request.question_number
    ).first()

    # Call Gemini evaluation
    try:
        eval_result = gemini_service.evaluate_answer(
            question_text=request.question_text,
            user_answer=request.user_answer,
            topic=request.topic,
            difficulty=request.difficulty
        )
    except Exception as e:
        logger.error(f"Error during answer evaluation: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Answer Evaluation Error: {str(e)}"
        )

    word_count = len(request.user_answer.strip().split())

    if q_record:
        q_record.user_answer = request.user_answer
        q_record.word_count = word_count
        q_record.is_answered = True
        q_record.is_evaluated = True
        q_record.overall_score = eval_result["overall_score"]
        q_record.technical_accuracy_score = eval_result["technical_accuracy_score"]
        q_record.conceptual_understanding_score = eval_result["conceptual_understanding_score"]
        q_record.completeness_score = eval_result["completeness_score"]
        q_record.clarity_score = eval_result["clarity_score"]
        q_record.what_went_well = eval_result["what_went_well"]
        q_record.areas_to_improve = eval_result["areas_to_improve"]
        q_record.missing_concepts = eval_result["missing_concepts"]
        q_record.corrected_explanation = eval_result.get("corrected_explanation")
        q_record.improved_sample_answer = eval_result["improved_sample_answer"]
        q_record.personalized_recommendation = eval_result["personalized_recommendation"]
        q_record.follow_up_question = eval_result.get("follow_up_question")
        q_record.evaluated_at = datetime.utcnow()
    else:
        q_record = QuestionRecord(
            session_id=request.session_id,
            question_number=request.question_number,
            topic=request.topic,
            difficulty=request.difficulty,
            question_text=request.question_text,
            user_answer=request.user_answer,
            word_count=word_count,
            is_answered=True,
            is_evaluated=True,
            overall_score=eval_result["overall_score"],
            technical_accuracy_score=eval_result["technical_accuracy_score"],
            conceptual_understanding_score=eval_result["conceptual_understanding_score"],
            completeness_score=eval_result["completeness_score"],
            clarity_score=eval_result["clarity_score"],
            what_went_well=eval_result["what_went_well"],
            areas_to_improve=eval_result["areas_to_improve"],
            missing_concepts=eval_result["missing_concepts"],
            corrected_explanation=eval_result.get("corrected_explanation"),
            improved_sample_answer=eval_result["improved_sample_answer"],
            personalized_recommendation=eval_result["personalized_recommendation"],
            follow_up_question=eval_result.get("follow_up_question"),
            evaluated_at=datetime.utcnow()
        )
        db.add(q_record)

    db.flush()

    # Update session progress & average score
    evaluated_questions = db.query(QuestionRecord).filter(
        QuestionRecord.session_id == request.session_id,
        QuestionRecord.is_evaluated == True
    ).all()
    
    session_record.questions_attempted = len(evaluated_questions)
    if evaluated_questions:
        session_record.average_score = round(
            sum(q.overall_score for q in evaluated_questions if q.overall_score is not None) / len(evaluated_questions),
            1
        )

    db.commit()

    return AnswerEvaluationResponse(
        overall_score=eval_result["overall_score"],
        technical_accuracy_score=eval_result["technical_accuracy_score"],
        conceptual_understanding_score=eval_result["conceptual_understanding_score"],
        completeness_score=eval_result["completeness_score"],
        clarity_score=eval_result["clarity_score"],
        what_went_well=eval_result["what_went_well"],
        areas_to_improve=eval_result["areas_to_improve"],
        missing_concepts=eval_result["missing_concepts"],
        corrected_explanation=eval_result.get("corrected_explanation"),
        improved_sample_answer=eval_result["improved_sample_answer"],
        personalized_recommendation=eval_result["personalized_recommendation"],
        follow_up_question=eval_result.get("follow_up_question"),
        is_demo_mode=eval_result.get("is_demo_mode", False),
        ai_provider="Google Gemini AI" if not eval_result.get("is_demo_mode") else "Educational Evaluator (Demo Mode)"
    )


@router.post("/follow-up", response_model=FollowUpQuestionResponse)
def get_follow_up(request: FollowUpQuestionRequest):
    """Generate a sharp follow-up interview question based on user response."""
    try:
        result = gemini_service.generate_follow_up(
            question_text=request.question_text,
            user_answer=request.user_answer,
            topic=request.topic,
            difficulty=request.difficulty
        )
        return FollowUpQuestionResponse(
            follow_up_question=result["follow_up_question"],
            rationale=result.get("rationale"),
            is_demo_mode=result.get("is_demo_mode", False)
        )
    except Exception as e:
        logger.error(f"Error during follow-up question generation: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Follow-up Error: {str(e)}"
        )


@router.post("/summary", response_model=SessionSummaryResponse)
def get_session_summary(request: SessionSummaryRequest, db: Session = Depends(get_db)):
    """Generate overall practice session summary, update session status to Completed."""
    session_record = db.query(PracticeSession).filter(PracticeSession.session_id == request.session_id).first()
    if not session_record:
        raise HTTPException(status_code=404, detail="Practice session not found.")

    evaluated_questions = db.query(QuestionRecord).filter(
        QuestionRecord.session_id == request.session_id,
        QuestionRecord.is_evaluated == True
    ).all()

    q_dicts = []
    for q in evaluated_questions:
        q_dicts.append({
            "question_text": q.question_text,
            "overall_score": q.overall_score or 0.0,
            "what_went_well": q.what_went_well or "",
            "areas_to_improve": q.areas_to_improve or ""
        })

    try:
        summary_result = gemini_service.generate_session_summary(
            topic=session_record.topic,
            questions_evaluated=q_dicts
        )
    except Exception as e:
        logger.error(f"Error during session summary generation: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Session Summary Error: {str(e)}"
        )

    # Persist summary in session
    session_record.status = "Completed"
    session_record.questions_attempted = len(evaluated_questions)
    if evaluated_questions:
        session_record.average_score = round(
            sum(q.overall_score for q in evaluated_questions if q.overall_score is not None) / len(evaluated_questions),
            1
        )
    session_record.summary_text = summary_result.get("summary_text")
    session_record.strongest_areas = json.dumps(summary_result.get("strongest_areas", []))
    session_record.weakest_areas = json.dumps(summary_result.get("weakest_areas", []))
    session_record.revision_concepts = json.dumps(summary_result.get("revision_concepts", []))
    session_record.recommendations = json.dumps(summary_result.get("recommendations", []))

    db.commit()

    return SessionSummaryResponse(
        session_id=session_record.session_id,
        total_questions=session_record.total_questions,
        questions_attempted=session_record.questions_attempted,
        average_score=session_record.average_score,
        summary_text=summary_result.get("summary_text", "Session completed."),
        strongest_areas=summary_result.get("strongest_areas", []),
        weakest_areas=summary_result.get("weakest_areas", []),
        revision_concepts=summary_result.get("revision_concepts", []),
        recommendations=summary_result.get("recommendations", []),
        is_demo_mode=summary_result.get("is_demo_mode", False)
    )
