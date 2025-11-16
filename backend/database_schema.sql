-- SQL Schema for ACT Study Website Database
-- This schema should be created in your Supabase database

-- Table: questions (should already exist in Supabase)
-- This table stores ACT practice questions
-- CREATE TABLE questions (
--     id SERIAL PRIMARY KEY,
--     subject TEXT NOT NULL, -- 'math', 'english', 'reading', 'science'
--     question_text TEXT NOT NULL,
--     choices TEXT[] NOT NULL, -- Array of answer choices
--     correct_answer TEXT NOT NULL,
--     explanation TEXT,
--     difficulty TEXT, -- 'easy', 'medium', 'hard'
--     created_at TIMESTAMP DEFAULT NOW()
-- );

-- Table: user_answers
-- This table tracks user answers for analytics and AI feedback
CREATE TABLE IF NOT EXISTS user_answers (
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_subject ON user_answers(subject);
CREATE INDEX IF NOT EXISTS idx_user_answers_created_at ON user_answers(created_at);

-- Optional: Add foreign key constraint if questions table exists
-- ALTER TABLE user_answers 
-- ADD CONSTRAINT fk_question 
-- FOREIGN KEY (question_id) REFERENCES questions(id);

