@echo off
REM ========================================
REM CTRG Grant System - Backend Startup Script (Windows)
REM ========================================
REM This script starts the Django development server
REM
REM Usage: start-backend.bat

echo ==========================================
echo CTRG Grant System - Starting Backend
echo ==========================================
echo.

REM Change to backend directory
cd /d "%~dp0backend"

REM Check if virtual environment exists
if not exist "venv" (
    echo X Virtual environment not found!
    echo.
    echo Please create a virtual environment first:
    echo   python -m venv venv
    echo   venv\Scripts\activate
    echo   pip install -r requirements.txt
    pause
    exit /b 1
)

REM Activate virtual environment
echo * Activating virtual environment...
call venv\Scripts\activate

REM Check if .env file exists
if not exist ".env" (
    echo ! Warning: .env file not found!
    echo.
    echo Copying .env.example to .env...
    copy .env.example .env
    echo * Created .env file
    echo.
    echo ! Please update .env with your configuration before running the server!
    pause
    exit /b 1
)

REM Run migrations
echo.
echo * Running database migrations...
python manage.py migrate --noinput

REM Setup initial data
echo.
echo * Setting up initial data...
python manage.py setup_initial_data --skip-admin 2>nul

REM Start the development server
echo.
echo ==========================================
echo * Starting Django development server...
echo ==========================================
echo.
echo Backend API: http://localhost:8000/api/
echo Admin Panel: http://localhost:8000/admin/
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver
