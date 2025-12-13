# Backend Setup & Testing Guide

## Overview

The backend is a **FastAPI** application with SQLite for local development. It provides:
- `/api/auth/register` — Sign up a new user
- `/api/auth/login` — Log in with username and password
- `/api/auth/me` — Get current authenticated user
- Other endpoints for questions, analytics, feedback, etc.

## Requirements

- Python 3.13+
- Virtual environment (already set up in `.venv`)
- Dependencies in `backend/requirements.txt` (already installed)

## Running the Backend

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Activate Virtual Environment (if not already active)
```bash
source ../.venv/bin/activate
```

### 3. Start the Development Server
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

The server will:
- Create a local SQLite database at `backend/app.db`
- Create the `users` table automatically
- Hot-reload when you change code

## Testing the Auth Endpoints

### Using curl

#### 1. Sign Up (Register)
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123",
    "full_name": "Test User",
    "username": "testuser"
  }'
```

Expected response:
```json
{
  "user": {
    "email": "testuser@example.com",
    "password": "TestPassword123",
    "full_name": "Test User",
    "username": "testuser"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Log In
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPassword123"
  }'
```

Expected response:
```json
{
  "user": {
    "email": "testuser@example.com",
    "full_name": "Test User",
    "username": "testuser"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Get Current User (Authenticated)
Save the access token from login, then:
```bash
curl -X GET http://127.0.0.1:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

Replace `YOUR_ACCESS_TOKEN_HERE` with the token from login.

Expected response:
```json
{
  "user": {
    "email": "testuser@example.com",
    "full_name": "Test User",
    "username": "testuser"
  }
}
```

### Using Python Requests

```python
import requests

BASE_URL = "http://127.0.0.1:8000/api"

# Sign up
signup_resp = requests.post(f"{BASE_URL}/auth/register", json={
    "email": "newuser@example.com",
    "password": "MyPassword123",
    "full_name": "New User",
    "username": "newuser"
})
print("Signup:", signup_resp.json())
token = signup_resp.json()["access_token"]

# Log in
login_resp = requests.post(f"{BASE_URL}/auth/login", json={
    "username": "newuser",
    "password": "MyPassword123"
})
print("Login:", login_resp.json())
token = login_resp.json()["access_token"]

# Get current user
me_resp = requests.get(f"{BASE_URL}/auth/me", headers={
    "Authorization": f"Bearer {token}"
})
print("Me:", me_resp.json())
```

## Database

- **Location**: `backend/app.db` (SQLite)
- **Created automatically** when the server starts
- **Reset**: Delete `app.db` and restart the server to create a fresh database

## Architecture

### Key Files
- `app/main.py` — FastAPI app definition, middleware setup
- `app/routes/auth.py` — Register, login, me endpoints
- `app/auth/jwt_handler.py` — JWT token creation/verification, password hashing
- `app/models/user.py` — User SQLAlchemy model
- `app/schemas.py` — Pydantic request/response schemas
- `app/local_db.py` — SQLite database setup (development only)

### Password Security
- Uses **PBKDF2-SHA256** for password hashing (in development)
- In production, switch to **bcrypt** (requires C extension; see `app/auth/jwt_handler.py` comment)

### JWT Tokens
- Algorithm: `HS256`
- Expiration: 30 days
- Secret key: From environment variable `SECRET_KEY` (default: `"your-secret-key-change-in-production"`)

## Connecting to the Frontend

The frontend (React) expects the API at `http://localhost:3000/api` by default. To point it at the backend:

### Option 1: Set Environment Variable
```bash
export REACT_APP_API_URL=http://127.0.0.1:8000/api
npm start
```

### Option 2: Modify `.env` in Frontend
Create `frontend/.env`:
```
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

Then start the frontend:
```bash
cd frontend
npm start
```

The frontend will open at `http://localhost:3000` and communicate with the backend API.

## Troubleshooting

### Port Already in Use
If port 8000 is in use, change it:
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

### Database Errors
Delete `backend/app.db` and restart the server to reset the database:
```bash
rm backend/app.db
```

### CORS Issues
The backend allows requests from:
- `http://localhost:3000` (frontend dev server)
- `https://actstudywebsite.onrender.com` (production)

To add more origins, edit `app/main.py` and update the CORS middleware.

## Next Steps

1. ✅ **Auth endpoints working** — Users can sign up, log in, and retrieve their info
2. Start the frontend and test the signup/login forms
3. Implement additional features (questions, analytics, AI feedback) as needed
