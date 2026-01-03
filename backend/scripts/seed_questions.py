"""
Script to populate the database with ACT questions
Based on realistic ACT test format with passage-based questions
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

# ACT-style questions with passage-based format
SAMPLE_QUESTIONS = [
    # ==================== ENGLISH - Passage 1 (Grammar & Style) ====================
    {
        "subject": "english",
        "difficulty": "medium",
        "question_text": "Passage: The nature of leadership has been studied extensively throughout history, [A] throughout history; [B] throughout history: [C] throughout history, and researchers continue to debate its essential qualities. [D] NO CHANGE",
        "choices": ["A. NO CHANGE", "B. throughout history;", "C. throughout history:", "D. throughout history and"],
        "correct_answer": "A",
        "explanation": "NO CHANGE is correct. The comma is appropriately placed before the coordinating conjunction 'and' when joining two independent clauses. The sentence structure is clear with the existing comma."
    },
    {
        "subject": "english",
        "difficulty": "medium",
        "question_text": "Passage: Effective leaders [A] must posses strong communication skills, they must also demonstrate empathy and emotional intelligence. [B] must possess strong communication skills, and they must also demonstrate empathy and emotional intelligence. [C] must posses strong communication skills, and they also must demonstrate empathy and emotional intelligence. [D] must possess strong communication skills; they must also demonstrate empathy and emotional intelligence.",
        "choices": ["A. NO CHANGE", "B. must possess strong communication skills, and they must also demonstrate empathy and emotional intelligence.", "C. must posses strong communication skills, and they also must demonstrate empathy and emotional intelligence.", "D. must possess strong communication skills; they must also demonstrate empathy and emotional intelligence."],
        "correct_answer": "B",
        "explanation": "B is correct. 'Possess' is the correct spelling, and the comma with 'and' properly joins the two independent clauses. The sentence maintains parallel structure with 'must demonstrate'."
    },
    {
        "subject": "english",
        "difficulty": "medium",
        "question_text": "Passage: The researcher found that team performance improved significantly when leaders encouraged [A] input from all members, which led to more innovative solutions. [B] inputs from all members, which led to more innovative solutions. [C] input from all members which led to more innovative solutions. [D] input from all members, leading to more innovative solutions.",
        "choices": ["A. NO CHANGE", "B. inputs from all members, which led to more innovative solutions.", "C. input from all members which led to more innovative solutions.", "D. input from all members, leading to more innovative solutions."],
        "correct_answer": "A",
        "explanation": "A is correct. 'Input' is an uncountable noun in this context (like 'advice' or 'information'), so the singular form is correct. The comma appropriately sets off the non-restrictive clause."
    },
    {
        "subject": "english",
        "difficulty": "hard",
        "question_text": "Passage: In the 21st century, organizations face unprecedented challenges [A] -- globalization, technological disruption, and evolving workforce demographics -- creating a need for adaptive leadership. [B] : globalization, technological disruption, and evolving workforce demographics, creating a need for adaptive leadership. [C] globalization, technological disruption, and evolving workforce demographics creating a need for adaptive leadership. [D] globalization, technological disruption, and evolving workforce demographics; creating a need for adaptive leadership.",
        "choices": ["A. NO CHANGE", "B. : globalization, technological disruption, and evolving workforce demographics, creating a need for adaptive leadership.", "C. globalization, technological disruption, and evolving workforce demographics creating a need for adaptive leadership.", "D. globalization, technological disruption, and evolving workforce demographics; creating a need for adaptive leadership."],
        "correct_answer": "A",
        "explanation": "A is correct. The em dashes effectively set off the explanatory phrase listing the challenges. This creates a dramatic pause and clearly separates the list from the main clause."
    },
    {
        "subject": "english",
        "difficulty": "hard",
        "question_text": "Passage: Studies have shown [A] that employees who feel heard are more engaged, moreover, they demonstrate higher productivity levels. [B] that employees who feel heard are more engaged; moreover, they demonstrate higher productivity levels. [C] that employees who feel heard are more engaged, moreover they demonstrate higher productivity levels. [D] that employees who feel heard are more engaged and, moreover, they demonstrate higher productivity levels.",
        "choices": ["A. NO CHANGE", "B. that employees who feel heard are more engaged; moreover, they demonstrate higher productivity levels.", "C. that employees who feel heard are more engaged, moreover they demonstrate higher productivity levels.", "D. that employees who feel heard are more engaged and, moreover, they demonstrate higher productivity levels."],
        "correct_answer": "B",
        "explanation": "B is correct. The semicolon properly joins two independent clauses. 'Moreover' is a conjunctive adverb that requires either a semicolon or a period before it, followed by a comma."
    },
    
    # ==================== SCIENCE - Data Interpretation ====================
    {
        "subject": "science",
        "difficulty": "medium",
        "question_text": "Passage: A student conducted an experiment to measure how temperature affects the rate of reaction. The table below shows the results:\n\nTemperature (C): 10, 20, 30, 40, 50\nReaction Time (s): 120, 60, 40, 30, 24\n\nBased on the data, what is the relationship between temperature and reaction time?",
        "choices": [
            "As temperature increases, reaction time increases proportionally.",
            "As temperature increases, reaction time decreases.",
            "There is no relationship between temperature and reaction time.",
            "The relationship is exponential."
        ],
        "correct_answer": "B",
        "explanation": "The data clearly shows that as temperature increases from 10C to 50C, the reaction time decreases from 120s to 24s. This demonstrates an inverse relationship between temperature and reaction time."
    },
    {
        "subject": "science",
        "difficulty": "medium",
        "question_text": "Passage: A biology class measured the growth of plants under different light conditions over 14 days:\n\nGroup A (Dark): 2cm -> 3cm -> 3cm (no further growth)\nGroup B (Room Light): 2cm -> 8cm -> 14cm\nGroup C (Direct Sunlight): 2cm -> 12cm -> 18cm\n\nWhich conclusion is best supported by the data?",
        "choices": [
            "Plants need darkness to grow properly.",
            "More light leads to greater plant growth.",
            "All plants grow at the same rate regardless of light.",
            "Plants stop growing after 7 days without sunlight."
        ],
        "correct_answer": "B",
        "explanation": "The data shows that plants in direct sunlight (Group C) grew the most (18cm), followed by room light (14cm), while plants in darkness (Group A) stopped growing (3cm). This supports the conclusion that more light leads to greater growth."
    },
    {
        "subject": "science",
        "difficulty": "medium",
        "question_text": "Passage: A chemistry experiment measured the pH of four solutions at different temperatures:\n\nSolution 1: pH 7.0 at 25C, pH 7.4 at 50C\nSolution 2: pH 4.0 at 25C, pH 4.2 at 50C\nSolution 3: pH 9.0 at 25C, pH 8.5 at 50C\n\nWhat pattern is observed?",
        "choices": [
            "All solutions become more acidic as temperature increases.",
            "Neutral solutions become more basic with increased temperature.",
            "The pH change with temperature varies by solution type.",
            "Temperature has no effect on pH values."
        ],
        "correct_answer": "C",
        "explanation": "Solution 1 (neutral) became more basic (7.0->7.4), Solution 2 (acidic) became slightly more basic (4.0->4.2), and Solution 3 (basic) became more acidic (9.0->8.5). The pattern varies by solution."
    },
    {
        "subject": "science",
        "difficulty": "hard",
        "question_text": "Passage: Two gases, X and Y, were mixed in a closed container. The pressure was measured at different volumes at constant temperature:\n\nVolume (L): 1.0, 2.0, 4.0, 8.0\nPressure (atm): 8.0, 4.0, 2.0, 1.0\n\nThis data demonstrates which gas law?",
        "choices": [
            "Boyle's Law (P proportional to V at constant T)",
            "Charles's Law (V proportional to T at constant P)",
            "Avogadro's Law (V proportional to n at constant P,T)",
            "Dalton's Law of Partial Pressures"
        ],
        "correct_answer": "A",
        "explanation": "The data shows an inverse relationship: as volume doubles, pressure halves (8->4->2->1). This is Boyle's Law, which states that pressure is inversely proportional to volume at constant temperature."
    },
    {
        "subject": "science",
        "difficulty": "hard",
        "question_text": "Passage: An ecologist recorded the population of a species over 10 years:\n\nYear: 2014, 2016, 2018, 2020, 2022, 2024\nPopulation: 100, 150, 225, 338, 507, 761\n\nBased on the pattern, what is the approximate growth rate?",
        "choices": [
            "Linear growth of 50 individuals per year",
            "Exponential growth with doubling every ~2 years",
            "Logarithmic growth slowing over time",
            "No clear pattern can be determined"
        ],
        "correct_answer": "B",
        "explanation": "The population approximately doubles every 2 years (100->200, 200->400, 400->800). This is characteristic of exponential growth. Each interval shows roughly a 1.5x increase, consistent with exponential rather than linear growth."
    },
    
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
        "explanation": "2x - 4 = 10 -> 2x = 14 -> x = 7"
    },
    {
        "subject": "math",
        "difficulty": "medium",
        "question_text": "What is the area of a rectangle with length 8 and width 5?",
        "choices": ["13", "26", "40", "64"],
        "correct_answer": "C",
        "explanation": "Area = length x width = 8 x 5 = 40 square units"
    },
    {
        "subject": "math",
        "difficulty": "medium",
        "question_text": "If a triangle has a base of 10 and height of 6, what is its area?",
        "choices": ["16", "30", "60", "120"],
        "correct_answer": "B",
        "explanation": "Area of triangle = (1/2) x base x height = (1/2) x 10 x 6 = 30 square units"
    },
    {
        "subject": "math",
        "difficulty": "hard",
        "question_text": "Solve: x squared - 5x + 6 = 0",
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
        "explanation": "Slope = (y2 - y1)/(x2 - x1) = (9 - 3)/(5 - 2) = 6/3 = 2"
    },
    
    # ==================== READING ====================
    {
        "subject": "reading",
        "difficulty": "medium",
        "question_text": "Passage: The library had been closed for renovations for over a year. When it finally reopened, Maria noticed immediately that something was different. The smell of old books still permeated the air, but the arrangement of the shelves had changed dramatically. Where once there had been cramped aisles, there were now spacious reading areas with comfortable chairs and natural light flooding through large windows.\n\nBased on the passage, what can be inferred about Maria?",
        "choices": [
            "She had never been to the library before.",
            "She was upset by the changes to the library.",
            "She was familiar with the library's previous layout.",
            "She only cared about the smell of the books."
        ],
        "correct_answer": "C",
        "explanation": "Maria noticed that 'the arrangement of the shelves had changed dramatically,' which implies she was familiar enough with the old layout to recognize the differences."
    },
    {
        "subject": "reading",
        "difficulty": "hard",
        "question_text": "Passage: The scientist's discovery was initially met with skepticism by the academic community. Many questioned the methodology used in the experiments, while others questioned whether the results could be replicated. However, over the next decade, multiple independent research groups confirmed the findings, and the scientific community eventually embraced the discovery as groundbreaking.\n\nThe author's tone in this passage is best described as:",
        "choices": [
            "Critical of the academic community",
            "Celebratory of the discovery",
            "Objective and informative",
            "Sympathetic to the scientist"
        ],
        "correct_answer": "C",
        "explanation": "The author presents facts without emotional language, describing both the skepticism and the eventual acceptance in a neutral manner. This is characteristic of an objective, informative tone."
    },
    {
        "subject": "reading",
        "difficulty": "medium",
        "question_text": "Passage: Urban farming has gained popularity in recent years as city dwellers seek to reconnect with nature and reduce their carbon footprint. Rooftop gardens, community plots, and hydroponic systems in abandoned warehouses have transformed unused urban spaces into productive green areas.\n\nThe passage suggests that urban farming primarily serves to:",
        "choices": [
            "Replace traditional agriculture entirely.",
            "Provide a solution to urban food deserts.",
            "Help city residents feel more connected to nature.",
            "Increase profits for large agricultural corporations."
        ],
        "correct_answer": "C",
        "explanation": "The passage states that urban farming helps 'city dwellers seek to reconnect with nature and reduce their carbon footprint.' This is the primary purpose mentioned."
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
        print(f"Successfully seeded database with {len(SAMPLE_QUESTIONS)} questions!")
        
        # Show summary by subject
        subjects = ["math", "english", "reading", "science"]
        for subject in subjects:
            count = db.query(Question).filter(Question.subject == subject).count()
            print(f"   - {subject.capitalize()}: {count} questions")
    
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

