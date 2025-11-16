import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes import (
    auth,
    admin,
    analytics,
    ai_feedback,
    questions,
    sessions,
)

load_dotenv()

app = FastAPI(
    title="ACT Study API",
    version="1.0.0",
    description="Week 5 ACT Prep Backend",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://actstudywebsite.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "ACT Study API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(ai_feedback.router, prefix="/api/ai", tags=["ai"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
