@echo off
echo ========================================
echo Fixing database and starting server...
echo ========================================
echo.

call C:\Users\Admin\bottlebrothers_lab-3\venv\Scripts\activate.bat
cd /d C:\Users\Admin\bottlebrothers_lab-3\server

echo Step 1: Fixing database columns...
python fix_database.py
if errorlevel 1 (
    echo.
    echo ERROR: Database fix failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Starting Django server...
echo.
python manage.py runserver 8000
