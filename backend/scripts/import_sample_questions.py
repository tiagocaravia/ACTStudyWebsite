"""
Sample script to import ACT questions into the database
This is a template - you'll need to adapt it to your question source
"""
import requests
import json
from typing import List, Dict

# Update with your API URL
API_URL = "http://localhost:8000"  # or your production URL

def import_question(question_data: Dict) -> bool:
    """Import a single question"""
    try:
        response = requests.post(
            f"{API_URL}/api/admin/questions",
            json=question_data,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            print(f"✓ Imported: {question_data['subject']} question")
            return True
        else:
            print(f"✗ Failed: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def import_questions_bulk(questions: List[Dict]) -> Dict:
    """Import multiple questions at once"""
    try:
        response = requests.post(
            f"{API_URL}/api/admin/questions/bulk",
            json={"questions": questions},
            headers={"Content-Type": "application/json"}
        )
        return response.json()
    except Exception as e:
        print(f"✗ Error: {e}")
        return {"success": False, "error": str(e)}

# Example question format
SAMPLE_QUESTIONS = [
    {
        "subject": "math",
        "question_text": "If 3x + 5 = 20, what is the value of x?",
        "choices": ["3", "5", "15", "25"],
        "correct_answer": "5",
        "explanation": "Subtract 5 from both sides: 3x = 15. Divide by 3: x = 5.",
        "difficulty": "easy"
    },
    {
        "subject": "english",
        "question_text": "Choose the sentence with correct grammar:",
        "choices": [
            "The students was studying.",
            "The students were studying.",
            "The students is studying.",
            "The students be studying."
        ],
        "correct_answer": "The students were studying.",
        "explanation": "'Students' is plural, so it requires the plural verb 'were'.",
        "difficulty": "easy"
    },
    {
        "subject": "reading",
        "question_text": "Based on the passage, what is the main theme?",
        "choices": [
            "The importance of friendship",
            "The challenges of growing up",
            "The value of education",
            "The power of perseverance"
        ],
        "correct_answer": "The power of perseverance",
        "explanation": "The passage emphasizes how the character overcame obstacles through determination.",
        "difficulty": "medium"
    },
    {
        "subject": "science",
        "question_text": "According to the graph, what was the temperature at 2 PM?",
        "choices": ["20°C", "25°C", "30°C", "35°C"],
        "correct_answer": "30°C",
        "explanation": "Reading the graph at the 2 PM mark shows the temperature is 30°C.",
        "difficulty": "medium"
    }
]

if __name__ == "__main__":
    print("Importing sample ACT questions...")
    print(f"API URL: {API_URL}\n")
    
    # Import questions one by one (or use bulk import)
    success_count = 0
    for question in SAMPLE_QUESTIONS:
        if import_question(question):
            success_count += 1
    
    print(f"\n✓ Successfully imported {success_count}/{len(SAMPLE_QUESTIONS)} questions")
    
    # Or use bulk import:
    # result = import_questions_bulk(SAMPLE_QUESTIONS)
    # print(f"\n✓ Bulk import result: {result}")

