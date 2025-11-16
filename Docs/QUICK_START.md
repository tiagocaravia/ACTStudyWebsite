# Quick Start: OpenAI & ACT Database Setup

## 🤖 Should You Add OpenAI API Key?

### ✅ **YES, if you want:**
- More personalized, natural-language feedback
- Context-aware study recommendations
- Better student engagement
- Professional AI-powered tutoring experience

### ❌ **NO, if:**
- You want to keep costs at $0
- Rule-based feedback is sufficient
- You're just testing the system

**Recommendation**: Start without it, then add it later if you want enhanced feedback. The system works great either way!

**Cost**: Very affordable (~$0.0005 per feedback request with GPT-3.5-turbo)

👉 See `OPENAI_SETUP.md` for detailed instructions

---

## 📚 Should You Add an ACT Database?

### ✅ **YES - You need this!**

Your system is already set up to pull from a Supabase `questions` table, but it needs to be populated with ACT questions.

### What You Need:

1. **Questions Table** (should exist in Supabase)
2. **Question Data** (you need to add this)

### Quick Setup Options:

#### Option 1: Use Admin API (Recommended)
```bash
# Add a question
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

#### Option 2: Use Import Script
```bash
cd backend
python scripts/import_sample_questions.py
```

#### Option 3: Direct Database Insert
- Go to Supabase Dashboard → Table Editor → questions
- Click "Insert" and add questions manually

### Where to Get Questions:

✅ **Legal Sources:**
- Official ACT practice tests (free from ACT.org)
- Public domain ACT questions
- Create your own ACT-style questions
- Educational licenses (check terms)

❌ **Avoid:**
- Scraping copyrighted content
- Using paid test prep questions without permission

👉 See `ACT_DATABASE_GUIDE.md` for complete instructions

---

## 🚀 Recommended Setup Order

1. **First**: Set up ACT Database (required for the app to work)
   - Add at least 10-20 sample questions to test
   - Use the admin API or import script

2. **Second**: Test the system
   - Answer some questions
   - Check the analytics dashboard
   - Verify feedback is working

3. **Third** (Optional): Add OpenAI API key
   - Only if you want AI-powered feedback
   - System works fine without it

---

## 📊 Check Your Setup

### Verify Questions Exist:
```bash
curl "http://localhost:8000/api/admin/questions/count"
```

### Test Question Retrieval:
```bash
curl "http://localhost:8000/api/questions?limit=5"
```

### Test Analytics (after answering questions):
```bash
curl "http://localhost:8000/api/analytics/1"
```

---

## ⚠️ Important Notes

1. **Admin Endpoints**: Currently unprotected. Add authentication before production!
2. **Copyright**: Only use questions you have rights to use
3. **Question Quality**: Start with a small set, verify they work, then scale up

---

## Need Help?

- **OpenAI Setup**: See `OPENAI_SETUP.md`
- **Database Setup**: See `ACT_DATABASE_GUIDE.md`
- **General Setup**: See `SETUP.md`

