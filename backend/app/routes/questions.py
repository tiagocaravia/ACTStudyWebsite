from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from pydantic import BaseModel
from app.database import get_supabase_client
from app.routes.auth import get_current_user

router = APIRouter()

# ============================
# Pydantic Models
# ============================

class QuestionBase(BaseModel):
    id: int
    subject: str
    difficulty: str
    question: str
    choices: List[str]

class QuestionDetail(QuestionBase):
    correct_answer: str
    explanation: str


# ============================
# SUBJECT COUNTS
# ============================
@router.get("/subjects/counts")
async def get_subject_counts():
    """
    Returns number of questions available per subject.
    """
    try:
        supabase = get_supabase_client()
        subjects = ["math", "english", "reading", "science"]

        counts = {}
        for subj in subjects:
            r = (
                supabase.table("questions")
                .select("id", count="exact")
                .eq("subject", subj)
                .execute()
            )
            counts[subj] = r.count or 0

        counts["total"] = sum(counts.values())

        return counts

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# GET MULTIPLE QUESTIONS
# ============================
@router.get("/")
async def get_questions(
    subject: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    random: bool = Query(False),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
):
    """
    Returns a list of questions, with optional filters:
    - subject
    - difficulty
    - random order
    - pagination
    """
    try:
        supabase = get_supabase_client()
        query = supabase.table("questions").select("*")

        if subject:
            query = query.eq("subject", subject.lower())

        if difficulty:
            query = query.eq("difficulty", difficulty.lower())

        # Randomization
        if random:
            query = query.order("RANDOM()")

        # Pagination
        offset = (page - 1) * limit
        query = query.range(offset, offset + limit - 1)

        response = query.execute()

        # Remove correct answer + explanation for GET
        cleaned = []
        for q in response.data:
            cleaned.append({
                "id": q["id"],
                "subject": q["subject"],
                "difficulty": q["difficulty"],
                "question": q["question"],
                "choices": q["choices"]
            })

        return {
            "questions": cleaned,
            "count": len(cleaned),
            "page": page
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# GET SINGLE QUESTION
# ============================
@router.get("/{question_id}")
async def get_question(question_id: int):
    """
    Returns a single question WITHOUT the correct answer.
    """
    try:
        supabase = get_supabase_client()
        r = (
            supabase.table("questions")
            .select("*")
            .eq("id", question_id)
            .execute()
        )

        if not r.data:
            raise HTTPException(status_code=404, detail="Question not found")

        q = r.data[0]

        # Hide correct answer on GET
        return {
            "id": q["id"],
            "subject": q["subject"],
            "difficulty": q["difficulty"],
            "question": q["question"],
            "choices": q["choices"]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================
# CHECK ANSWER
# ============================
@router.post("/check")
async def check_answer(
    question_id: int,
    user_answer: str,
    time_spent_seconds: int = 0,
    user: dict = Depends(get_current_user)
):
    """
    Checks an answer, logs it to Supabase, returns correctness + explanation.
    """
    try:
        supabase = get_supabase_client()

        # Fetch question
        r = (
            supabase.table("questions")
            .select("*")
            .eq("id", question_id)
            .execute()
        )

        if not r.data:
            raise HTTPException(status_code=404, detail="Question not found")

        q = r.data[0]

        is_correct = (
            user_answer.strip().lower() ==
            q["correct_answer"].strip().lower()
        )

        # Log the answer
        supabase.table("user_answers").insert({
            "user_id": user["id"],
            "question_id": question_id,
            "user_answer": user_answer,
            "is_correct": is_correct,
            "time_spent_seconds": time_spent_seconds
        }).execute()

        return {
            "is_correct": is_correct,
            "correct_answer": q["correct_answer"],
            "explanation": q["explanation"]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

