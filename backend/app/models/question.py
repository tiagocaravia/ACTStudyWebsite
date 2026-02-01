from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.local_db import Base

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, index=True, nullable=False)  # math, english, reading, science
    difficulty = Column(String, index=True, nullable=False)  # easy, medium, hard
    question_text = Column(Text, nullable=False)
    choices = Column(String, nullable=False)  # JSON string of [A, B, C, D]
    correct_answer = Column(String, nullable=False)  # A, B, C, or D
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
