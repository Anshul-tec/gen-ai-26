from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import PracticeSession, QuestionRecord
from app.schemas.schemas import PracticeSessionListItem, PracticeSessionDetail

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])

@router.get("", response_model=List[PracticeSessionListItem])
def list_sessions(limit: int = 50, db: Session = Depends(get_db)):
    """Retrieve all practice sessions ordered by most recent."""
    sessions = (
        db.query(PracticeSession)
        .order_by(PracticeSession.created_at.desc())
        .limit(limit)
        .all()
    )
    return sessions

@router.get("/{session_id}", response_model=PracticeSessionDetail)
def get_session_detail(session_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed practice session including all questions, answers, and evaluations."""
    session_record = db.query(PracticeSession).filter(PracticeSession.session_id == session_id).first()
    if not session_record:
        raise HTTPException(status_code=404, detail="Practice session not found.")
    
    # Sort questions by question_number
    session_record.questions.sort(key=lambda q: q.question_number)
    return session_record

@router.delete("/{session_id}", status_code=status.HTTP_200_OK)
def delete_session(session_id: str, db: Session = Depends(get_db)):
    """Delete a practice session and its question records."""
    session_record = db.query(PracticeSession).filter(PracticeSession.session_id == session_id).first()
    if not session_record:
        raise HTTPException(status_code=404, detail="Practice session not found.")
    
    db.delete(session_record)
    db.commit()
    return {"message": "Practice session deleted successfully", "session_id": session_id}
