# 🚀 Quick Deployment Guide - Studygroup

## Fastest Deployment: Railway + Vercel (15 minutes)

This guide will get your app live in under 15 minutes using free tiers.

---

## 📦 **Part 1: Deploy Backend (AI Service) to Railway**

### Step 1: Prepare Your Backend
First, make sure you have a `requirements.txt` in your `studygroup-ai-service` folder.

### Step 2: Sign Up & Deploy
1. Go to **[railway.app](https://railway.app)**
2. Click **"Login"** → Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your **Studygroup** repository
6. Railway will detect it's a Python app

### Step 3: Configure Root Directory
1. In Railway dashboard, go to **Settings**
2. Find **"Root Directory"**
3. Set it to: `studygroup-ai-service`
4. Click **"Save"**

### Step 4: Add Environment Variables
1. In Railway, click on your service
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add these one by one:

```
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
GOOGLE_API_KEY=your_google_api_key_here
VECTOR_STORE_PATH=/app/vector_stores
LOG_LEVEL=INFO
CACHE_ENABLED=true
```

**Where to find these values:**
- **SUPABASE_URL**: Supabase Dashboard → Settings → API → Project URL
- **SUPABASE_SERVICE_KEY**: Supabase Dashboard → Settings → API → service_role key (keep secret!)
- **GOOGLE_API_KEY**: Google AI Studio → Get API Key

### Step 5: Deploy!
1. Railway will automatically deploy after you add variables
2. Wait 2-3 minutes for deployment
3. Go to **"Settings"** → **"Networking"** → **"Generate Domain"**
4. Copy your Railway URL (e.g., `https://studygroup-ai-production.up.railway.app`)
5. **SAVE THIS URL** - you'll need it for the frontend!

### Step 6: Test Your Backend
Open your Railway URL in a browser and add `/health`:
```
https://your-app.railway.app/health
```

You should see:
```json
{
  "status": "healthy",
  "supabase_connected": true,
  "gemini_configured": true
}
```

---

## 🎨 **Part 2: Deploy Frontend (Next.js) to Vercel**

### Step 1: Sign Up & Import
1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Sign Up"** → Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Find and select your **Studygroup** repository
5. Click **"Import"**

### Step 2: Configure Project
1. **Framework Preset**: Should auto-detect "Next.js" ✓
2. **Root Directory**: Click "Edit" and select `Studygroup` (or leave as root if your Next.js is in root)
3. **Build Command**: Leave default (`npm run build`)
4. **Output Directory**: Leave default (`.next`)

### Step 3: Add Environment Variables
Click **"Environment Variables"** and add these:

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_AI_SERVICE_URL=https://your-railway-url.railway.app
```

**Optional (if you have these):**
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Where to find these:**
- **NEXT_PUBLIC_SUPABASE_URL**: Same as backend
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase → Settings → API → `anon` key (public, safe to expose)
- **NEXT_PUBLIC_AI_SERVICE_URL**: The Railway URL you saved earlier
- **SUPABASE_SERVICE_ROLE_KEY**: Only if your Next.js server actions need it

### Step 4: Deploy!
1. Click **"Deploy"**
2. Wait 1-2 minutes
3. Vercel will give you a URL like: `https://studygroup-xyz.vercel.app`

### Step 5: Update CORS in Backend
⚠️ **IMPORTANT:** Your backend needs to allow requests from your Vercel URL!

1. Go back to **Railway**
2. Click on your service → **"Variables"**
3. Add a new variable:
```
ALLOWED_ORIGINS=https://studygroup-xyz.vercel.app,http://localhost:3000
```

Then update your `main.py` CORS settings:

```python
# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

4. Railway will auto-redeploy with the new settings

---

## ✅ **Part 3: Test Your Deployment**

### Test the Full Flow:
1. Open your Vercel URL: `https://studygroup-xyz.vercel.app`
2. Sign up or log in
3. Create a class
4. Upload a document
5. Ask the AI a question

### Common Issues:

**❌ CORS Error**
- Make sure you added your Vercel URL to `ALLOWED_ORIGINS` in Railway
- Format: `https://your-app.vercel.app` (no trailing slash)

**❌ AI Not Responding**
- Check `NEXT_PUBLIC_AI_SERVICE_URL` in Vercel env vars
- Make sure it points to your Railway URL
- Test Railway health endpoint: `https://your-railway-url.railway.app/health`

**❌ Authentication Not Working**
- Check Supabase → Authentication → URL Configuration
- Add your Vercel URL to **Site URL** and **Redirect URLs**

---

## 🔄 **Auto-Deploy on Git Push**

Both Railway and Vercel are now watching your GitHub repo!

**To deploy updates:**
```bash
git add .
git commit -m "Update feature"
git push
```

- **Railway** will redeploy backend automatically
- **Vercel** will redeploy frontend automatically

---

## 💰 **Pricing (Free Tiers)**

### Railway:
- **$5 free credit/month**
- ~550 hours of compute
- Perfect for small projects

### Vercel:
- **100 GB bandwidth/month**
- Unlimited deployments
- Perfect for Next.js

---

## 🎯 **Alternative: Deploy Both to Render**

If you prefer one platform for everything:

### Backend on Render:
1. Go to **[render.com](https://render.com)**
2. **New +** → **Web Service**
3. Connect GitHub → Select repo
4. Settings:
   - **Root Directory**: `studygroup-ai-service`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add same environment variables as Railway
6. Click **"Create Web Service"**

### Frontend on Render:
1. **New +** → **Static Site**
2. Connect GitHub → Select repo
3. Settings:
   - **Root Directory**: `Studygroup`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `.next`
4. Add environment variables
5. Click **"Create Static Site"**

---

## 📝 **Deployment Checklist**

- [ ] Backend deployed to Railway/Render
- [ ] Backend health check returns `200 OK`
- [ ] Frontend deployed to Vercel
- [ ] Environment variables added to both
- [ ] CORS configured with frontend URL
- [ ] Supabase redirect URLs updated
- [ ] Test: Create class → Upload doc → Ask AI question
- [ ] (Optional) Custom domain configured

---

## 🆘 **Need Help?**

**Check logs:**
- **Railway**: Service → "Logs" tab
- **Vercel**: Deployment → "Logs" tab

**Test endpoints:**
```bash
# Backend health check
curl https://your-railway-url.railway.app/health

# Frontend
curl https://your-vercel-url.vercel.app
```

---

## 🎉 **You're Live!**

Your app is now deployed and accessible worldwide. Share your Vercel URL with users!

**Next Steps:**
- Add a custom domain (both platforms support this)
- Set up monitoring (Railway/Vercel have built-in analytics)
- Enable preview deployments for PRs (automatic on both platforms)
