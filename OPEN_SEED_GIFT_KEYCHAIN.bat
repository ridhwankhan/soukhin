@echo off
echo.
echo  STEP 1: Run SETUP_GIFTS_CATEGORIES_COMPLETE.sql in Supabase SQL Editor
echo  STEP 2: Run SEED_GIFT_KEYCHAIN_PRODUCTS.sql in Supabase SQL Editor
echo.
notepad "%~dp0supabase\SETUP_GIFTS_CATEGORIES_COMPLETE.sql"
timeout /t 2 >nul
notepad "%~dp0supabase\SEED_GIFT_KEYCHAIN_PRODUCTS.sql"
echo.
echo After SQL runs, upload your real product photos in Admin -^> Products -^> Edit each item.
pause
