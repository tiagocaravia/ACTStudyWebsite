from fastapi import APIRouter, Depends, HTTPException
from app.database import get_supabase_client
from app.routes.auth import get_current_user

router = APIRouter()

# User-specific analytics
@router.get("/user")
async def get_user_analytics(user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    
    sessions = supabase.table("practice_sessions").select("*").eq("user_id", user["id"]).execute().data
    if not sessions:
        return {"message": "No sessions found", "sessions": []}
    
    return {"sessions": sessions}

# Subject accuracy breakdown
@router.get("/user/subjects")
async def get_subject_breakdown(user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    answers = supabase.table("user_answers").select("*").eq("user_id", user["id"]).execute().data
    
    if not answers:
        return {"message": "No answers found", "subjects": {}}
    
    subjects = {}
    for a in answers:
        subj = a["subject"]
        subjects[subj] = subjects.get(subj, {"correct": 0, "total": 0})
        subjects[subj]["total"] += 1
        if a["is_correct"]:
            subjects[subj]["correct"] += 1
    
    # Calculate accuracy
    for subj, data in subjects.items():
        data["accuracy"] = round(data["correct"] / data["total"] * 100, 2)
    
    return subjects
