from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Dict
from datetime import datetime
from app.database import get_supabase_client
from app.routes.auth import get_current_user

router = APIRouter()

# ---------------------------
# Start a new session
# ---------------------------
@router.post("/start")
async def start_session(session_type: str = "practice", user: dict = Depends(get_current_user)):
    """
    Start a new practice session
    """
    try:
        supabase = get_supabase_client()
        start_time = datetime.utcnow().isoformat()
        response = supabase.table("practice_sessions").insert({
            "user_id": user["id"],
            "session_type": session_type,
            "started_at": start_time,
            "completed_at": None,
            "total_questions": 0,
            "correct_answers": 0,
            "score": None,
            "duration_seconds": None
        }).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to start session")

        session_id = response.data[0]["id"]
        return {"session_id": session_id, "started_at": start_time}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# Submit an answer
# ---------------------------
@router.post("/submit")
async def submit_answer(
    session_id: int,
    question_id: int,
    user_answer: str,
    time_spent_seconds: int = 0,
    user: dict = Depends(get_current_user)
):
    """
    Log a user's answer in a session
    """
    try:
        supabase = get_supabase_client()

        # Fetch question
        q_resp = supabase.table("questions").select("*").eq("id", question_id).execute()
        if not q_resp.data:
            raise HTTPException(status_code=404, detail="Question not found")
        question = q_resp.data[0]

        is_correct = user_answer.strip().lower() == question["correct_answer"].strip().lower()

        # Insert into user_answers with session_id
        supabase.table("user_answers").insert({
            "user_id": user["id"],
            "session_id": session_id,
            "question_id": question_id,
            "user_answer": user_answer,
            "is_correct": is_correct,
            "subject": question["subject"],
            "time_spent_seconds": time_spent_seconds,
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        return {
            "question_id": question_id,
            "user_answer": user_answer,
            "is_correct": is_correct,
            "correct_answer": question["correct_answer"],
            "explanation": question["explanation"],
            "subject": question["subject"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# Finish session
# ---------------------------
@router.post("/finish")
async def finish_session(
    session_id: int,
    user: dict = Depends(get_current_user)
):
    """
    Finish a session, calculate per-subject and composite scores
    """
    try:
        supabase = get_supabase_client()

        # Fetch all answers for this session
        answers_resp = supabase.table("user_answers").select("*").eq("session_id", session_id).eq("user_id", user["id"]).execute()
        answers = answers_resp.data
        if not answers:
            raise HTTPException(status_code=404, detail="No answers found for this session")

        # Fetch question details
        question_ids = [a["question_id"] for a in answers]
        questions_resp = supabase.table("questions").select("*").in_("id", question_ids).execute()
        questions = {q["id"]: q for q in questions_resp.data}

        # Count correct answers per subject
        subject_counts = {}
        subject_correct = {}
        for a in answers:
            q = questions.get(a["question_id"])
            if not q:
                continue
            subj = q["subject"]
            subject_counts[subj] = subject_counts.get(subj, 0) + 1
            if a["is_correct"]:
                subject_correct[subj] = subject_correct.get(subj, 0) + 1

        # Calculate per-subject scores
        section_scores = {subj: round((subject_correct.get(subj, 0) / total) * 36) for subj, total in subject_counts.items()}

        # Composite score = average of section scores
        composite_score = round(sum(section_scores.values()) / len(section_scores)) if section_scores else 0

        # Update session record
        completed_at = datetime.utcnow().isoformat()
        start_time = answers[0]["created_at"]
        duration_seconds = int((datetime.fromisoformat(completed_at) - datetime.fromisoformat(start_time)).total_seconds())

        supabase.table("practice_sessions").update({
            "completed_at": completed_at,
            "total_questions": len(answers),
            "correct_answers": sum(a["is_correct"] for a in answers),
            "score": composite_score,
            "duration_seconds": duration_seconds,
            "section_scores": section_scores
        }).eq("id", session_id).execute()

        return {
            "session_id": session_id,
            "total_questions": len(answers),
            "total_correct": sum(a["is_correct"] for a in answers),
            "section_scores": section_scores,
            "composite_score": composite_score,
            "completed_at": completed_at,
            "duration_seconds": duration_seconds
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
