@echo off
echo.
echo  Bulk import 3D products from E:\BUSINESS products\3D products
echo.
echo  BEFORE RUNNING:
echo    1. Run SETUP_GIFTS_CATEGORIES_COMPLETE.sql in Supabase (if not done)
echo    2. Add to .env ONE of:
echo         SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
echo       OR
echo         IMPORT_STAFF_EMAIL=your@email.com
echo         IMPORT_STAFF_PASSWORD=your_password
echo.
echo  Preview (no upload):
echo    npm run import-3d-products
echo.
echo  Upload to live website:
echo    npm run import-3d-products -- --apply
echo.
pause
npm run import-3d-products -- --apply
pause
