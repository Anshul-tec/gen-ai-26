from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.models import QuestionRecord
from app.schemas.schemas import QuestionBankResponse, QuestionBankItem
from app.services.sample_data import SAMPLE_QUESTIONS_BY_TOPIC

router = APIRouter(prefix="/api/questions", tags=["Questions"])

@router.get("", response_model=QuestionBankResponse)
def get_questions(
    topic: Optional[str] = Query(None, description="Filter by topic"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    search: Optional[str] = Query(None, description="Search keyword in question text"),
    db: Session = Depends(get_db)
):
    """Retrieve questions from database with fallback seeds for rich question browsing."""
    query = db.query(QuestionRecord)

    topic_str = topic if isinstance(topic, str) else None
    diff_str = difficulty if isinstance(difficulty, str) else None
    search_str = search if isinstance(search, str) else None

    if topic_str and topic_str.strip() and topic_str.lower() != "all":
        query = query.filter(QuestionRecord.topic.ilike(f"%{topic_str.strip()}%"))

    if diff_str and diff_str.strip() and diff_str.lower() != "all":
        query = query.filter(QuestionRecord.difficulty.ilike(f"%{diff_str.strip()}%"))

    if search_str and search_str.strip():
        term = f"%{search_str.strip()}%"
        query = query.filter(
            or_(
                QuestionRecord.question_text.ilike(term),
                QuestionRecord.category.ilike(term),
                QuestionRecord.improved_sample_answer.ilike(term)
            )
        )

    db_questions = query.order_by(QuestionRecord.created_at.desc()).limit(100).all()

    items: List[QuestionBankItem] = []
    seen_texts = set()

    for q in db_questions:
        if q.question_text not in seen_texts:
            seen_texts.add(q.question_text)
            items.append(QuestionBankItem(
                id=q.id,
                topic=q.topic,
                difficulty=q.difficulty,
                category=q.category or "Technical",
                question_text=q.question_text,
                sample_answer=q.improved_sample_answer,
                created_at=q.created_at
            ))

    # If few DB questions exist or searching sample bank, augment with curated sample pool
    curated_counter = 10000
    for sample_topic, diffs in SAMPLE_QUESTIONS_BY_TOPIC.items():
        if topic_str and topic_str.strip() and topic_str.lower() != "all":
            if sample_topic.lower() != topic_str.strip().lower() and topic_str.strip().lower() not in sample_topic.lower():
                continue
        for sample_diff, q_list in diffs.items():
            if diff_str and diff_str.strip() and diff_str.lower() != "all":
                if sample_diff.lower() != diff_str.strip().lower():
                    continue
            for item in q_list:
                q_text = item["question_text"]
                if q_text in seen_texts:
                    continue
                if search_str and search_str.strip():
                    s_lower = search_str.strip().lower()
                    if s_lower not in q_text.lower() and s_lower not in item.get("category", "").lower() and s_lower not in item.get("sample_answer", "").lower():
                        continue
                seen_texts.add(q_text)
                curated_counter += 1
                items.append(QuestionBankItem(
                    id=curated_counter,
                    topic=sample_topic,
                    difficulty=sample_diff,
                    category=item.get("category", "Core Concepts"),
                    question_text=q_text,
                    sample_answer=item.get("sample_answer"),
                    created_at=None
                ))

    return QuestionBankResponse(
        total=len(items),
        questions=items
    )
