#!/bin/bash
# ========================================
# CTRG Grant System - Backend Startup Script (Mac/Linux)
# ========================================
# This script starts the Django development server
#
# Usage: ./start-backend.sh

echo "=========================================="
echo "CTRG Grant System - Starting Backend"
echo "=========================================="
echo ""

# Change to backend directory
cd "$(dirname "$0")/backend" || exit 1

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo ""
    echo "Please create a virtual environment first:"
    echo "  python -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "✓ Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import django" 2>/dev/null; then
    echo "❌ Dependencies not installed!"
    echo ""
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo ""
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo ""
    echo "⚠️  Please update .env with your configuration before running the server!"
    exit 1
fi

# Run migrations
echo ""
echo "✓ Running database migrations..."
python manage.py migrate --noinput

# Check if initial data exists
if ! python manage.py shell -c "from django.contrib.auth.models import Group; print(Group.objects.filter(name='SRC_Chair').exists())" | grep -q "True"; then
    echo ""
    echo "✓ Setting up initial data..."
    python manage.py setup_initial_data
fi

# Start the development server
echo ""
echo "=========================================="
echo "✓ Starting Django development server..."
echo "=========================================="
echo ""
echo "Backend API: http://localhost:8000/api/"
echo "Admin Panel: http://localhost:8000/admin/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python manage.py runserver 0.0.0.0:8000
