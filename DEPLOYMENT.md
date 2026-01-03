# Deployment Guide - Getting Your ACT Study Website Live

## Quick Deploy Summary

1. **Deploy frontend to Vercel** (free)
2. **Deploy backend to Render** (free)
3. **Buy a .com domain** (~$8-12/year)
4. **Connect domain to your site**

---

## Step 1: Deploy Frontend to Vercel (Free)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `tiagocaravia/ACTStudyWebsite`
4. **Important settings:**
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Create React App`
5. **Environment Variables:**
   - Add: `REACT_APP_API_URL` = (leave blank for now, update after backend deployment)
6. Click **Deploy**

Your frontend will be live at: `https://act-study-website.vercel.app`

---

## Step 2: Deploy Backend to Render (Free)

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `act-study-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables:**
   - Add `SECRET_KEY`: Generate with `openssl rand -hex 32`
   - Add `DATABASE_URL`: (optional, uses SQLite by default)
6. Click **Create Web Service**

Your backend will be live at: `https://act-study-backend.onrender.com`

---

## Step 3: Update Frontend with Backend URL

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Edit `REACT_APP_API_URL`:
   - Value: `https://act-study-backend.onrender.com/api`
3. Redeploy to apply changes

---

## Step 4: Get a .com Domain

### Buy a Domain (~$8-12/year)

**Options:**
- **Namecheap.com** - Best prices, ~$8/year
- **GoDaddy.com** - Popular, ~$10/year
- **Google Domains** - Simple, ~$12/year

**Steps:**
1. Go to any registrar above
2. Search for your desired domain (e.g., `actstudy.com`, `actprep.com`)
3. Purchase and create account

### Connect Domain to Vercel (Recommended)

1. **Deploy to Vercel first** (already done in Step 1)
2. Go to Vercel Dashboard → Project → Settings → Domains
3. Click "Add Domain"
4. Enter your .com (e.g., `actstudy.com`)
5. Vercel will show DNS records to add
6. Go to your domain registrar's DNS settings
7. Add the records Vercel provides

### Alternative: Buy Domain Through Vercel

Vercel now sells domains directly:
1. Vercel Dashboard → Project → Settings → Domains
2. Click "Buy Domain"
3. Search and purchase
4. Domain auto-connects to your project

---

## Environment Variables Summary

### Backend (Render)
| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT secret (generate with `openssl rand -hex 32`) |
| `DATABASE_URL` | PostgreSQL (optional, SQLite by default) |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend URL + `/api` (e.g., `https://...onrender.com/api`) |

---

## API Endpoints (Once Deployed)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Sign up new user |
| `/api/auth/login` | POST | Login |
| `/api/auth/me` | GET | Get current user |
| `/api/questions` | GET | Get questions |

---

## Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| Render | 750 hours/month, 512MB RAM |
| Vercel | Unlimited deployments, 100GB bandwidth |
| Namecheap | .com from ~$8/year |

---

## Your Project is Already Configured

✅ Backend CORS allows frontend URLs
✅ `.env.production` file created for frontend
✅ Ready for production deployment

## After Deployment

1. Update `REACT_APP_API_URL` in Vercel with your backend URL
2. Test login/register at your live URL
3. Connect custom .com domain
