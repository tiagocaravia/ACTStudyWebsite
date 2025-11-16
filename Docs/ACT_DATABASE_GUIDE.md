# ACT Database Setup Guide

## Current Status

Your system is set up to pull questions from a Supabase `questions` table. You need to populate this table with ACT practice questions.

## Database Schema

The `questions` table should have this structure:

```sql
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    subject TEXT NOT NULL,           -- 'math', 'english', 'reading', 'science'
    question_text TEXT NOT NULL,     -- The question itself
    choices TEXT[] NOT NULL,          -- Array of answer choices
    correct_answer TEXT NOT NULL,     -- The correct answer (must match one of choices)
    explanation TEXT,                 -- Explanation of the answer
    difficulty TEXT,                 -- 'easy', 'medium', 'hard'
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Where to Get ACT Questions

### Legal Sources (Recommended)

1. **Official ACT Practice Tests**
   - ACT.org provides free practice tests
   - These are copyright-free for educational use
   - Download from: https://www.act.org/content/act/en/products-and-services/the-act/test-preparation.html

2. **QuizMe by ACT** ⭐ **NEW DISCOVERY**
   - Official ACT platform: https://quizme.act.org/
   - Provides real ACT practice questions across all subjects
   - **Important**: This is official ACT content - you need proper licensing/permissions
   - **Contact ACT directly** to discuss:
     - Partnership opportunities
     - Licensing agreements for using their questions
     - API access (if available)
   - ⚠️ **Do NOT scrape** questions from QuizMe without permission - this violates terms of service and copyright

3. **Public Domain ACT Questions**
   - Older ACT tests (pre-2000) may be in public domain
   - Check copyright status before using

4. **Create Your Own**
   - Write questions based on ACT format and content areas
   - Focus on ACT-style question types
   - This is the safest option legally

5. **Educational Licenses**
   - Some educational publishers offer question banks
   - Check licensing terms carefully

### ⚠️ Copyright Warning

- **DO NOT** scrape questions from copyrighted sources (including QuizMe.act.org)
- **DO NOT** use questions from paid test prep books without permission
- **DO NOT** extract questions from QuizMe without ACT's written permission
- Always verify copyright status before importing questions
- **Contact ACT** for official licensing if you want to use their content

### 📋 About the SDU Document

The [SDU File Requirements document](https://www.act.org/content/dam/act/unsecured/documents/SDUFileLayoutLoadInstructionsSandD.pdf) you found is **NOT relevant** for getting practice questions. It's about:
- Student registration data uploads
- Managing test administration
- Demographic information for official ACT testing

This document is for schools administering the ACT, not for practice question databases.

## Adding Questions

### Method 1: Using the Admin API

Use the admin endpoints to add questions programmatically:

```bash
# Add a single question
curl -X POST "http://localhost:8000/api/admin/questions" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "math",
    "question_text": "What is 2 + 2?",
    "choices": ["2", "3", "4", "5"],
    "correct_answer": "4",
    "explanation": "Basic addition",
    "difficulty": "easy"
  }'
```

### Method 2: Using the Import Script

1. Edit `backend/scripts/import_sample_questions.py`
2. Add your questions to the `SAMPLE_QUESTIONS` array
3. Run the script:

```bash
cd backend
python scripts/import_sample_questions.py
```

### Method 3: Direct Database Insert (Supabase)

1. Go to your Supabase dashboard
2. Navigate to Table Editor > questions
3. Click "Insert" and add questions manually

### Method 4: CSV Import

Create a CSV file and use Supabase's import feature:

```csv
subject,question_text,choices,correct_answer,explanation,difficulty
math,"What is 2 + 2?","{2,3,4,5}",4,"Basic addition",easy
english,"Choose correct grammar","{was,were,is,be}",were,"Plural subject",easy
```

## Question Format Examples

### Math Question
```json
{
  "subject": "math",
  "question_text": "If 3x + 5 = 20, what is the value of x?",
  "choices": ["3", "5", "15", "25"],
  "correct_answer": "5",
  "explanation": "Subtract 5 from both sides: 3x = 15. Divide by 3: x = 5.",
  "difficulty": "easy"
}
```

### English Question
```json
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
}
```

### Reading Question
```json
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
  "explanation": "The passage emphasizes how the character overcame obstacles.",
  "difficulty": "medium"
}
```

### Science Question
```json
{
  "subject": "science",
  "question_text": "According to the graph, what was the temperature at 2 PM?",
  "choices": ["20°C", "25°C", "30°C", "35°C"],
  "correct_answer": "30°C",
  "explanation": "Reading the graph at the 2 PM mark shows 30°C.",
  "difficulty": "medium"
}
```

## Recommended Question Distribution

For a comprehensive ACT study site, aim for:

- **Math**: 200-500 questions (algebra, geometry, trigonometry)
- **English**: 200-500 questions (grammar, punctuation, style)
- **Reading**: 100-300 questions (comprehension, analysis)
- **Science**: 100-300 questions (data interpretation, scientific reasoning)

**Total**: 600-1600 questions for a robust practice database

## Checking Your Database

Use the admin endpoint to check question counts:

```bash
curl "http://localhost:8000/api/admin/questions/count"
```

Response:
```json
{
  "math": 150,
  "english": 120,
  "reading": 80,
  "science": 90,
  "total": 440
}
```

## Next Steps

1. **Start Small**: Import 10-20 sample questions to test the system
2. **Verify Format**: Make sure questions display correctly in the frontend
3. **Scale Up**: Gradually add more questions as you acquire them
4. **Categorize**: Use difficulty levels to help students progress
5. **Add Explanations**: Detailed explanations help students learn

## Security Note

⚠️ **Important**: The admin endpoints are currently unprotected. For production:

1. Add authentication middleware
2. Restrict admin endpoints to authorized users only
3. Consider using API keys or JWT tokens
4. Rate limit the endpoints to prevent abuse

