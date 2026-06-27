@echo off
chcp 65001 >nul 2>&1
title 停止 Future Career Bootcamp

echo.
echo  正在停止服务器 ...

for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":4173 .*LISTENING"') do (
    echo  关闭进程 PID=%%a
    taskkill /F /PID %%a >nul 2>&1
)

echo  服务器已停止.
ping -n 2 127.0.0.1 >nul
