@echo off
echo Starting Django server...
call C:\Users\Admin\bottlebrothers_lab-3\venv\Scripts\activate.bat
cd /d C:\Users\Admin\bottlebrothers_lab-3\server
python manage.py runserver 8000
