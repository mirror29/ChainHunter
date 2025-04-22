#!/usr/bin/env python
"""
加密货币价格分析服务启动脚本
"""

import os
import sys

# 获取当前脚本目录
current_dir = os.path.dirname(os.path.abspath(__file__))

# 1. 先添加当前目录到系统路径，确保可以直接导入当前目录下的模块
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# 2. 添加项目根目录到系统路径，支持作为包导入的情况
backend_dir = os.path.abspath(os.path.join(current_dir, '../../'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# 导入主模块，使用绝对路径指定当前目录下的main模块
try:
    # 使用绝对导入，指定当前目录下的main.py文件
    import importlib.util
    spec = importlib.util.spec_from_file_location("local_main", os.path.join(current_dir, "main.py"))
    local_main = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(local_main)
    mcp = local_main.mcp
except ImportError as e:
    print(f"导入失败: {e}")
    sys.exit(1)

if __name__ == "__main__":
    print("启动加密货币价格分析服务...")
    mcp.run()
