from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.database.connection import get_db

router = APIRouter()

@router.get("/")
async def get_practice_questions(subject: str = "math", db: Session = Depends(get_db)):
    # TODO: Implement actual question retrieval from database
    sample_questions = [
        {
            "id": 1,
            "subject": subject,
            "question": "What is 2 + 2?",
            "choices": ["2", "3", "4", "5"],
            "correct_answer": "4",
            "explanation": "Basic addition: 2 + 2 = 4"
        },
        {
            "id": 2,
            "subject": subject,
            "question": "What is the square root of 16?",
            "choices": ["2", "3", "4", "8"],
            "correct_answer": "4",
            "explanation": "√16 = 4 because 4² = 16"
        }
    ]
    return {"questions": sample_questions}

@router.post("/submit")
async def submit_answer(question_id: int, user_answer: str, db: Session = Depends(get_db)):
    # TODO: Implement answer checking and progress tracking
    is_correct = True  # Placeholder logic
    
    return {
        "question_id": question_id,
        "user_answer": user_answer,
        "is_correct": is_correct,
        "explanation": "Great job!" if is_correct else "Try again!"
    }

@router.get("/progress")
async def get_user_progress(user_id: int, db: Session = Depends(get_db)):
    # TODO: Implement actual progress tracking
    return {
        "user_id": user_id,
        "total_questions": 50,
        "correct_answers": 35,
        "accuracy": 70.0,
        "subjects": {
            "math": {"correct": 10, "total": 15},
            "english": {"correct": 12, "total": 15},
            "reading": {"correct": 8, "total": 10},
            "science": {"correct": 5, "total": 10}
        }
    }