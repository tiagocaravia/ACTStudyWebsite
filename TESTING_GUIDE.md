# Testing Guide - ACT Study Website

## ✅ System Status

Both servers are now running:
- **Backend**: `http://127.0.0.1:8000` ✅ (FastAPI + SQLite)
- **Frontend**: `http://localhost:3000` ✅ (React)

---

## 🧪 Test the Complete Flow

### Step 1: Create a New Account

1. Open browser: `http://localhost:3000`
2. Click **"Sign Up"** button on homepage
3. Fill in the form:
   - **Email**: `testuser@example.com`
   - **Full Name**: `Test User` (optional)
   - **Username**: `testuser123` (optional)
   - **Password**: `TestPassword123`
4. Click **"Sign Up"** button
5. **Expected Result**: 
   - ✅ No errors
   - ✅ No freeze
   - ✅ Redirected to `/questions` page

### Step 2: Verify Questions Page Loaded

- You should see the Questions page with the layout ready
- The page indicates you're authenticated (user data loaded)

### Step 3: Test Logout

- Click **"Logout"** button
- Should redirect to homepage

### Step 4: Test Login with Same Credentials

1. Click **"Log In"** on homepage
2. Fill in:
   - **Username**: `testuser123`
   - **Password**: `TestPassword123`
3. Click **"Log In"**
4. **Expected Result**:
   - ✅ Redirected to `/questions` page
   - ✅ Same user data displayed

### Step 5: Test Wrong Password

1. Go back to login page
2. Enter same username but wrong password: `WrongPassword`
3. **Expected Result**:
   - ❌ Error message displayed
   - ❌ Not redirected

---

## 📋 API Testing (Alternative)

If you want to test the backend API directly using curl:

### Register

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "Password123",
    "full_name": "API Tester",
    "username": "apitester"
  }'
```

**Expected Response**:
```json
{
  "user": {
    "email": "apitest@example.com",
    "password": "Password123",
    "full_name": "API Tester",
    "username": "apitester"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "apitester",
    "password": "Password123"
  }'
```

### Get Authenticated User

```bash
# Replace TOKEN with the access_token from login response
curl -X GET http://127.0.0.1:8000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔍 Troubleshooting

### Page won't load
- Check browser console (F12)
- Check backend logs in Terminal 1
- Check frontend logs in Terminal 2
- Verify both `http://127.0.0.1:8000` and `http://localhost:3000` are accessible

### Signup button freezes
- Check browser console for network errors
- Check backend logs for error messages
- Verify `.env` has correct `REACT_APP_API_URL=http://localhost:8000/api`

### Backend errors
- Check if port 8000 is still available
- Check `backend/app.db` exists (created on startup)
- Restart backend: Kill terminal and run again

### Frontend won't compile
- Delete `frontend/node_modules` and `frontend/package-lock.json`
- Run `npm install --prefix frontend`
- Run `npm start --prefix frontend`

---

## 📊 Database

To inspect the database directly:

```bash
# List all users
sqlite3 backend/app.db "SELECT id, email, username, created_at FROM users;"

# Delete a user (for testing)
sqlite3 backend/app.db "DELETE FROM users WHERE email = 'testuser@example.com';"

# Reset entire database
rm backend/app.db
# Restart backend - it will recreate the empty database
```

---

## ✨ Success Criteria

- [ ] Homepage loads with "Your ACT Score Determines Your College Options" message
- [ ] Sign Up button appears
- [ ] Can create account with email and password
- [ ] After signup, redirected to `/questions` page
- [ ] Can log out
- [ ] Can log back in with same credentials
- [ ] Wrong password shows error
- [ ] Token persists in localStorage (check DevTools > Application > Local Storage)

---

## 🎉 You're Done!

All the core authentication and routing is working! The next steps would be:

1. **Add ACT Questions** to the database
2. **Build the Questions Page** to display and answer questions
3. **Add AI Feedback** using OpenAI API
4. **Add Analytics** to track student progress

---

**Happy testing! 🚀**
