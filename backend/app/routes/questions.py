from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy.orm import Session
import json
from app.local_db import get_db
from app.models.question import Question
from app.routes.auth import get_current_user
from app.models.user import User

router = APIRouter()

# ============================
# Pydantic Models
# ============================

class QuestionResponse(BaseModel):
    id: int
    subject: str
    difficulty: str
    question_text: str
    choices: List[str]

    class Config:
        from_attributes = True

class QuestionDetailResponse(QuestionResponse):
    correct_answer: str
    explanation: str

class CheckAnswerRequest(BaseModel):
    question_id: int
    user_answer: str
    time_spent_seconds: int = 0

class CheckAnswerResponse(BaseModel):
    is_correct: bool
    correct_answer: str
    explanation: str

# ============================
# GET MULTIPLE QUESTIONS
# ============================
@router.get("/")
async def get_questions(
    subject: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    Returns a list of questions, with optional filters:
    - subject (math, english, reading, science)
    - difficulty (easy, medium, hard)
    - limit and offset for pagination
    """
    try:
        query = db.query(Question)

        if subject:
            query = query.filter(Question.subject == subject.lower())

        if difficulty:
            query = query.filter(Question.difficulty == difficulty.lower())

        # Get total count before limit
        total = query.count()

        # Apply pagination
        questions = query.offset(offset).limit(limit).all()

        # Convert choices JSON string back to list
        result = []
        for q in questions:
            choices = json.loads(q.choices) if isinstance(q.choices, str) else q.choices
            result.append({
                "id": q.id,
                "subject": q.subject,
                "difficulty": q.difficulty,
                "question_text": q.question_text,
                "choices": choices
            })

        return {
            "questions": result,
            "count": len(result),
            "total": total,
            "offset": offset,
            "limit": limit
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================
# GET SINGLE QUESTION
# ============================
@router.get("/{question_id}")
async def get_question(
    question_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns a single question WITHOUT the correct answer.
    """
    try:
        q = db.query(Question).filter(Question.id == question_id).first()

        if not q:
            raise HTTPException(status_code=404, detail="Question not found")

        choices = json.loads(q.choices) if isinstance(q.choices, str) else q.choices

        return {
            "id": q.id,
            "subject": q.subject,
            "difficulty": q.difficulty,
            "question_text": q.question_text,
            "choices": choices
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================
# CHECK ANSWER
# ============================
@router.post("/check", response_model=CheckAnswerResponse)
async def check_answer(
    body: CheckAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Checks an answer and returns correctness + explanation.
    """
    try:
        q = db.query(Question).filter(Question.id == body.question_id).first()

        if not q:
            raise HTTPException(status_code=404, detail="Question not found")

        # Normalize and compare answers
        is_correct = (
            body.user_answer.strip().upper() == 
            q.correct_answer.strip().upper()
        )

        return {
            "is_correct": is_correct,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================
# SUBJECT COUNTS
# ============================
@router.get("/subjects/counts")
async def get_subject_counts(db: Session = Depends(get_db)):
    """
    Returns number of questions available per subject.
    """
    try:
        subjects = ["math", "english", "reading", "science"]
        counts = {}

        for subj in subjects:
            count = db.query(Question).filter(Question.subject == subj).count()
            counts[subj] = count

        counts["total"] = sum(counts.values())
        return counts

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

