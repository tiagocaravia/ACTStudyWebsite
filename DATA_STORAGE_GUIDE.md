# Data Storage & Authentication Guide

## 📍 Where Is All Your Data Stored?

### 1. **User Accounts** (SQLite Database)
- **Location**: `backend/app.db`
- **What's stored**: 
  - Email address
  - Username (optional)
  - Full name (optional)
  - Hashed password (never stored in plain text!)
  - Account creation date
  - Last update date

**Check your stored users:**
```bash
sqlite3 backend/app.db "SELECT id, email, username, full_name, created_at FROM users;"
```

### 2. **Login Session** (Browser LocalStorage)
- **Location**: Your browser's localStorage
- **What's stored**:
  - JWT authentication token (30-day expiration)
- **Accessed in browser**: Open DevTools (F12) → Application → Local Storage → `token`

### 3. **Frontend State** (Memory)
- **Location**: React Context (AuthContext.tsx)
- **What's stored**:
  - Current user object
  - Authentication token
  - Loading state
- **Cleared when**: Browser closed or you click logout

---

## 🔑 How Signup/Login Works

### Signup Flow

```
1. You fill in form:
   - Email (required) ← Your email address
   - Password (required) ← Your login password
   - Username (optional) ← Nickname for login
   - Full Name (optional) ← Your name
   
2. Backend receives data:
   ✓ Checks if email already registered
   ✓ Hashes password (PBKDF2-SHA256)
   ✓ Creates user in database
   ✓ Generates JWT token (valid 30 days)
   
3. Frontend receives response:
   ✓ Stores token in localStorage
   ✓ Stores user info in React state
   ✓ Redirects to /questions page
   
4. You are logged in! ✅
```

### Login Flow

```
1. You fill in form:
   - Email or Username (required)
   - Password (required)
   
2. Backend receives data:
   ✓ Looks up user by email OR username
   ✓ Compares password to hashed version in DB
   ✓ If match: generates JWT token
   ✓ If no match: returns "Invalid credentials" error
   
3. Frontend receives response:
   ✓ Stores token in localStorage
   ✓ Stores user info in React state
   ✓ Redirects to /questions page
   
4. You are logged in! ✅
```

---

## 🔐 Important Security Details

### Password Hashing
- Passwords are **NEVER** stored in plain text
- Each password is converted using PBKDF2-SHA256 before saving
- Example:
  - You type: `MyPassword123`
  - Stored as: `$pbkdf2-sha256$...long_encrypted_string...`
  - Only the hashed version is in the database
  - Even we can't see your password!

### JWT Tokens
- Token format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (really long)
- Contains: User ID and expiration date (encrypted)
- Valid for: 30 days
- Automatically cleared when you logout
- Can be revoked by deleting from localStorage

---

## 📝 Example: Create Account & Login

### Step 1: Sign Up
```
Email:    john.doe@gmail.com
Password: MySecurePass123
Username: johndoe (optional)
Full Name: John Doe (optional)
```

**Result**: Account created in `backend/app.db`

### Step 2: Try to Login
You can now login with **either**:

**Option A: Using Email**
```
Email or Username: john.doe@gmail.com
Password:          MySecurePass123
```

**Option B: Using Username**
```
Email or Username: johndoe
Password:          MySecurePass123
```

Both work! ✅

---

## 🗄️ Database Schema

```sql
CREATE TABLE users (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  email             VARCHAR UNIQUE NOT NULL,
  username          VARCHAR UNIQUE,
  full_name         VARCHAR,
  hashed_password   VARCHAR NOT NULL,
  target_score      INTEGER DEFAULT 30,
  current_level     VARCHAR DEFAULT 'beginner',
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Example row:**
```
id: 1
email: john.doe@gmail.com
username: johndoe
full_name: John Doe
hashed_password: $pbkdf2-sha256$29000$...
target_score: 30
current_level: beginner
created_at: 2025-12-13 12:45:00
updated_at: 2025-12-13 12:45:00
```

---

## 🔍 Verify Your Data

### Check if your email exists:
```bash
sqlite3 backend/app.db "SELECT * FROM users WHERE email = 'your.email@example.com';"
```

### Check all users:
```bash
sqlite3 backend/app.db "SELECT id, email, username, created_at FROM users;"
```

### Check your token (in browser):
```javascript
// Open browser console (F12)
console.log(localStorage.getItem('token'))
```

---

## 🔄 What Happens During Each Action

### When You Click "Sign Up"
1. ✅ Form validates (email required, password required)
2. ✅ Data sent to `POST /api/auth/register`
3. ✅ Backend checks if email exists
4. ✅ Backend creates user with hashed password
5. ✅ Token generated and returned
6. ✅ Token stored in localStorage
7. ✅ Redirected to `/questions` page

### When You Click "Login"
1. ✅ Form validates (email/username required, password required)
2. ✅ Data sent to `POST /api/auth/login`
3. ✅ Backend finds user by email or username
4. ✅ Backend verifies password matches hash
5. ✅ Token generated and returned (if password correct)
6. ✅ Token stored in localStorage
7. ✅ Redirected to `/questions` page

### When You Click "Logout"
1. ✅ Token removed from localStorage
2. ✅ User removed from React state
3. ✅ Redirected to `/login` page

### When You Refresh the Page
1. ✅ Browser checks localStorage for token
2. ✅ If token exists, sends `GET /api/auth/me` to verify it's valid
3. ✅ If valid, restores user info without re-logging in
4. ✅ If invalid, clears token and redirects to login

---

## ⚠️ Troubleshooting

### "Account not found" error
**Cause**: You're trying to login with the wrong email/username or the account wasn't created

**Fix**:
1. Check in database: `sqlite3 backend/app.db "SELECT * FROM users;"`
2. Make sure you're using the correct email or username
3. Create a new account if needed

### "Invalid credentials" error
**Cause**: Password is wrong

**Fix**:
1. Check that Caps Lock is off
2. Type password carefully
3. Create a new account with a simpler password to test

### Token not working after refresh
**Cause**: Token expired (older than 30 days) or was deleted

**Fix**:
1. Log out and log back in
2. New token will be generated

### Can't see website after login
**Cause**: Server might have crashed

**Fix**:
1. Check backend is still running: `curl http://127.0.0.1:8000/api/auth/me`
2. Restart if needed: `Ctrl+C` in backend terminal and run again

---

## 📊 Data Summary

| Data | Stored Where | How Long | Visible To |
|------|--------------|----------|-----------|
| Email/Password | SQLite DB | Forever | Only backend server |
| JWT Token | Browser localStorage | 30 days | Only your browser |
| User Info | React state | Session | Only while logged in |
| Hashed Password | SQLite DB | Forever | Never viewable |

---

## 🚀 Next Steps

Once signup/login is working:
1. Questions will be stored in database
2. Your answers will be tracked
3. Performance analytics will be calculated
4. AI feedback will be generated

All data stays in `backend/app.db` until you reset the database.

---

## 🆘 Need Help?

**Reset Everything:**
```bash
# Delete database
rm backend/app.db

# Restart backend
cd backend
python -m uvicorn app.main:app --reload

# Backend will create fresh database
```

**View Raw Database:**
```bash
sqlite3 backend/app.db
> SELECT * FROM users;
> .exit
```

---

**Your data is secure, encrypted, and stored locally! 🔒**
