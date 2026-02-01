from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.question import Question

router = APIRouter(prefix="/api/admin", tags=["admin"])

class QuestionCreate(BaseModel):
    subject: str  # 'math', 'english', 'reading', 'science'
    question_text: str
    choices: List[str]  # Array of answer choices (typically 4-5)
    correct_answer: str
    explanation: Optional[str] = None
    difficulty: Optional[str] = None  # 'easy', 'medium', 'hard'

class BulkQuestionCreate(BaseModel):
    questions: List[QuestionCreate]

@router.post("/questions")
async def create_question(question: QuestionCreate, db: Session = Depends(get_db)):
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
        
        # Create new question
        import json
        db_question = Question(
            subject=question.subject.lower(),
            question_text=question.question_text,
            choices=json.dumps(question.choices),
            correct_answer=question.correct_answer,
            explanation=question.explanation,
            difficulty=question.difficulty.lower() if question.difficulty else None
        )
        
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        
        return {
            "success": True,
            "question_id": db_question.id,
            "message": "Question created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/questions/bulk")
async def create_questions_bulk(bulk: BulkQuestionCreate, db: Session = Depends(get_db)):
    """
    Create multiple ACT questions at once
    Useful for importing questions from a dataset
    """
    try:
        import json
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
                
                # Create new question
                db_question = Question(
                    subject=question.subject.lower(),
                    question_text=question.question_text,
                    choices=json.dumps(question.choices),
                    correct_answer=question.correct_answer,
                    explanation=question.explanation,
                    difficulty=question.difficulty.lower() if question.difficulty else None
                )
                
                db.add(db_question)
                db.commit()
                db.refresh(db_question)
                created.append(db_question.id)
            except Exception as e:
                db.rollback()
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

@router.get("/questions/count")
async def get_question_count(db: Session = Depends(get_db)):
    """Get total count of questions by subject"""
    try:
        subjects = ["math", "english", "reading", "science"]
        result = {}
        
        for subject in subjects:
            count = db.query(Question).filter(Question.subject == subject).count()
            result[subject] = count
        
        total = sum(result.values())
        result["total"] = total
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

