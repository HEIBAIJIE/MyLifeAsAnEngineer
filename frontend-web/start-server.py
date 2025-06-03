#!/usr/bin/env python3
"""
简单的HTTP服务器启动脚本
用于运行《工程师日记》网页前端
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

def main():
    # 设置端口
    PORT = 8000
    
    # 确保在正确的目录中
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # 检查必要文件是否存在
    required_files = ['index.html', 'styles.css', 'game.js', 'backend-adapter.js']
    missing_files = [f for f in required_files if not Path(f).exists()]
    
    if missing_files:
        print(f"错误：缺少必要文件: {', '.join(missing_files)}")
        sys.exit(1)
    
    # 创建HTTP服务器
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"🎮 《工程师日记》网页前端")
            print(f"📡 服务器启动在端口 {PORT}")
            print(f"🌐 访问地址: http://localhost:{PORT}")
            print(f"📁 服务目录: {script_dir}")
            print("=" * 50)
            print("按 Ctrl+C 停止服务器")
            print("=" * 50)
            
            # 自动打开浏览器
            try:
                webbrowser.open(f'http://localhost:{PORT}')
                print("✅ 已自动打开浏览器")
            except:
                print("⚠️  无法自动打开浏览器，请手动访问上述地址")
            
            # 启动服务器
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 服务器已停止")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ 端口 {PORT} 已被占用，请尝试其他端口")
            print(f"💡 你可以运行: python -m http.server {PORT + 1}")
        else:
            print(f"❌ 启动服务器失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 