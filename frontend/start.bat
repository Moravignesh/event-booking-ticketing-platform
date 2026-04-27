@echo off
echo ╔════════════════════════════════════════╗
echo ║     EventX Frontend Setup and Start    ║
echo ╚════════════════════════════════════════╝

echo Installing npm packages...
npm install

echo.
echo Starting React dev server on http://localhost:5173
echo.
npm run dev
pause
