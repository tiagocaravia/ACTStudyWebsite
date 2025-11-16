# ACT Study Website Setup Guide

## Overview

This ACT Study Website helps students prepare for the ACT exam with:
- Practice questions from an ACT database
- Performance tracking and analytics
- AI-powered personalized feedback based on student weaknesses
- Progress dashboard showing areas of improvement

## Backend Setup

### 1. Database Setup (Supabase)

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `backend/database_schema.sql` in your Supabase SQL editor:
   - This creates the `user_answers` table for tracking student performance
   - The `questions` table should already exist with your ACT question database

### 2. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
# Optional: For AI-powered feedback
OPENAI_API_KEY=your_openai_api_key
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt

# Optional: For AI feedback
pip install openai
```

### 4. Run the Backend

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Update API URL (if needed)

In `frontend/src/App.tsx`, update the `API_URL` constant if your backend is hosted elsewhere:

```typescript
const API_URL = 'https://actstudywebsite.onrender.com';
// or 'http://localhost:8000' for local development
```

### 3. Run the Frontend

```bash
npm start
```

The app will be available at `http://localhost:3000`

## Features

### Answer Tracking

- When a user answers questions, their responses are automatically tracked
- The system tracks:
  - Which questions were answered correctly/incorrectly
  - Time spent on each question
  - Subject and difficulty level

### Analytics Dashboard

Access the progress dashboard by setting a User ID. The dashboard shows:
- **Overview**: Total questions answered, accuracy, weak areas
- **By Subject**: Performance breakdown for Math, English, Reading, Science
- **AI Feedback**: Personalized recommendations based on performance

### AI Feedback

The system provides two types of feedback:

1. **AI-Powered Feedback** (requires OpenAI API key):
   - Uses GPT-3.5-turbo to generate personalized, encouraging feedback
   - Analyzes performance patterns and provides actionable recommendations

2. **Rule-Based Feedback** (works without OpenAI):
   - Provides structured feedback based on performance metrics
   - Identifies weak areas and suggests study strategies

## API Endpoints

### Questions
- `GET /api/questions` - Get practice questions (supports `subject`, `difficulty`, `limit` filters)
- `GET /api/questions/{question_id}` - Get a specific question
- `GET /api/subjects` - Get available subjects with question counts

### Analytics
- `POST /api/track-answer` - Track a user's answer
  ```json
  {
    "user_id": 1,
    "question_id": 123,
    "user_answer": "A",
    "time_spent_seconds": 45
  }
  ```
- `GET /api/analytics/{user_id}` - Get comprehensive analytics
- `GET /api/analytics/{user_id}/recent` - Get recent performance trends

### AI Feedback
- `GET /api/ai-feedback/{user_id}` - Get personalized AI feedback
- `GET /api/ai-feedback/{user_id}/subject/{subject}` - Get subject-specific feedback

## Usage

1. **Set User ID**: Enter a user ID to track your progress (stored in browser localStorage)
2. **Answer Questions**: Select answers and click "Check Answer"
3. **View Progress**: Check the Progress Dashboard for analytics and feedback
4. **Get Feedback**: Switch to the "AI Feedback" tab for personalized recommendations

## Database Schema

### user_answers Table

```sql
CREATE TABLE user_answers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    question_id INTEGER NOT NULL,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    subject TEXT NOT NULL,
    difficulty TEXT,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Notes

- The AI feedback feature is optional. The system works perfectly without it using rule-based feedback.
- User IDs are stored locally in the browser. For production, consider implementing proper authentication.
- The system identifies "weak areas" as subjects with accuracy below 70% (with at least 5 questions attempted).

