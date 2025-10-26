# 🔐 Environment Variables Reference

## Backend (Railway/Render) - `studygroup-ai-service`

Copy these into your Railway or Render dashboard:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google AI Configuration
GOOGLE_API_KEY=AIzaSyD...

# Application Settings
VECTOR_STORE_PATH=/app/vector_stores
LOG_LEVEL=INFO
CACHE_ENABLED=true

# CORS (Add your Vercel URL after deployment)
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

---

## Frontend (Vercel) - `Studygroup`

Copy these into your Vercel project settings → Environment Variables:

```bash
# Supabase Configuration (Public - Safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API (Add your Railway URL after deployment)
NEXT_PUBLIC_AI_SERVICE_URL=https://your-app.railway.app

# Optional: Server-side only (if needed)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📍 Where to Find These Values

### Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**

You'll see:
- **Project URL** → Use as `SUPABASE_URL`
- **anon public** key → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → Use as `SUPABASE_SERVICE_KEY` (⚠️ Keep secret!)

### Google AI Studio
1. Go to https://aistudio.google.com/
2. Click **Get API Key**
3. Create or select a project
4. Copy the API key → Use as `GOOGLE_API_KEY`

### Railway/Render URLs
- Deploy your backend first
- Copy the generated URL from Railway/Render dashboard
- Use as `NEXT_PUBLIC_AI_SERVICE_URL` in Vercel

### Vercel URL
- Deploy your frontend to Vercel
- Copy the deployment URL (e.g., `https://studygroup-abc.vercel.app`)
- Add to `ALLOWED_ORIGINS` in Railway/Render

---

## ⚠️ Important Security Notes

### ❌ NEVER expose these in frontend:
- `SUPABASE_SERVICE_KEY` (full database access)
- `GOOGLE_API_KEY` (can rack up charges)
- Any key without `NEXT_PUBLIC_` prefix

### ✅ Safe to expose (have `NEXT_PUBLIC_` prefix):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_AI_SERVICE_URL`

### 🔒 RLS (Row Level Security) in Supabase
Make sure you have RLS enabled on your Supabase tables:
- Users can only see their own data
- The `anon` key is safe because RLS protects your data
- The `service_role` key bypasses RLS (keep server-side only!)

---

## 🔄 Updating Environment Variables

### Railway:
1. Go to your service
2. Click **"Variables"** tab
3. Click the variable to edit
4. Save → Auto-redeploys

### Vercel:
1. Go to your project
2. **Settings** → **Environment Variables**
3. Edit and save
4. **Important:** Click **"Redeploy"** on your latest deployment for changes to take effect

### Render:
1. Go to your service
2. Click **"Environment"** tab
3. Edit variables
4. Click **"Save Changes"** → Auto-redeploys

---

## 🧪 Testing Your Configuration

### Test Backend:
```bash
curl https://your-railway-url.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "supabase_connected": true,
  "gemini_configured": true,
  "vector_store_path": "/app/vector_stores"
}
```

### Test Frontend:
Open browser console on your Vercel app and check:
```javascript
console.log(process.env.NEXT_PUBLIC_AI_SERVICE_URL)
// Should show your Railway URL
```

---

## 📋 Quick Copy-Paste Template

### For Railway (Backend):
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GOOGLE_API_KEY=
VECTOR_STORE_PATH=/app/vector_stores
LOG_LEVEL=INFO
CACHE_ENABLED=true
ALLOWED_ORIGINS=http://localhost:3000
```

### For Vercel (Frontend):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_AI_SERVICE_URL=
```

Fill in the `=` signs with your actual values!
