"""
Script to populate the database with sample ACT questions
"""
import json
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.local_db import SessionLocal, engine, Base
from app.models.question import Question

# Create all tables first
Base.metadata.create_all(bind=engine)

# Sample ACT questions across different subjects and difficulties
SAMPLE_QUESTIONS = [
    # ==================== MATH ====================
    {
        "subject": "math",
        "difficulty": "easy",
        "question_text": "What is 7 + 8?",
        "choices": ["12", "14", "15", "16"],
        "correct_answer": "C",
        "explanation": "7 + 8 = 15. Simply add the two numbers together."
    },
    {
        "subject": "math",
        "difficulty": "easy",
        "question_text": "If x = 5, what is 2x + 3?",
        "choices": ["8", "10", "13", "18"],
        "correct_answer": "C",
        "explanation": "Substitute x = 5 into 2x + 3: 2(5) + 3 = 10 + 3 = 13"
    },
    {
        "subject": "math",
        "difficulty": "medium",
        "question_text": "Solve for x: 2x - 4 = 10",
        "choices": ["3", "5", "7", "14"],
        "correct_answer": "C",
        "explanation": "2x - 4 = 10 → 2x = 14 → x = 7"
    },
    {
        "subject": "math",
        "difficulty": "medium",
        "question_text": "What is the area of a rectangle with length 8 and width 5?",
        "choices": ["13", "26", "40", "64"],
        "correct_answer": "C",
        "explanation": "Area = length × width = 8 × 5 = 40 square units"
    },
    {
        "subject": "math",
        "difficulty": "medium",
        "question_text": "If a triangle has a base of 10 and height of 6, what is its area?",
        "choices": ["16", "30", "60", "120"],
        "correct_answer": "B",
        "explanation": "Area of triangle = (1/2) × base × height = (1/2) × 10 × 6 = 30 square units"
    },
    {
        "subject": "math",
        "difficulty": "hard",
        "question_text": "Solve: x² - 5x + 6 = 0",
        "choices": ["x = 2 or x = 3", "x = 1 or x = 6", "x = -2 or x = -3", "x = 0 or x = 5"],
        "correct_answer": "A",
        "explanation": "Factor: (x - 2)(x - 3) = 0, so x = 2 or x = 3"
    },
    {
        "subject": "math",
        "difficulty": "hard",
        "question_text": "What is the slope of the line passing through points (2, 3) and (5, 9)?",
        "choices": ["1", "2", "3", "4"],
        "correct_answer": "B",
        "explanation": "Slope = (y₂ - y₁)/(x₂ - x₁) = (9 - 3)/(5 - 2) = 6/3 = 2"
    },
    
    # ==================== ENGLISH ====================
    {
        "subject": "english",
        "difficulty": "easy",
        "question_text": "Choose the correct sentence:",
        "choices": [
            "She go to the store every day.",
            "She goes to the store every day.",
            "She going to the store every day.",
            "She gone to the store every day."
        ],
        "correct_answer": "B",
        "explanation": "With the third person singular subject 'she', the verb 'go' must change to 'goes'."
    },
    {
        "subject": "english",
        "difficulty": "easy",
        "question_text": "What is the antonym of 'bright'?",
        "choices": ["shiny", "light", "dark", "clear"],
        "correct_answer": "C",
        "explanation": "'Dark' is the opposite of 'bright', meaning lacking light or illumination."
    },
    {
        "subject": "english",
        "difficulty": "medium",
        "question_text": "Which sentence is correctly punctuated?",
        "choices": [
            "The teacher asked: are you ready?",
            "The teacher asked: Are you ready?",
            "The teacher asked, are you ready?",
            "The teacher asked; are you ready?"
        ],
        "correct_answer": "B",
        "explanation": "After a colon introducing a direct question, capitalize the first word of the question."
    },
    {
        "subject": "english",
        "difficulty": "medium",
        "question_text": "What is the correct form? 'Between you and ___'",
        "choices": ["I", "me", "myself", "mine"],
        "correct_answer": "B",
        "explanation": "Prepositions like 'between' take the objective case, so 'me' is correct."
    },
    {
        "subject": "english",
        "difficulty": "hard",
        "question_text": "Which sentence best shows irony?",
        "choices": [
            "It was raining, so we went inside.",
            "The firehouse burned down.",
            "She was thrilled to receive a parking ticket.",
            "He studied hard for the test."
        ],
        "correct_answer": "C",
        "explanation": "Irony is when the opposite of what is expected occurs. Being 'thrilled' about a parking ticket is ironic."
    },
    
    # ==================== READING ====================
    {
        "subject": "reading",
        "difficulty": "easy",
        "question_text": "What is the main idea of a passage about how plants grow?",
        "choices": [
            "Plants need sunlight, water, and soil to grow.",
            "Some plants are taller than others.",
            "Plants have different colored flowers.",
            "Gardening is a popular hobby."
        ],
        "correct_answer": "A",
        "explanation": "The main idea encompasses the key factors necessary for plant growth."
    },
    {
        "subject": "reading",
        "difficulty": "easy",
        "question_text": "Based on the passage about migration, why do birds fly south?",
        "choices": [
            "To find warmer weather and food sources.",
            "Because they are tired.",
            "To visit different countries.",
            "Because the government tells them to."
        ],
        "correct_answer": "A",
        "explanation": "Birds migrate south to escape harsh winters and find sufficient food sources."
    },
    {
        "subject": "reading",
        "difficulty": "medium",
        "question_text": "What can be inferred about the character from the passage?",
        "choices": [
            "He was dishonest and cruel.",
            "He valued education and hard work.",
            "He was wealthy from birth.",
            "He never made any mistakes."
        ],
        "correct_answer": "B",
        "explanation": "Inferences are based on clues in the text that suggest these character traits."
    },
    {
        "subject": "reading",
        "difficulty": "hard",
        "question_text": "What is the author's tone in this passage?",
        "choices": [
            "Angry and bitter",
            "Humorous and lighthearted",
            "Serious and informative",
            "Sad and melancholic"
        ],
        "correct_answer": "C",
        "explanation": "Identifying tone requires analyzing word choice and the overall attitude in the passage."
    },
    
    # ==================== SCIENCE ====================
    {
        "subject": "science",
        "difficulty": "easy",
        "question_text": "What is the chemical formula for water?",
        "choices": ["H₂O", "CO₂", "O₂", "H₂"],
        "correct_answer": "A",
        "explanation": "Water consists of 2 hydrogen atoms and 1 oxygen atom, hence H₂O."
    },
    {
        "subject": "science",
        "difficulty": "easy",
        "question_text": "What do plants use for photosynthesis?",
        "choices": [
            "Sunlight, water, and carbon dioxide",
            "Soil, oxygen, and nitrogen",
            "Heat, ice, and minerals",
            "Wind, rain, and soil nutrients"
        ],
        "correct_answer": "A",
        "explanation": "Photosynthesis requires sunlight, water, and CO₂ to produce glucose and oxygen."
    },
    {
        "subject": "science",
        "difficulty": "medium",
        "question_text": "What is Newton's first law of motion?",
        "choices": [
            "Force equals mass times acceleration (F=ma).",
            "An object at rest stays at rest unless acted upon by a force.",
            "For every action, there is an equal and opposite reaction.",
            "Objects fall at the same rate regardless of mass."
        ],
        "correct_answer": "B",
        "explanation": "Newton's first law states that objects maintain their state of motion unless an external force acts on them."
    },
    {
        "subject": "science",
        "difficulty": "medium",
        "question_text": "What are the three states of matter?",
        "choices": [
            "Solid, liquid, and gas",
            "Heavy, light, and medium",
            "Hot, cold, and warm",
            "Element, compound, and mixture"
        ],
        "correct_answer": "A",
        "explanation": "The three fundamental states of matter are solid (fixed shape), liquid (takes shape of container), and gas (fills container)."
    },
    {
        "subject": "science",
        "difficulty": "hard",
        "question_text": "What is the process by which plants convert sunlight into chemical energy?",
        "choices": [
            "Respiration",
            "Photosynthesis",
            "Fermentation",
            "Decomposition"
        ],
        "correct_answer": "B",
        "explanation": "Photosynthesis is the biochemical process that converts light energy into chemical energy stored in glucose."
    },
    {
        "subject": "science",
        "difficulty": "hard",
        "question_text": "How many electrons does a neutral carbon atom have?",
        "choices": ["4", "6", "8", "12"],
        "correct_answer": "B",
        "explanation": "Carbon has atomic number 6, meaning it has 6 protons and 6 electrons in a neutral atom."
    },
]

def seed_database():
    """Populate the database with sample questions"""
    db = SessionLocal()
    
    try:
        # Check if questions already exist
        existing_count = db.query(Question).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} questions. Skipping seed.")
            return
        
        # Add all sample questions
        for q_data in SAMPLE_QUESTIONS:
            question = Question(
                subject=q_data["subject"],
                difficulty=q_data["difficulty"],
                question_text=q_data["question_text"],
                choices=json.dumps(q_data["choices"]),  # Store as JSON string
                correct_answer=q_data["correct_answer"],
                explanation=q_data["explanation"]
            )
            db.add(question)
        
        db.commit()
        print(f"✅ Successfully seeded database with {len(SAMPLE_QUESTIONS)} questions!")
        
        # Show summary by subject
        subjects = ["math", "english", "reading", "science"]
        for subject in subjects:
            count = db.query(Question).filter(Question.subject == subject).count()
            print(f"   - {subject.capitalize()}: {count} questions")
    
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
    
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
