from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import PracticeSession, QuestionRecord
from app.schemas.schemas import AnalyticsResponse, TopicPerformanceItem, ProgressionItem

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    """Calculate aggregate analytics from real database sessions."""
    sessions = db.query(PracticeSession).order_by(PracticeSession.created_at.asc()).all()
    
    total_sessions = len(sessions)
    if total_sessions == 0:
        return AnalyticsResponse(
            total_sessions=0,
            questions_attempted=0,
            average_score=0.0,
            topics_practiced_count=0,
            strongest_topic=None,
            weakest_topic=None,
            topic_performance=[],
            session_score_progression=[],
            difficulty_breakdown=[]
        )

    # Evaluated questions
    evaluated_questions = db.query(QuestionRecord).filter(
        QuestionRecord.is_evaluated == True,
        QuestionRecord.overall_score != None
    ).all()

    total_attempted = len(evaluated_questions)
    
    if total_attempted > 0:
        overall_avg = round(sum(q.overall_score for q in evaluated_questions) / total_attempted, 1)
    else:
        overall_avg = 0.0

    # Group by Topic
    topic_scores = defaultdict(list)
    topic_session_count = defaultdict(set)
    for q in evaluated_questions:
        topic_scores[q.topic].append(q.overall_score)
        topic_session_count[q.topic].add(q.session_id)

    # Also include topics from sessions even if 0 questions attempted yet
    for s in sessions:
        if s.topic not in topic_scores:
            topic_session_count[s.topic].add(s.session_id)

    topic_performance_list = []
    for topic, scores in topic_scores.items():
        avg = round(sum(scores) / len(scores), 1) if scores else 0.0
        topic_performance_list.append(TopicPerformanceItem(
            topic=topic,
            average_score=avg,
            questions_count=len(scores),
            sessions_count=len(topic_session_count[topic])
        ))

    # Sort topic performance by average score descending
    topic_performance_list.sort(key=lambda x: x.average_score, reverse=True)

    strongest_topic = topic_performance_list[0].topic if topic_performance_list else None
    weakest_topic = topic_performance_list[-1].topic if len(topic_performance_list) > 1 else None

    # Score progression across sessions (chronological order)
    progression = []
    for s in sessions:
        progression.append(ProgressionItem(
            session_id=s.session_id,
            date=s.created_at.strftime("%b %d, %H:%M") if s.created_at else "",
            topic=s.topic,
            average_score=s.average_score
        ))

    # Difficulty breakdown
    diff_counts = defaultdict(int)
    for s in sessions:
        diff_counts[s.difficulty] += 1
    difficulty_breakdown = [{"difficulty": k, "count": v} for k, v in diff_counts.items()]

    return AnalyticsResponse(
        total_sessions=total_sessions,
        questions_attempted=total_attempted,
        average_score=overall_avg,
        topics_practiced_count=len(topic_session_count),
        strongest_topic=strongest_topic,
        weakest_topic=weakest_topic,
        topic_performance=topic_performance_list,
        session_score_progression=progression,
        difficulty_breakdown=difficulty_breakdown
    )
