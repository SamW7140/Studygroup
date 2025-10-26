#!/bin/bash

# System Verification Script
# Run this to verify your setup is correct

echo "================================"
echo "Study Group - System Verification"
echo "================================"
echo ""

allGood=true

# Check Node.js
echo -n "Checking Node.js..."
if command -v node &> /dev/null; then
    nodeVersion=$(node --version)
    echo " ✓ $nodeVersion"
else
    echo " ✗ Not installed"
    allGood=false
fi

# Check Python
echo -n "Checking Python..."
if command -v python3 &> /dev/null; then
    pythonVersion=$(python3 --version)
    echo " ✓ $pythonVersion"
else
    echo " ✗ Not installed"
    allGood=false
fi

# Check Frontend .env.local
echo -n "Checking Frontend .env.local..."
if [ -f ".env.local" ]; then
    if grep -q "NEXT_PUBLIC_SUPABASE_URL=https://" .env.local && \
       grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=ey" .env.local; then
        echo " ✓ Configured"
    else
        echo " ✗ Missing keys"
        allGood=false
    fi
else
    echo " ✗ Not found"
    allGood=false
fi

# Check AI Service .env
echo -n "Checking AI Service .env..."
if [ -f "../studygroup-ai-service/.env" ]; then
    if grep -q "SUPABASE_URL=https://" ../studygroup-ai-service/.env && \
       grep -q "SUPABASE_SERVICE_KEY=ey" ../studygroup-ai-service/.env && \
       grep -q "GOOGLE_API_KEY=AIza" ../studygroup-ai-service/.env; then
        echo " ✓ Configured"
    else
        echo " ✗ Missing keys"
        allGood=false
    fi
else
    echo " ✗ Not found"
    allGood=false
fi

# Check node_modules
echo -n "Checking Frontend dependencies..."
if [ -d "node_modules" ]; then
    echo " ✓ Installed"
else
    echo " ✗ Run: npm install"
    allGood=false
fi

# Check AI Service venv
echo -n "Checking AI Service venv..."
if [ -d "../studygroup-ai-service/venv" ]; then
    echo " ✓ Created"
else
    echo " ✗ Run: python3 -m venv venv"
    allGood=false
fi

# Check if Frontend is running
echo -n "Checking Frontend (port 3000)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 2 &> /dev/null; then
    echo " ✓ Running"
else
    echo " ✗ Not running"
fi

# Check if AI Service is running
echo -n "Checking AI Service (port 8000)..."
response=$(curl -s http://localhost:8000/health --max-time 2 2> /dev/null)
if [ ! -z "$response" ] && echo "$response" | grep -q '"status":"healthy"'; then
    echo " ✓ Running & Healthy"
else
    echo " ✗ Not running"
fi

echo ""
echo "================================"

if [ "$allGood" = true ]; then
    echo "✓ All checks passed!"
    echo ""
    echo "Next steps:"
    echo "1. Start Frontend: npm run dev"
    echo "2. Start AI Service: cd ../studygroup-ai-service && source venv/bin/activate && python main.py"
else
    echo "⚠ Some issues found. Please fix them before proceeding."
    echo ""
    echo "Common fixes:"
    echo "- Install dependencies: npm install"
    echo "- Create .env files: cp .env.example .env.local"
    echo "- Create venv: cd ../studygroup-ai-service && python3 -m venv venv"
    echo "- Install Python packages: source venv/bin/activate && pip install -r requirements.txt"
fi

echo "================================"
