#!/bin/bash
echo "╔════════════════════════════════════════╗"
echo "║     EventX Backend Setup & Start       ║"
echo "╚════════════════════════════════════════╝"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate || source venv/Scripts/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt -q

# Start server
echo ""
echo "✅ Starting FastAPI server on http://localhost:8000"
echo "📚 API Docs at http://localhost:8000/docs"
echo ""
uvicorn main:app --reload --host 0.0.0.0 --port 8000
