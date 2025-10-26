# Study Group - Intelligent Study Hub with AI-Powered RAG

![Study Group Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Ready-3ecf8e)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688)

**An intelligent, private study hub for college classes** — featuring a beautiful dark-themed UI with **AI-powered document Q&A using RAG (Retrieval-Augmented Generation)** and full Supabase backend integration.

---

## 👨‍⚖️ **FOR JUDGES: Start Here!**

**📋 Quick Reference Guide:** [`JUDGES_QUICK_REFERENCE.md`](./JUDGES_QUICK_REFERENCE.md) - Streamlined setup with troubleshooting cheatsheet

**✅ Setup Checklist:** [`SETUP_CHECKLIST.md`](./SETUP_CHECKLIST.md) - Print this out for a smooth demo!

Want the full details? Continue reading below for comprehensive setup instructions.

---

## 🚀 Quick Start for Judges (30 minutes)

This guide will get both the Next.js frontend and Python AI service running smoothly.

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Supabase Account** ([Sign up free](https://supabase.com))
- **Google Gemini API Key** ([Get free key](https://aistudio.google.com/app/apikey))

### Step 1: Frontend Setup (15 minutes)

1. **Install Node.js dependencies**
   ```bash
   cd Studygroup
   npm install
   ```

2. **Configure Frontend Environment**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env.local
   
   # Mac/Linux
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add:
   ```env
   # Supabase Configuration (from your Supabase dashboard)
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # AI Service URL (keep as is)
   AI_SERVICE_URL=http://localhost:8000
   ```

3. **Start the Frontend**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at [http://localhost:3000](http://localhost:3000)

### Step 2: AI Service Setup (15 minutes)

1. **Navigate to AI Service Directory**
   ```bash
   # From the Studygroup folder
   cd ../studygroup-ai-service
   ```

2. **Create Python Virtual Environment**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   
   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   
   This will install:
   - FastAPI (web framework)
   - LangChain (RAG orchestration)
   - Google Generative AI (Gemini LLM)
   - FAISS (vector store)
   - Supabase client
   - Document processors (PDF, DOCX, PPTX)

4. **Configure AI Service Environment**
   
   Copy `.env.example` to `.env`:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   
   # Mac/Linux
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   # Supabase (same as frontend)
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   
   # Google Gemini API
   GOOGLE_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash
   
   # App Configuration
   VECTOR_STORE_PATH=./vector_stores
   CACHE_ENABLED=true
   LOG_LEVEL=INFO
   ```

5. **Start the AI Service**
   ```bash
   python main.py
   ```
   
   AI Service will be available at [http://localhost:8000](http://localhost:8000)
   
   Verify it's working by visiting [http://localhost:8000/health](http://localhost:8000/health)

### Step 3: Verify Everything is Running

**Quick Verification Script:**

Run the automated verification script:

```bash
# Windows PowerShell
.\verify-setup.ps1

# Mac/Linux
chmod +x verify-setup.sh
./verify-setup.sh
```

This will check:
- Node.js and Python installed
- Environment files configured
- Dependencies installed
- Services running on correct ports

**Manual Verification:**

Open two terminal windows:

**Terminal 1 - Frontend (Port 3000):**
```bash
cd Studygroup
npm run dev
```

**Terminal 2 - AI Service (Port 8000):**
```bash
cd studygroup-ai-service
# Windows: .\venv\Scripts\Activate.ps1
# Mac/Linux: source venv/bin/activate
python main.py
```

**✅ Success Indicators:**
- Frontend: `Ready on http://localhost:3000`
- AI Service: `Application startup complete` and `Uvicorn running on http://0.0.0.0:8000`

---

## 🛠️ Common Troubleshooting

### Frontend Issues

#### ❌ Error: "Module not found" or "Cannot find module"
**Solution:** Delete `node_modules` and reinstall
```bash
rm -rf node_modules .next
npm install
npm run dev
```

#### ❌ Error: "Port 3000 is already in use"
**Solution:** Kill the process on port 3000
```bash
# Windows PowerShell
Get-Process node | Stop-Process -Force

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

#### ❌ Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Solution:** Make sure `.env.local` exists and contains valid Supabase credentials
```bash
# Check if file exists
ls .env.local

# Verify it's not empty
cat .env.local
```

#### ❌ Build Error: Type errors or compilation failures
**Solution:** Clear Next.js cache
```bash
rm -rf .next
npm run dev
```

### AI Service Issues

#### ❌ Error: "No module named 'supabase'" or import errors
**Solution:** Ensure virtual environment is activated and dependencies are installed
```bash
# Activate venv first
# Windows: .\venv\Scripts\Activate.ps1
# Mac/Linux: source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### ❌ Error: "Address already in use" (Port 8000)
**Solution:** Kill the process on port 8000
```bash
# Windows PowerShell
$process = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
if ($process) { Stop-Process -Id $process -Force }

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

#### ❌ Error: "GOOGLE_API_KEY is not set"
**Solution:** Make sure `.env` file exists in `studygroup-ai-service` directory
```bash
# Check if file exists
ls .env

# Verify GOOGLE_API_KEY is set
cat .env | grep GOOGLE_API_KEY
```

#### ❌ Error: "Supabase connection failed"
**Solution:** Verify your Supabase credentials
1. Go to Supabase Dashboard → Project Settings → API
2. Copy the correct `URL` and `service_role` key (not anon key for AI service)
3. Update `.env` file with correct values

#### ❌ Error: "Failed to load vector store" or FAISS errors
**Solution:** Clear vector store cache
```bash
# From studygroup-ai-service directory
rm -rf vector_stores
mkdir vector_stores
python main.py
```

### Database/Supabase Issues

#### ❌ Error: "relation 'profiles' does not exist"
**Solution:** Run database migrations
1. Open Supabase Dashboard → SQL Editor
2. Copy SQL schema from `lib/supabase/README.md`
3. Execute in SQL Editor

#### ❌ Error: "JWT expired" or authentication errors
**Solution:** Refresh Supabase session
1. Clear browser cookies/localStorage
2. Log out and log back in
3. Restart frontend dev server

### Python Environment Issues

#### ❌ Error: "python: command not found"
**Solution:** Use `python3` instead of `python` (Mac/Linux)
```bash
python3 -m venv venv
python3 main.py
```

#### ❌ Error: PowerShell execution policy error
**Solution:** Enable script execution (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### ❌ Virtual environment not activating
**Solution:** Try alternative activation methods
```bash
# Windows - Try these in order
.\venv\Scripts\Activate.ps1
.\venv\Scripts\activate.bat
venv\Scripts\python.exe main.py

# Mac/Linux
source venv/bin/activate
./venv/bin/python main.py
```

---

## 🎯 Features

### Design & UI
- **Dark-first theme** with radial indigo→violet gradient backgrounds
- **Glass morphism** panels with backdrop blur effects
- **Neon glow accents** (electric cyan/violet) on interactive elements
- **Smooth animations** powered by Framer Motion
- **Responsive 3-panel layout** with collapsible sidebars
- **Accessibility-first** with keyboard navigation, ARIA labels, and focus management

### Core Functionality
- **AI-Powered Q&A** - Ask questions about your class documents using RAG
- **Custom AI Prompts** - Configure AI personality per class
- **Document Management** - Upload PDFs, DOCX, PPTX with full-text extraction
- **Class Management** - Create classes, generate join codes, manage rosters
- **Dashboard** - Hero search, action tiles, and recent documents grid
- **Timeline View** - Upcoming assignments and deadlines
- **Persistent UI State** - Sidebar preferences, view modes saved via Zustand

### Tech Stack
**Frontend:**
- Next.js 14.2 (App Router) + TypeScript
- Tailwind CSS with custom design tokens
- shadcn/ui (Radix UI primitives)
- Framer Motion for animations
- Supabase for auth, database, and storage

**AI Service:**
- FastAPI (Python web framework)
- LangChain (RAG orchestration)
- Google Gemini 1.5 Flash (LLM)
- FAISS (vector embeddings store)
- Sentence Transformers (document embeddings)
- Document processors (PyPDF, python-docx, python-pptx)

---

## 📁 Project Structure

```
Studygroup/                    # Frontend (Next.js)
├── app/                       # Next.js app router
│   ├── (dashboard)/          # Dashboard pages
│   ├── actions/              # Server actions
│   ├── api/                  # API routes
│   └── auth/                 # Auth pages
├── components/               # React components
│   ├── ai/                   # AI chat components
│   ├── classes/              # Class management
│   └── ui/                   # shadcn/ui components
├── lib/supabase/             # Supabase clients & utilities
├── .env.local                # Frontend environment variables
└── package.json

studygroup-ai-service/        # AI Backend (Python)
├── rag/                      # RAG implementation
│   ├── chain.py             # LangChain RAG pipeline
│   ├── document_loader.py   # PDF/DOCX processors
│   └── vector_store.py      # FAISS vector store
├── supabase_client.py        # Supabase integration
├── main.py                   # FastAPI app
├── .env                      # AI service environment variables
└── requirements.txt          # Python dependencies
```

---

## 🔧 Advanced Configuration

### Database Schema

The app uses the following Supabase tables:
- **profiles** - User profiles extending Supabase Auth
- **classes** - Class information and settings
- **documents** - File metadata and extracted text
- **enrollments** - User-class relationships
- **chat_history** - AI conversation logs

Full schema available in `lib/supabase/README.md`

### AI Configuration

Customize AI behavior in `studygroup-ai-service/.env`:
```env
GEMINI_MODEL=gemini-1.5-flash    # Or gemini-1.5-pro for better quality
LLM_TEMPERATURE=0.7              # 0.0 = deterministic, 1.0 = creative
MAX_TOKENS=500                   # Response length limit
CACHE_ENABLED=true               # Cache vector stores for faster queries
```

---

## 📚 Additional Documentation

- **`QUICK_START.md`** - Detailed setup walkthrough
- **`SUPABASE_SETUP.md`** - Complete Supabase configuration
- **`AI_SERVICE_README.md`** - AI service architecture
- **`TESTING_GUIDE_CUSTOM_PROMPTS.md`** - Custom prompt examples

---

## 🎓 How to Demo the App

1. **Create a class** - Go to Classes → Create Class
2. **Upload documents** - Upload PDFs, DOCX, or PPTX files
3. **Configure AI** - Optionally set a custom system prompt
4. **Ask questions** - Click the floating chat button and ask about your documents
5. **View sources** - AI responses include document citations

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure both services are running on correct ports (3000 and 8000)
4. Check terminal output for specific error messages

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE)

## 🚀 Getting Supabase Credentials

### Where to Find Your Supabase Keys

1. **Create a Supabase Project** (if you haven't):
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name it "studygroup"
   - Choose a password and region
   - Wait ~2 minutes for setup

2. **Get Your API Credentials**:
   - In Supabase Dashboard → Settings → API
   - Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy **anon public** key (for frontend `.env.local`)
   - Copy **service_role** key (for AI service `.env`)

3. **Set Up Database**:
   - Go to SQL Editor in Supabase
   - Copy the schema from `lib/supabase/README.md`
   - Run the SQL to create tables

### Where to Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)
4. Paste into AI service `.env` file

---

## 🎥 Video Demo

Check out our demo showcasing:
- Creating classes and uploading documents
- AI-powered Q&A with document citations
- Custom system prompts for different teaching styles
- Real-time document processing and retrieval

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │   Next.js Frontend (Port 3000)                  │   │
│  │   - Beautiful UI with Tailwind CSS              │   │
│  │   - React Components + TypeScript               │   │
│  │   - Client-side Supabase for Auth & DB          │   │
│  └───────────────┬─────────────────────────────────┘   │
└────────────────┼───────────────────────────────────────┘
                 │
                 │ HTTP Requests
                 │
    ┌────────────▼─────────────────────────────────────┐
    │   Python AI Service (Port 8000)                  │
    │   ┌──────────────────────────────────────────┐  │
    │   │  FastAPI Web Server                      │  │
    │   │  - Receives questions from frontend      │  │
    │   │  - Manages RAG pipeline                  │  │
    │   └──────────────┬───────────────────────────┘  │
    │                  │                               │
    │   ┌──────────────▼───────────────────────────┐  │
    │   │  RAG Pipeline                            │  │
    │   │  1. Fetch docs from Supabase            │  │
    │   │  2. Extract text (PDF/DOCX/PPTX)        │  │
    │   │  3. Create embeddings                   │  │
    │   │  4. Store in FAISS vector DB            │  │
    │   │  5. Retrieve relevant chunks            │  │
    │   │  6. Send to Gemini LLM                  │  │
    │   │  7. Return answer + sources             │  │
    │   └──────────────────────────────────────────┘  │
    └──────────────────────────────────────────────────┘
                     │
                     │ Supabase Client
                     │
    ┌────────────────▼──────────────────────────────────┐
    │         Supabase (Cloud)                          │
    │  ┌────────────────┐  ┌────────────────────────┐  │
    │  │   PostgreSQL   │  │   Storage Bucket       │  │
    │  │   - Classes    │  │   - PDF files          │  │
    │  │   - Documents  │  │   - DOCX files         │  │
    │  │   - Users      │  │   - PPTX files         │  │
    │  └────────────────┘  └────────────────────────┘  │
    └───────────────────────────────────────────────────┘
```

---

## 🧪 Testing the Setup

After starting both services, test the integration:

1. **Health Checks**:
   ```bash
   # Test frontend
   curl http://localhost:3000
   
   # Test AI service
   curl http://localhost:8000/health
   ```

2. **Create a Test Class**:
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Click "Classes" → "Create Class"
   - Fill in class details
   - Upload a sample PDF

3. **Test AI Chat**:
   - Click the floating chat button (bottom right)
   - Select your class
   - Ask: "What is this document about?"
   - You should get an AI response with sources!

---

## 📚 Additional Resources

- **Full Documentation**: See `QUICK_START.md` for detailed walkthrough
- **Supabase Setup**: See `SUPABASE_SETUP.md` for database configuration
- **AI Service Details**: See `../studygroup-ai-service/README.md`
- **Custom Prompts**: See `TESTING_GUIDE_CUSTOM_PROMPTS.md`
- **System Architecture**: See `ARCHITECTURE.md` for detailed technical overview

---

## 💡 Tips for Judges

1. **If something doesn't work**, check the terminal output for both services
2. **Most issues are environment variables** - double-check all keys are set
3. **Vector store is cached** - first query per class may take 10-20 seconds
4. **Upload different file types** - PDF, DOCX, and PPTX are all supported
5. **Try custom prompts** - Make the AI respond as a stern professor or friendly tutor!

---

## 🐛 Known Issues & Solutions

### Issue: "Supabase SSL error on Windows"
**Solution**: Add `--no-check-certificate` flag or update Python to latest version

### Issue: "FAISS installation fails"
**Solution**: Use pre-built wheels:
```bash
pip install faiss-cpu --no-cache-dir
```

### Issue: "Documents not indexing"
**Solution**: Check file permissions on `vector_stores` directory:
```bash
mkdir -p vector_stores
chmod 755 vector_stores
```

---

## 📄 License

MIT License - feel free to use this project for learning and development!
