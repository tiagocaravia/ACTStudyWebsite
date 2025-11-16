# Tonight's Action Plan 🚀

## Priority 1: Get the System Working (30-45 min)

### ✅ Task 1: Set Up Database Table (10 min)
**Goal**: Create the `user_answers` table in Supabase

**Steps**:
1. Go to your Supabase dashboard: https://app.supabase.com
2. Open SQL Editor
3. Copy and paste the SQL from `backend/database_schema.sql`
4. Run the SQL to create the `user_answers` table
5. Verify: Check Table Editor → should see `user_answers` table

**Quick Check**:
```sql
SELECT COUNT(*) FROM user_answers;
-- Should return 0 (empty table is fine)
```

---

### ✅ Task 2: Add Sample Questions (15-20 min)
**Goal**: Add at least 10-15 questions so you can test the system

**Option A: Use the Import Script (Easiest)**
```bash
cd backend
# Make sure your API is running first
python scripts/import_sample_questions.py
```

**Option B: Use Admin API (More Control)**
```bash
# Add a math question
curl -X POST "http://localhost:8000/api/admin/questions" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "math",
    "question_text": "If 3x + 5 = 20, what is the value of x?",
    "choices": ["3", "5", "15", "25"],
    "correct_answer": "5",
    "explanation": "Subtract 5 from both sides: 3x = 15. Divide by 3: x = 5.",
    "difficulty": "easy"
  }'
```

**Option C: Direct Database Insert (Fastest for multiple)**
1. Go to Supabase → Table Editor → `questions`
2. Click "Insert" → "Insert row"
3. Fill in the fields manually
4. Repeat for 5-10 questions

**Recommended**: Start with 5 questions per subject (Math, English, Reading, Science) = 20 questions total

---

### ✅ Task 3: Test the Full Flow (10-15 min)
**Goal**: Verify everything works end-to-end

**Steps**:
1. **Start Backend** (if not running):
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start Frontend** (if not running):
   ```bash
   cd frontend
   npm start
   ```

3. **Test in Browser**:
   - Open http://localhost:3000
   - Set User ID (e.g., 1)
   - Answer 5-10 questions
   - Check "Check Answer" for each
   - View Progress Dashboard
   - Check Analytics tab
   - Check AI Feedback tab

4. **Verify Data is Being Tracked**:
   ```bash
   # Check if answers are being saved
   curl "http://localhost:8000/api/analytics/1"
   ```

---

## Priority 2: Enhance & Polish (30-60 min)

### ✅ Task 4: Add More Questions (20-30 min)
**Goal**: Build a usable question bank

**Quick Question Ideas**:
- **Math**: Basic algebra, geometry formulas, word problems
- **English**: Grammar rules, punctuation, sentence structure
- **Reading**: Create simple comprehension questions
- **Science**: Graph interpretation, basic scientific reasoning

**Tip**: Start with easy questions, then add medium/hard later

---

### ✅ Task 5: Test Analytics Features (10 min)
**Goal**: Verify analytics are working correctly

**Test Scenarios**:
1. Answer questions correctly → Check accuracy goes up
2. Answer questions incorrectly → Check weak areas appear
3. Answer questions in different subjects → Check subject breakdown
4. Answer 10+ questions → Check if feedback improves

**Check Endpoints**:
```bash
# Overall analytics
curl "http://localhost:8000/api/analytics/1"

# Recent performance
curl "http://localhost:8000/api/analytics/1/recent"

# AI Feedback
curl "http://localhost:8000/api/ai-feedback/1"
```

---

### ✅ Task 6: (Optional) Set Up OpenAI (10 min)
**Goal**: Enable AI-powered feedback

**Only if you want AI feedback**:
1. Get OpenAI API key: https://platform.openai.com/api-keys
2. Add to `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Install OpenAI:
   ```bash
   cd backend
   pip install openai
   ```
4. Restart backend
5. Test: Check if feedback shows "AI Generated" badge

**Note**: System works great without this - rule-based feedback is solid!

---

## Priority 3: Quick Wins (15-30 min)

### ✅ Task 7: Verify Question Counts (5 min)
```bash
curl "http://localhost:8000/api/admin/questions/count"
```

Should show counts for each subject.

---

### ✅ Task 8: Test Different Subjects (5 min)
- Filter by subject in frontend
- Verify questions change
- Check subject colors work

---

### ✅ Task 9: Test User ID Persistence (5 min)
- Set User ID
- Refresh page
- Verify User ID is still there (localStorage)
- Answer questions
- Check dashboard shows data

---

## 🎯 Success Criteria for Tonight

By the end of tonight, you should have:

- ✅ `user_answers` table created in Supabase
- ✅ At least 10-20 questions in the database
- ✅ System working end-to-end (answer → track → dashboard)
- ✅ Analytics showing performance data
- ✅ Feedback system working (rule-based or AI)
- ✅ Basic understanding of how everything connects

---

## 🚨 If You Get Stuck

### Database Issues?
- Check Supabase connection in `.env`
- Verify table exists in Supabase dashboard
- Check backend logs for errors

### Questions Not Showing?
- Verify questions exist: `curl "http://localhost:8000/api/questions?limit=5"`
- Check subject names match: "math", "english", "reading", "science"
- Check frontend API_URL matches backend

### Analytics Not Working?
- Make sure you're tracking answers (check backend logs)
- Verify user_id is set in frontend
- Check `user_answers` table has data in Supabase

---

## 📝 Quick Reference Commands

```bash
# Start backend
cd backend && uvicorn app.main:app --reload

# Start frontend  
cd frontend && npm start

# Check question count
curl "http://localhost:8000/api/admin/questions/count"

# Get questions
curl "http://localhost:8000/api/questions?limit=5"

# Check analytics (after answering questions)
curl "http://localhost:8000/api/analytics/1"

# Add a question
curl -X POST "http://localhost:8000/api/admin/questions" \
  -H "Content-Type: application/json" \
  -d '{"subject":"math","question_text":"Test?","choices":["A","B","C","D"],"correct_answer":"A","explanation":"Test","difficulty":"easy"}'
```

---

## 🎉 After Tonight

Once everything is working:
- Add more questions gradually
- Consider OpenAI for enhanced feedback
- Start thinking about authentication (if needed)
- Plan for production deployment

**Good luck! 🚀**

