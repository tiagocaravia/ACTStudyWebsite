"""
Answer tracking model for Supabase
This represents the structure of the user_answers table in Supabase
"""
from datetime import datetime
from typing import Optional

class AnswerTracking:
    """
    Model for tracking user answers to questions
    This should match the Supabase table structure:
    
    CREATE TABLE user_answers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        question_id INTEGER,
        user_answer TEXT,
        is_correct BOOLEAN,
        subject TEXT,
        difficulty TEXT,
        time_spent_seconds INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
    );
    """
    
    def __init__(
        self,
        user_id: Optional[int] = None,
        question_id: int = 0,
        user_answer: str = "",
        is_correct: bool = False,
        subject: str = "",
        difficulty: str = "",
        time_spent_seconds: Optional[int] = None,
        created_at: Optional[datetime] = None
    ):
        self.user_id = user_id
        self.question_id = question_id
        self.user_answer = user_answer
        self.is_correct = is_correct
        self.subject = subject
        self.difficulty = difficulty
        self.time_spent_seconds = time_spent_seconds
        self.created_at = created_at or datetime.now()

