# Implementation Plan: ACT Split-Pane Layout & Questions

## Completed Changes:

### 1. backend/scripts/seed_questions.py ✅
- Added 10+ realistic ACT-style questions
- 5 English passage-based questions (with underlined portion options in brackets)
- 5 Science data interpretation questions with tables
- 7 Math questions
- 3 Reading passage-based questions

### 2. frontend/src/pages/QuestionsPage.css ✅
- Added split-pane layout (two-column grid)
- Left panel: passage/data/figure
- Right panel: question + answer choices
- Responsive design for mobile
- Data table styling for science questions
- Smooth transitions and hover effects

### 3. frontend/src/pages/QuestionsPage.tsx ✅
- Implemented split-pane UI layout
- Parses passage-based questions automatically (detects "Passage:" prefix)
- Renders data tables for science questions
- Maintains all existing functionality

## Question Format:
- English: Passage with [A][B][C][D] markup for underlined portions
- Science: Data tables shown in left panel
- All: Two-column display with divider

## Summary of Changes:
- Split-pane layout for ACT-style questions
- Left panel: Reading passages, data tables, figures
- Right panel: Question text + answer choices
- Responsive design (collapses to single column on mobile)
- Clean, modern UI with dark theme

## To Test:
1. Start the backend: `cd backend && uvicorn app.main:app --reload`
2. Start the frontend: `cd frontend && npm start`
3. Navigate to /questions
4. See split-pane layout with sample questions

## Next Steps:
- OpenAI integration for generating more questions at scale
- Add more passage-based Reading questions
- Add Science passage questions with figures
