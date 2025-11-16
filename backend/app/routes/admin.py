from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_supabase_client

router = APIRouter()

class QuestionCreate(BaseModel):
    subject: str  # 'math', 'english', 'reading', 'science'
    question_text: str
    choices: List[str]  # Array of answer choices (typically 4-5)
    correct_answer: str
    explanation: Optional[str] = None
    difficulty: Optional[str] = None  # 'easy', 'medium', 'hard'

class BulkQuestionCreate(BaseModel):
    questions: List[QuestionCreate]

@router.post("/api/admin/questions")
async def create_question(question: QuestionCreate):
    """
    Create a single ACT question
    Requires admin authentication (add auth middleware in production)
    """
    try:
        # Validate subject
        valid_subjects = ["math", "english", "reading", "science"]
        if question.subject.lower() not in valid_subjects:
            raise HTTPException(
                status_code=400, 
                detail=f"Subject must be one of: {', '.join(valid_subjects)}"
            )
        
        # Validate difficulty if provided
        if question.difficulty:
            valid_difficulties = ["easy", "medium", "hard"]
            if question.difficulty.lower() not in valid_difficulties:
                raise HTTPException(
                    status_code=400,
                    detail=f"Difficulty must be one of: {', '.join(valid_difficulties)}"
                )
        
        # Validate correct_answer is in choices
        if question.correct_answer not in question.choices:
            raise HTTPException(
                status_code=400,
                detail="correct_answer must be one of the provided choices"
            )
        
        supabase = get_supabase_client()
        
        question_data = {
            "subject": question.subject.lower(),
            "question_text": question.question_text,
            "choices": question.choices,
            "correct_answer": question.correct_answer,
            "explanation": question.explanation,
            "difficulty": question.difficulty.lower() if question.difficulty else None
        }
        
        response = supabase.table("questions").insert(question_data).execute()
        
        return {
            "success": True,
            "question_id": response.data[0]["id"] if response.data else None,
            "message": "Question created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/admin/questions/bulk")
async def create_questions_bulk(bulk: BulkQuestionCreate):
    """
    Create multiple ACT questions at once
    Useful for importing questions from a dataset
    """
    try:
        supabase = get_supabase_client()
        created = []
        errors = []
        
        for idx, question in enumerate(bulk.questions):
            try:
                # Validate subject
                valid_subjects = ["math", "english", "reading", "science"]
                if question.subject.lower() not in valid_subjects:
                    errors.append({
                        "index": idx,
                        "error": f"Invalid subject: {question.subject}"
                    })
                    continue
                
                # Validate correct_answer is in choices
                if question.correct_answer not in question.choices:
                    errors.append({
                        "index": idx,
                        "error": "correct_answer not in choices"
                    })
                    continue
                
                question_data = {
                    "subject": question.subject.lower(),
                    "question_text": question.question_text,
                    "choices": question.choices,
                    "correct_answer": question.correct_answer,
                    "explanation": question.explanation,
                    "difficulty": question.difficulty.lower() if question.difficulty else None
                }
                
                response = supabase.table("questions").insert(question_data).execute()
                if response.data:
                    created.append(response.data[0]["id"])
            except Exception as e:
                errors.append({
                    "index": idx,
                    "error": str(e)
                })
        
        return {
            "success": True,
            "created_count": len(created),
            "error_count": len(errors),
            "created_ids": created,
            "errors": errors
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/admin/questions/count")
async def get_question_count():
    """Get total count of questions by subject"""
    try:
        supabase = get_supabase_client()
        subjects = ["math", "english", "reading", "science"]
        result = {}
        
        for subject in subjects:
            response = supabase.table("questions")\
                .select("id", count="exact")\
                .eq("subject", subject)\
                .execute()
            result[subject] = response.count or 0
        
        total = sum(result.values())
        result["total"] = total
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

