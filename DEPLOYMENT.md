# Deployment Guide - Deploying to Render.com

Your ACT Study Website is already configured for deployment on **Render.com** (free tier). Here's how to get it live:

## Quick Deploy Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy Backend to Render
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `act-study-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**: Add `SECRET_KEY` (generate one with `openssl rand -hex 32`)

### 3. Deploy Frontend to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Set root directory to `frontend`
5. Add environment variable: `REACT_APP_API_URL` = your backend URL from Render
6. Deploy!

## Environment Variables Needed

### Backend (Render)
| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT secret (generate with `openssl rand -hex 32`) |
| `DATABASE_URL` | PostgreSQL connection string (optional, uses SQLite by default) |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Your Render backend URL (e.g., `https://act-study-backend.onrender.com/api`) |

## Your Project is Already Configured

The backend CORS already allows:
- `http://localhost:3000` (local development)
- `https://actstudywebsite.onrender.com` (Render deployment)

## API Endpoints (Once Deployed)
- Backend URL: `https://your-render-service.onrender.com`
- Register: `POST {URL}/api/auth/register`
- Login: `POST {URL}/api/auth/login`
- Questions: `GET {URL}/api/questions`


