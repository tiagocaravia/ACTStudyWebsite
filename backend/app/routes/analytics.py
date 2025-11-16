from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
from app.database import get_supabase_client

router = APIRouter()

class TrackAnswerRequest(BaseModel):
    user_id: Optional[int] = None
    question_id: int
    user_answer: str
    time_spent_seconds: Optional[int] = None

@router.post("/api/track-answer")
async def track_answer(request: TrackAnswerRequest):
    """
    Track a user's answer to a question
    """
    try:
        supabase = get_supabase_client()
        
        # Get the question to extract subject and difficulty
        question_response = supabase.table("questions").select("*").eq("id", request.question_id).execute()
        
        if not question_response.data:
            raise HTTPException(status_code=404, detail="Question not found")
        
        question = question_response.data[0]
        is_correct = request.user_answer.strip().lower() == question["correct_answer"].strip().lower()
        
        # Insert answer tracking record
        answer_data = {
            "user_id": request.user_id,
            "question_id": request.question_id,
            "user_answer": request.user_answer,
            "is_correct": is_correct,
            "subject": question.get("subject", ""),
            "difficulty": question.get("difficulty", ""),
            "time_spent_seconds": request.time_spent_seconds
        }
        
        response = supabase.table("user_answers").insert(answer_data).execute()
        
        return {
            "success": True,
            "is_correct": is_correct,
            "answer_id": response.data[0]["id"] if response.data else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/analytics/{user_id}")
async def get_user_analytics(user_id: int):
    """
    Get comprehensive analytics for a user including:
    - Overall performance
    - Performance by subject
    - Performance by difficulty
    - Weak areas identification
    """
    try:
        supabase = get_supabase_client()
        
        # Get all answers for the user
        answers_response = supabase.table("user_answers").select("*").eq("user_id", user_id).execute()
        
        if not answers_response.data:
            return {
                "user_id": user_id,
                "total_answered": 0,
                "total_correct": 0,
                "overall_accuracy": 0.0,
                "by_subject": {},
                "by_difficulty": {},
                "weak_areas": []
            }
        
        answers = answers_response.data
        total_answered = len(answers)
        total_correct = sum(1 for a in answers if a.get("is_correct", False))
        overall_accuracy = (total_correct / total_answered * 100) if total_answered > 0 else 0.0
        
        # Calculate performance by subject
        subjects = ["math", "english", "reading", "science"]
        by_subject = {}
        
        for subject in subjects:
            subject_answers = [a for a in answers if a.get("subject") == subject]
            if subject_answers:
                subject_correct = sum(1 for a in subject_answers if a.get("is_correct", False))
                by_subject[subject] = {
                    "total": len(subject_answers),
                    "correct": subject_correct,
                    "accuracy": (subject_correct / len(subject_answers) * 100) if subject_answers else 0.0
                }
        
        # Calculate performance by difficulty
        difficulties = ["easy", "medium", "hard"]
        by_difficulty = {}
        
        for difficulty in difficulties:
            diff_answers = [a for a in answers if a.get("difficulty") == difficulty]
            if diff_answers:
                diff_correct = sum(1 for a in diff_answers if a.get("is_correct", False))
                by_difficulty[difficulty] = {
                    "total": len(diff_answers),
                    "correct": diff_correct,
                    "accuracy": (diff_correct / len(diff_answers) * 100) if diff_answers else 0.0
                }
        
        # Identify weak areas (subjects with accuracy < 70%)
        weak_areas = []
        for subject, stats in by_subject.items():
            if stats["accuracy"] < 70.0 and stats["total"] >= 5:  # At least 5 questions attempted
                weak_areas.append({
                    "subject": subject,
                    "accuracy": stats["accuracy"],
                    "total_attempted": stats["total"],
                    "priority": "high" if stats["accuracy"] < 50 else "medium"
                })
        
        # Sort weak areas by accuracy (lowest first)
        weak_areas.sort(key=lambda x: x["accuracy"])
        
        return {
            "user_id": user_id,
            "total_answered": total_answered,
            "total_correct": total_correct,
            "overall_accuracy": round(overall_accuracy, 2),
            "by_subject": by_subject,
            "by_difficulty": by_difficulty,
            "weak_areas": weak_areas
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/analytics/{user_id}/recent")
async def get_recent_performance(user_id: int, limit: int = 20):
    """
    Get recent performance data for trend analysis
    """
    try:
        supabase = get_supabase_client()
        
        # Get recent answers ordered by created_at
        answers_response = supabase.table("user_answers")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        if not answers_response.data:
            return {
                "recent_accuracy": 0.0,
                "recent_count": 0,
                "trend": "insufficient_data"
            }
        
        recent_answers = answers_response.data
        recent_correct = sum(1 for a in recent_answers if a.get("is_correct", False))
        recent_accuracy = (recent_correct / len(recent_answers) * 100) if recent_answers else 0.0
        
        # Simple trend calculation (compare first half vs second half)
        trend = "stable"
        if len(recent_answers) >= 10:
            first_half = recent_answers[len(recent_answers)//2:]
            second_half = recent_answers[:len(recent_answers)//2]
            
            first_accuracy = sum(1 for a in first_half if a.get("is_correct", False)) / len(first_half) * 100
            second_accuracy = sum(1 for a in second_half if a.get("is_correct", False)) / len(second_half) * 100
            
            if second_accuracy > first_accuracy + 5:
                trend = "improving"
            elif second_accuracy < first_accuracy - 5:
                trend = "declining"
        
        return {
            "recent_accuracy": round(recent_accuracy, 2),
            "recent_count": len(recent_answers),
            "trend": trend
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

