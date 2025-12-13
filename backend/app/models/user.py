from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from app.local_db import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    target_score = Column(Integer, default=30)
    current_level = Column(String, default="beginner")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())