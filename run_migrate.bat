@echo off
call C:\Users\Admin\bottlebrothers_lab-3\venv\Scripts\activate.bat
cd /d C:\Users\Admin\bottlebrothers_lab-3\server
python manage.py migrate
echo.
echo Migration completed!
pause
