@echo off
notepad "%~dp0supabase\FIX_STAFF_LIST.sql"
echo.
echo 1. Copy all from Notepad - paste into Supabase SQL Editor - RUN
echo 2. Check the results at the bottom for Intisar's email
echo 3. Uncomment section 4 in the SQL to re-add Intisar as admin if needed
echo 4. Refresh /admin/users in the dashboard
pause
