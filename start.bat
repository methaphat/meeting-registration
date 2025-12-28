@echo off
chcp 65001 >nul
echo ========================================
echo  ระบบลงทะเบียนเข้าร่วมประชุม
echo ========================================
echo.

REM ตรวจสอบว่า Node.js ติดตั้งหรือไม่
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] ไม่พบ Node.js
    echo กรุณาติดตั้ง Node.js จาก https://nodejs.org/
    pause
    exit /b 1
)

REM ตรวจสอบว่า npm ติดตั้งหรือไม่
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] ไม่พบ npm
    echo กรุณาติดตั้ง Node.js (npm จะติดตั้งมาด้วย)
    pause
    exit /b 1
)

REM ตรวจสอบว่า node_modules มีอยู่หรือไม่
if not exist "node_modules" (
    echo [1/2] กำลังติดตั้ง dependencies...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] การติดตั้ง dependencies ล้มเหลว
        echo.
        echo ถ้าเกิด error เกี่ยวกับ better-sqlite3:
        echo - ติดตั้ง Visual Studio Build Tools หรือ
        echo - ใช้ npm install --build-from-source
        pause
        exit /b 1
    )
    echo.
)

REM ตรวจสอบว่า database.js มีอยู่หรือไม่
if not exist "database.js" (
    echo [ERROR] ไม่พบไฟล์ database.js
    echo กรุณาตรวจสอบว่าไฟล์ทั้งหมดอยู่ในโฟลเดอร์เดียวกัน
    pause
    exit /b 1
)

REM ตรวจสอบว่า server.js มีอยู่หรือไม่
if not exist "server.js" (
    echo [ERROR] ไม่พบไฟล์ server.js
    echo กรุณาตรวจสอบว่าไฟล์ทั้งหมดอยู่ในโฟลเดอร์เดียวกัน
    pause
    exit /b 1
)

echo [2/2] กำลังเริ่มต้น server...
echo.
echo Server จะรันที่: http://localhost:3030
echo กด Ctrl+C เพื่อหยุด server
echo.
echo ========================================
echo.

call npm start

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server ไม่สามารถเริ่มต้นได้
    echo.
    echo ตรวจสอบ:
    echo 1. Port 3030 ถูกใช้งานอยู่หรือไม่
    echo 2. ไฟล์ database.js และ server.js มีอยู่
    echo 3. Dependencies ติดตั้งครบถ้วน
    echo.
    pause
)

