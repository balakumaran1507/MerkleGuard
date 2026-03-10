#!/bin/bash

# Function to clean up background processes on exit
cleanup() {
    echo -e "\nStopping MerkleGuard..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

echo "Starting MerkleGuard Backend..."
cd backend
# Check if venv exists and activate it
if [ -d "venv" ]; then
    source venv/bin/activate
fi
python main.py &
BACKEND_PID=$!

echo "Starting MerkleGuard Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "========================================="
echo "MerkleGuard is running!"
echo "Frontend: http://localhost:5288"
echo "Backend:  http://localhost:8288"
echo "Press Ctrl+C to stop both servers."
echo "========================================="

# Wait for background processes to keep script running
wait $BACKEND_PID $FRONTEND_PID
