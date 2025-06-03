#!/bin/bash

# 《工程师日记》网页前端启动脚本

echo "🎮 《工程师日记》网页前端"
echo "================================"
echo

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ 错误：未找到Python，请先安装Python 3.x"
        echo "💡 macOS: brew install python"
        echo "💡 Ubuntu: sudo apt install python3"
        echo "💡 CentOS: sudo yum install python3"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

# 检查必要文件
required_files=("index.html" "styles.css" "game.js" "backend-adapter.js")
missing_files=()

for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        missing_files+=("$file")
    fi
done

if [[ ${#missing_files[@]} -gt 0 ]]; then
    echo "❌ 错误：缺少必要文件："
    printf '   %s\n' "${missing_files[@]}"
    exit 1
fi

echo "✅ 所有文件检查完成"
echo
echo "📡 正在启动服务器..."
echo "🌐 服务器地址：http://localhost:8000"
echo "📁 服务目录：$(pwd)"
echo
echo "💡 服务器启动后会自动打开浏览器"
echo "💡 按 Ctrl+C 可以停止服务器"
echo

# 启动Python HTTP服务器
if [[ -f "start-server.py" ]]; then
    $PYTHON_CMD start-server.py
else
    # 备用方案：直接使用Python内置服务器
    echo "⚠️  未找到 start-server.py，使用内置服务器"
    $PYTHON_CMD -m http.server 8000
fi 