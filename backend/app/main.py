import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes import (
    auth,
    admin,
    # analytics,  # TODO: Migrate to SQLAlchemy
    # ai_feedback,  # TODO: Migrate to SQLAlchemy
    questions,
    # sessions,  # TODO: Migrate to SQLAlchemy
)

load_dotenv()

# Ensure database tables are created for local/dev usage (use local SQLite DB)
from app.local_db import engine, Base
from app import models as _models  # import models so SQLAlchemy registers them
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ACT Study API",
    version="1.0.0",
    description="Week 5 ACT Prep Backend",
)

# -------------------------------
# CORS middleware
# -------------------------------
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

# -------------------------------
# Basic endpoints
# -------------------------------
@app.get("/")
def root():
    return {"message": "ACT Study API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# -------------------------------
# Routers
# -------------------------------
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
# app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])  # TODO: Migrate
# app.include_router(ai_feedback.router, prefix="/api/ai", tags=["ai"])  # TODO: Migrate
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
# app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])  # TODO: Migrate
