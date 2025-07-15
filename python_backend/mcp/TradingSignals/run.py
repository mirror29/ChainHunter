#!/usr/bin/env python3
"""
TradingSignals MCP Server 启动脚本
提供加密货币交易信号分析和套利机会检测功能
"""
import sys
import asyncio
from pathlib import Path

# 添加当前目录到Python路径
sys.path.insert(0, str(Path(__file__).parent))

from main import mcp

if __name__ == "__main__":
    asyncio.run(mcp.run())