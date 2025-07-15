#!/usr/bin/env python3
import asyncio
from fastmcp import FastMCP

# 创建FastMCP服务器实例
mcp = FastMCP("TradingSignals")

# 导入工具函数
try:
    from tools.signals import analyze_trading_signals, check_arbitrage_opportunities, get_signal_history
except ImportError:
    import sys
    sys.path.append('.')
    from tools.signals import analyze_trading_signals, check_arbitrage_opportunities, get_signal_history

@mcp.tool()
def analyze_signals(symbols: list[str] = ["BTCUSDT", "ETHUSDT", "BNBUSDT"], 
                   timeframes: list[str] = ["1h", "4h"]) -> dict:
    """
    分析多个交易对的技术指标并生成交易信号
    
    Args:
        symbols: 要分析的交易对符号列表，如 ["BTCUSDT", "ETHUSDT"]
        timeframes: 要分析的时间框架列表，如 ["1h", "4h", "1d"]
    
    Returns:
        包含所有交易信号分析结果的字典，包括信号类型、强度、风险等级等
    """
    return analyze_trading_signals(symbols, timeframes)

@mcp.tool()
def find_arbitrage(symbols: list[str] = ["BTCUSDT", "ETHUSDT"]) -> dict:
    """
    检查跨交易所套利机会
    
    Args:
        symbols: 要检查套利机会的交易对列表
    
    Returns:
        包含套利机会详情的字典，包括买卖交易所、价格差异、预期收益等
    """
    return check_arbitrage_opportunities(symbols)

@mcp.tool()
def get_signal_performance(symbol: str = "BTCUSDT", limit: int = 10) -> dict:
    """
    获取历史交易信号的表现记录
    
    Args:
        symbol: 交易对符号
        limit: 返回的历史记录数量
    
    Returns:
        包含历史信号记录、成功率、平均收益等统计信息的字典
    """
    return get_signal_history(symbol, limit)

if __name__ == "__main__":
    mcp.run()