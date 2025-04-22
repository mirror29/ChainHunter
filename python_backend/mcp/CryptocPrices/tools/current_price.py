from typing import List, Dict, Any
from datetime import datetime
from binance.exceptions import BinanceAPIException

# 使用try-except处理不同环境下的导入
try:
    # 作为包导入时
    from ..client import client
except (ImportError, ValueError):
    # 直接运行时
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from client import client

def get_current_price(symbol: str = "BTCUSDT") -> Dict[str, Any]:
    """
    获取指定加密货币当前价格

    参数:
        symbol: 交易对符号，例如BTCUSDT, ETHUSDT等

    返回:
        包含价格信息的字典
    """
    try:
        ticker = client.get_ticker(symbol=symbol)
        return {
            "symbol": symbol,
            "price": ticker['lastPrice'],
            "priceChangePercent": ticker['priceChangePercent'],
            "volume": ticker['volume'],
            "timestamp": datetime.now().isoformat()
        }
    except BinanceAPIException as e:
        return {"error": f"获取价格失败: {str(e)}"}

def get_multiple_prices(symbols: List[str] = ["BTCUSDT", "ETHUSDT", "BNBUSDT"]) -> List[Dict[str, Any]]:
    """
    获取多个加密货币的当前价格

    参数:
        symbols: 交易对符号列表

    返回:
        包含多个价格信息的列表
    """
    results = []
    for symbol in symbols:
        try:
            ticker = client.get_ticker(symbol=symbol)
            results.append({
                "symbol": symbol,
                "price": ticker['lastPrice'],
                "priceChangePercent": ticker['priceChangePercent'],
                "volume": ticker['volume']
            })
        except BinanceAPIException as e:
            results.append({"symbol": symbol, "error": str(e)})

    return results
