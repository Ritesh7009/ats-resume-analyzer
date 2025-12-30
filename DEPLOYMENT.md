# ATS Resume Analyzer - Free Deployment Guide

## Prerequisites
- GitHub account
- MongoDB Atlas account (free)
- Render account (free)
- Vercel account (free)

---

## Step 1: Set Up MongoDB Atlas (Free Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project
4. Create a **FREE** M0 cluster (Shared)
5. Create a database user:
   - Click "Database Access" → "Add New Database User"
   - Set username and password (save these!)
6. Allow network access:
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
7. Get connection string:
   - Click "Connect" → "Drivers"
   - Copy the connection string
   - Replace `<password>` with your password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ats-analyzer`

---

## Step 2: Push Code to GitHub

```bash
# Initialize git (if not already done)
cd ats-resume-analyzer
git init

# Create .gitignore
echo "node_modules/
.env
uploads/
dist/
build/
*.log" > .gitignore

# Add all files
git add .
git commit -m "Initial commit"

# Create repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/ats-resume-analyzer.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend on Render (Free)

1. Go to [Render](https://render.com) and sign up
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ats-resume-analyzer-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | NODE_ENV | production |
   | PORT | 5000 |
   | MONGODB_URI | (your MongoDB Atlas connection string) |
   | JWT_SECRET | (generate a random 32-char string) |
   | JWT_REFRESH_SECRET | (generate another random 32-char string) |
   | FRONTEND_URL | (your Vercel URL, add after deploying frontend) |
   | RAZORPAY_KEY_ID | (your Razorpay key) |
   | RAZORPAY_KEY_SECRET | (your Razorpay secret) |

6. Click **Create Web Service**
7. Wait for deployment (takes 5-10 minutes)
8. Copy your backend URL: `https://ats-resume-analyzer-api.onrender.com`

> ⚠️ **Note**: Free tier spins down after 15 minutes of inactivity. First request after idle may take 30-60 seconds.

---

## Step 4: Deploy Frontend on Vercel (Free)

1. Go to [Vercel](https://vercel.com) and sign up with GitHub
2. Click **Add New** → **Project**
3. Import your `ats-resume-analyzer` repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variable:
   | Key | Value |
   |-----|-------|
   | REACT_APP_API_URL | https://ats-resume-analyzer-api.onrender.com/api |

6. Click **Deploy**
7. Your frontend URL: `https://ats-resume-analyzer.vercel.app`

---

## Step 5: Update Backend with Frontend URL

1. Go back to Render dashboard
2. Navigate to your web service → Environment
3. Add/Update:
   - `FRONTEND_URL`: `https://ats-resume-analyzer.vercel.app`
4. Redeploy the service

---

## Step 6: Set Up Razorpay (Payment Gateway)

1. Go to [Razorpay](https://dashboard.razorpay.com)
2. Sign up and complete KYC
3. Go to Settings → API Keys
4. Generate test keys first
5. Add to Render environment:
   - `RAZORPAY_KEY_ID`: Your Key ID
   - `RAZORPAY_KEY_SECRET`: Your Key Secret

---

## 🎉 You're Done!

Your app is now live at:
- **Frontend**: `https://ats-resume-analyzer.vercel.app`
- **Backend API**: `https://ats-resume-analyzer-api.onrender.com`

---

## Alternative Free Platforms

### Backend Alternatives:
- **Railway** (railway.app) - $5 free credit/month
- **Fly.io** - Free tier with 3 VMs
- **Cyclic** (cyclic.sh) - Free Node.js hosting

### Frontend Alternatives:
- **Netlify** (netlify.com) - Free tier
- **Cloudflare Pages** - Free tier
- **GitHub Pages** - Free (static only)

---

## Troubleshooting

### Backend not connecting?
1. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
2. Verify MONGODB_URI is correct
3. Check Render logs for errors

### CORS errors?
1. Ensure FRONTEND_URL is set correctly in Render
2. Check backend CORS configuration

### Slow initial load?
- Free Render tier spins down after inactivity
- First request takes 30-60 seconds to "wake up"
- Consider upgrading to paid tier for always-on

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M0 (512MB) | **Free** |
| Render | Free tier | **Free** |
| Vercel | Hobby | **Free** |
| **Total** | | **$0/month** |

---

## Upgrade Options (When Ready)

- **Render Starter**: $7/month - Always on, no cold starts
- **MongoDB M2**: $9/month - 2GB storage
- **Vercel Pro**: $20/month - More bandwidth
