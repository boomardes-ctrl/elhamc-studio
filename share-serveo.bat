@echo off
title ELHAMC SHARE - SERVER
echo ========================================
echo     مشاركة إلهامك عبر Serveo
echo ========================================
echo.
echo الرابط راح يظهر بعد ثواني...
echo.
cd /d "%~dp0"
ssh -o StrictHostKeyChecking=no -R 80:localhost:3000 serveo.net
pause
