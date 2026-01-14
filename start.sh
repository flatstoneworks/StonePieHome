#!/bin/bash

# SparkHome startup script
# Starts both backend and frontend servers

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting SparkHome...${NC}"

# Start backend
echo -e "${GREEN}Starting backend on port 8021...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

python -m uvicorn app.main:app --host 0.0.0.0 --port 8021 &
BACKEND_PID=$!
cd ..

# Start frontend
echo -e "${GREEN}Starting frontend on port 8020...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "${BLUE}SparkHome started!${NC}"
echo -e "Frontend: http://spark.local:8020"
echo -e "Backend:  http://spark.local:8021"
echo -e "API Docs: http://spark.local:8021/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
