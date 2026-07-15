@echo off
notepad "%~dp0supabase\migrations\20260701230000_021_admin_multirole_categories_settings.sql"
echo.
echo Run the ENTIRE SQL in Supabase SQL Editor first.
echo Then deploy: npm run deploy-sync-google-sheets
pause
