@echo off
notepad "%~dp0supabase\LINK_EXISTING_STAFF.sql"
echo.
echo 1. Run the ENTIRE SQL file in Supabase SQL Editor
echo 2. Then deploy invite-staff: npm run deploy-invite-staff
echo 3. In Admin - Staff: Add user, click "Link account" if already registered
pause
