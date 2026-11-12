@echo off
echo ===================================================================
echo Populating Smart Pharmacy Database with Rich Academic Seed Data...
echo ===================================================================

cd backend && node utils/seedData.js

echo.
echo Database Seeding Complete!
pause

