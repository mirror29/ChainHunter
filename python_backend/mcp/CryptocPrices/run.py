#!/usr/bin/env python
"""
加密货币价格分析服务启动脚本
"""

import sys
import os

# 将项目根目录添加到Python路径
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

# 导入主模块并运行
from python_backend.mcp.CryptocPrices.main import mcp

if __name__ == "__main__":
    print("启动加密货币价格分析服务...")
    mcp.run()
