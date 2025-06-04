@echo off
chcp 65001 >nul
title 工程师日记 - 网页前端服务器

echo.
echo 🎮 《工程师日记》网页前端
echo ================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到Python，请先安装Python 3.x
    echo 💡 下载地址：https://www.python.org/downloads/
    pause
    exit /b 1
)

REM 检查必要文件
if not exist "index.html" (
    echo ❌ 错误：未找到 index.html 文件
    pause
    exit /b 1
)

echo ✅ 所有必要文件检查完成
echo.
echo 📡 正在启动服务器...
echo 🌐 服务器地址：http://localhost:8000
echo 📁 服务目录：%CD%
echo.
echo 💡 服务器启动后会自动打开浏览器
echo 💡 按 Ctrl+C 可以停止服务器
echo.

REM 启动Python HTTP服务器
python start-server.py

pause 