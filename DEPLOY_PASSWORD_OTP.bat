@echo off
title Soukhin - Deploy Password OTP
cd /d "%~dp0"
echo.
echo === Deploy password-otp to Supabase ===
echo.
echo If you have a Supabase access token, run in PowerShell:
echo   $env:SUPABASE_ACCESS_TOKEN = "sbp_your_token"
echo   npm run deploy-password-otp
echo.
echo Opening setup guide and function code...
start notepad "%~dp0PASSWORD_OTP_SETUP.txt"
notepad "%~dp0supabase\functions\password-otp\index.ts"
echo.
pause
