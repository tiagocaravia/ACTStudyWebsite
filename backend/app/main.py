import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from app.routes import analytics, ai_feedback
from fastapi import Depends
from app.routes.auth import get_current_user

# Load environment variables
load_dotenv()

app = FastAPI(title="ACT Study API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://actstudywebsite.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials. Check your .env file.")

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/")
async def root():
    return {"message": "ACT Study API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

@app.get("/api/questions")
async def get_questions(subject: str = None, difficulty: str = None, limit: int = 10):
    """
    Get practice questions
    Optional filters: subject (math, english, reading, science), difficulty (easy, medium, hard)
    """
    try:
        query = supabase.table("questions").select("*")
        
        # Apply filters if provided
        if subject:
            query = query.eq("subject", subject)
        if difficulty:
            query = query.eq("difficulty", difficulty)
        
        # Limit results
        query = query.limit(limit)
        
        response = query.execute()
        
        return {
            "questions": response.data,
            "count": len(response.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/questions/{question_id}")
async def get_question(question_id: int):
    """Get a specific question by ID"""
    try:
        response = supabase.table("questions").select("*").eq("id", question_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Question not found")
        
        return {"question": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/subjects")
async def get_subjects():
    """Get all available subjects with question counts"""
    try:
        subjects = ["math", "english", "reading", "science"]
        result = []
        
        for subject in subjects:
            response = supabase.table("questions").select("id", count="exact").eq("subject", subject).execute()
            result.append({
                "subject": subject,
                "question_count": response.count
            })
        
        return {"subjects": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/check-answer")
async def check_answer(question_id: int, user_answer: str, time_spent_seconds: int = 0, user: dict = Depends(get_current_user)):
    """
    Check a multiple-choice ACT answer and log it in user_answers
    """
    try:
        # Fetch question
        response = supabase.table("questions").select("*").eq("id", question_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Question not found")
        question = response.data[0]

        # Check correctness
        is_correct = user_answer.strip().lower() == question["correct_answer"].strip().lower()

        # Insert into user_answers
        supabase.table("user_answers").insert({
            "user_id": user["id"],
            "question_id": question_id,
            "user_answer": user_answer,
            "is_correct": is_correct,
            "time_spent_seconds": time_spent_seconds
        }).execute()

        return {
            "is_correct": is_correct,
            "correct_answer": question["correct_answer"],
            "explanation": question["explanation"]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include routers
app.include_router(analytics.router)
app.include_router(ai_feedback.router)

# Auth routes
from app.routes import auth
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Admin routes (add authentication in production!)
from app.routes import admin
app.include_router(admin.router)