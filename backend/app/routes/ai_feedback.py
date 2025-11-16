from fastapi import APIRouter, HTTPException
from typing import Optional, Dict, List
import os
from app.database import get_supabase_client

router = APIRouter()

# Check if OpenAI is available (optional - can work without it)
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if OPENAI_API_KEY:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
    else:
        openai_client = None
except ImportError:
    OPENAI_AVAILABLE = False
    OPENAI_API_KEY = None
    openai_client = None

def generate_ai_feedback_with_openai(analytics_data: Dict) -> str:
    """
    Generate AI-powered feedback using OpenAI
    """
    if not OPENAI_AVAILABLE or not OPENAI_API_KEY:
        return None
    
    try:
        weak_areas = analytics_data.get("weak_areas", [])
        by_subject = analytics_data.get("by_subject", {})
        overall_accuracy = analytics_data.get("overall_accuracy", 0)
        
        # Build prompt for OpenAI
        prompt = f"""You are an ACT test prep tutor. Analyze this student's performance and provide personalized, actionable feedback.

Student Performance Summary:
- Overall Accuracy: {overall_accuracy}%
- Total Questions Answered: {analytics_data.get('total_answered', 0)}

Subject Performance:
"""
        for subject, stats in by_subject.items():
            prompt += f"- {subject.capitalize()}: {stats['accuracy']:.1f}% ({stats['correct']}/{stats['total']})\n"
        
        if weak_areas:
            prompt += f"\nWeak Areas Identified:\n"
            for area in weak_areas:
                prompt += f"- {area['subject'].capitalize()}: {area['accuracy']:.1f}% accuracy ({area['priority']} priority)\n"
        
        prompt += """
Provide:
1. A brief encouraging summary of their overall performance
2. Specific areas that need improvement
3. Actionable study recommendations (2-3 specific tips)
4. Suggested focus areas for next practice session

Keep the response concise, friendly, and motivating (max 200 words)."""

        if not openai_client:
            return None
            
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful ACT test prep tutor that provides encouraging and actionable feedback."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return None

def generate_fallback_feedback(analytics_data: Dict) -> str:
    """
    Generate feedback without AI (rule-based)
    """
    weak_areas = analytics_data.get("weak_areas", [])
    by_subject = analytics_data.get("by_subject", {})
    overall_accuracy = analytics_data.get("overall_accuracy", 0)
    
    feedback_parts = []
    
    # Overall performance
    if overall_accuracy >= 80:
        feedback_parts.append("🎉 Excellent work! You're performing at a high level.")
    elif overall_accuracy >= 70:
        feedback_parts.append("👍 Good progress! You're on the right track.")
    elif overall_accuracy >= 60:
        feedback_parts.append("📚 You're making progress. Keep practicing to improve!")
    else:
        feedback_parts.append("💪 Don't give up! Every practice session helps you improve.")
    
    # Weak areas
    if weak_areas:
        feedback_parts.append("\n📊 Areas to Focus On:")
        for area in weak_areas[:3]:  # Top 3 weak areas
            subject_name = area["subject"].capitalize()
            accuracy = area["accuracy"]
            feedback_parts.append(
                f"• {subject_name}: {accuracy:.1f}% accuracy - "
                f"{'High priority' if area['priority'] == 'high' else 'Medium priority'} improvement needed"
            )
    
    # Recommendations
    feedback_parts.append("\n💡 Study Recommendations:")
    
    if weak_areas:
        top_weak = weak_areas[0]["subject"]
        feedback_parts.append(f"1. Focus more practice on {top_weak.capitalize()} questions")
        feedback_parts.append(f"2. Review {top_weak.capitalize()} concepts and fundamentals")
    else:
        feedback_parts.append("1. Continue practicing across all subjects to maintain your strong performance")
    
    # Subject-specific tips
    subject_tips = {
        "math": "Practice algebra, geometry, and trigonometry fundamentals",
        "english": "Focus on grammar rules, punctuation, and sentence structure",
        "reading": "Work on reading comprehension strategies and time management",
        "science": "Practice interpreting graphs, charts, and scientific data"
    }
    
    if weak_areas:
        top_subject = weak_areas[0]["subject"]
        if top_subject in subject_tips:
            feedback_parts.append(f"3. {subject_tips[top_subject]}")
    else:
        feedback_parts.append("2. Challenge yourself with harder difficulty questions")
        feedback_parts.append("3. Take timed practice tests to improve speed")
    
    return "\n".join(feedback_parts)

@router.get("/api/ai-feedback/{user_id}")
async def get_ai_feedback(user_id: int, use_ai: bool = True):
    """
    Get AI-powered personalized feedback based on student performance
    """
    try:
        # Get analytics data by calling the analytics endpoint internally
        supabase = get_supabase_client()
        answers_response = supabase.table("user_answers").select("*").eq("user_id", user_id).execute()
        
        if not answers_response.data:
            return {
                "feedback": "Start practicing questions to receive personalized feedback!",
                "recommendations": [
                    "Begin with easy difficulty questions",
                    "Try questions from all subjects",
                    "Aim for at least 10 questions to get meaningful feedback"
                ],
                "ai_generated": False
            }
        
        answers = answers_response.data
        total_answered = len(answers)
        total_correct = sum(1 for a in answers if a.get("is_correct", False))
        overall_accuracy = (total_correct / total_answered * 100) if total_answered > 0 else 0.0
        
        # Calculate performance by subject
        subjects = ["math", "english", "reading", "science"]
        by_subject = {}
        
        for subject in subjects:
            subject_answers = [a for a in answers if a.get("subject") == subject]
            if subject_answers:
                subject_correct = sum(1 for a in subject_answers if a.get("is_correct", False))
                by_subject[subject] = {
                    "total": len(subject_answers),
                    "correct": subject_correct,
                    "accuracy": (subject_correct / len(subject_answers) * 100) if subject_answers else 0.0
                }
        
        # Identify weak areas
        weak_areas = []
        for subject, stats in by_subject.items():
            if stats["accuracy"] < 70.0 and stats["total"] >= 5:
                weak_areas.append({
                    "subject": subject,
                    "accuracy": stats["accuracy"],
                    "total_attempted": stats["total"],
                    "priority": "high" if stats["accuracy"] < 50 else "medium"
                })
        
        weak_areas.sort(key=lambda x: x["accuracy"])
        
        analytics_data = {
            "user_id": user_id,
            "total_answered": total_answered,
            "total_correct": total_correct,
            "overall_accuracy": overall_accuracy,
            "by_subject": by_subject,
            "weak_areas": weak_areas
        }
        
        # Try to generate AI feedback if available
        ai_feedback = None
        if use_ai and OPENAI_AVAILABLE and OPENAI_API_KEY:
            ai_feedback = generate_ai_feedback_with_openai(analytics_data)
        
        # Use AI feedback if available, otherwise use fallback
        feedback = ai_feedback if ai_feedback else generate_fallback_feedback(analytics_data)
        
        # Generate specific recommendations
        recommendations = []
        weak_areas = analytics_data.get("weak_areas", [])
        
        if weak_areas:
            for area in weak_areas[:3]:
                subject = area["subject"]
                recommendations.append(
                    f"Practice more {subject.capitalize()} questions "
                    f"(current accuracy: {area['accuracy']:.1f}%)"
                )
        else:
            recommendations.append("Continue practicing to maintain your strong performance")
            recommendations.append("Try challenging yourself with harder difficulty questions")
        
        # Add general recommendations
        if analytics_data["total_answered"] < 20:
            recommendations.append("Answer more questions to get better insights")
        
        return {
            "feedback": feedback,
            "recommendations": recommendations,
            "analytics_summary": {
                "overall_accuracy": analytics_data["overall_accuracy"],
                "total_answered": analytics_data["total_answered"],
                "weak_areas_count": len(weak_areas)
            },
            "ai_generated": ai_feedback is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/ai-feedback/{user_id}/subject/{subject}")
async def get_subject_specific_feedback(user_id: int, subject: str):
    """
    Get AI feedback specific to a subject
    """
    try:
        supabase = get_supabase_client()
        
        # Get subject-specific analytics
        answers_response = supabase.table("user_answers")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("subject", subject)\
            .execute()
        
        if not answers_response.data:
            return {
                "feedback": f"No {subject} questions answered yet. Start practicing to get feedback!",
                "subject": subject,
                "ai_generated": False
            }
        
        answers = answers_response.data
        subject_correct = sum(1 for a in answers if a.get("is_correct", False))
        subject_accuracy = (subject_correct / len(answers) * 100) if answers else 0.0
        
        # Generate subject-specific feedback
        feedback_parts = [f"📚 {subject.capitalize()} Performance: {subject_accuracy:.1f}%"]
        
        if subject_accuracy >= 80:
            feedback_parts.append("Excellent! You've mastered this subject.")
        elif subject_accuracy >= 70:
            feedback_parts.append("Good work! Keep practicing to improve further.")
        elif subject_accuracy >= 60:
            feedback_parts.append("You're making progress. Focus on fundamentals.")
        else:
            feedback_parts.append("This is a key area for improvement. Don't give up!")
        
        # Subject-specific tips
        subject_tips = {
            "math": "Focus on: algebra fundamentals, geometry formulas, and problem-solving strategies.",
            "english": "Focus on: grammar rules, punctuation, sentence structure, and style.",
            "reading": "Focus on: reading comprehension, identifying main ideas, and time management.",
            "science": "Focus on: data interpretation, scientific reasoning, and graph analysis."
        }
        
        if subject in subject_tips:
            feedback_parts.append(f"\n💡 {subject_tips[subject]}")
        
        return {
            "feedback": "\n".join(feedback_parts),
            "subject": subject,
            "accuracy": round(subject_accuracy, 2),
            "total_answered": len(answers),
            "ai_generated": False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

