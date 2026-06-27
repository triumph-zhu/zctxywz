@echo off
chcp 65001 >nul 2>&1
title Future Career Bootcamp

echo.
echo  ========================================
echo   Future Career Bootcamp
echo   数字知识库本地服务器
echo  ========================================
echo.

cd /d "%~dp0"

:: 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [错误] 未检测到 Node.js, 请先安装
    echo  下载: https://nodejs.org/
    pause
    exit /b 1
)

:: 检查项目目录
if not exist "%~dp0future-career-bootcamp\server.js" (
    echo  [错误] 找不到 server.js
    pause
    exit /b 1
)

:: 清理残留进程
echo  [1/3] 清理残留进程 ...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":4173 .*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: 启动服务器
echo  [2/3] 启动服务器 ...
start "FCB-Server" /min "%~dp0future-career-bootcamp\_server.bat"

:: 等待服务器就绪
echo  [3/3] 等待服务器就绪 ...
ping -n 4 127.0.0.1 >nul

:: 检测服务器
powershell -NoProfile -Command "try{(New-Object Net.WebClient).DownloadString('http://localhost:4173/')|Out-Null;exit 0}catch{exit 1}" >nul 2>&1
if %errorlevel% neq 0 (
    echo  [等待] 服务器启动较慢, 继续等待 ...
    ping -n 8 127.0.0.1 >nul
)

:: 打开浏览器
start "" "http://localhost:4173/"

echo.
echo  --------------------------------------
echo   网站已启动!
echo.
echo   首页:     http://localhost:4173
echo   学习资料: http://localhost:4173/learn.html
echo   师兄师姐: http://localhost:4173/messages.html
echo   了解营期: http://localhost:4173/about.html
echo   职业规划: http://localhost:4173/career-path.html
echo   面试模拟: http://localhost:4173/interview.html
echo.
echo   关闭此窗口即可停止服务器
echo  --------------------------------------
echo.

echo  按任意键停止服务器 ...
pause >nul

:: 停止服务器
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":4173 .*LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo  服务器已停止.
ping -n 2 127.0.0.1 >nul
