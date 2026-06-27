@echo off
chcp 65001 >nul 2>&1
title FCB-Server
cd /d "%~dp0"
node server.js
