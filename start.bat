@echo off
echo Starting AI Therapist...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Run the setup script if it hasn't been run before
if not exist "node_modules" (
    echo Running setup script...
    node setup.js
    if %ERRORLEVEL% neq 0 (
        echo Setup failed. Please check the error messages above.
        pause
        exit /b 1
    )
)

REM Start the application
echo Starting all services...
npm run start:all

pause 