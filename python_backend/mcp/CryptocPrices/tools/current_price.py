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

def _format_ticker_data(ticker: Dict[str, Any]) -> Dict[str, Any]:
    """将从API获取的原始ticker数据格式化为标准输出。"""
    return {
        "symbol": ticker.get('symbol'),
        "price": ticker.get('lastPrice'),
        "priceChangePercent": ticker.get('priceChangePercent'),
        "highPrice": ticker.get('highPrice'),
        "lowPrice": ticker.get('lowPrice'),
        "volume": ticker.get('volume'),
        "quoteVolume": ticker.get('quoteVolume'),
        "bidPrice": ticker.get('bidPrice'),
        "askPrice": ticker.get('askPrice'),
        "timestamp": datetime.now().isoformat()
    }

def get_current_price(symbol: str = "BTCUSDT") -> Dict[str, Any]:
    """
    获取指定加密货币当前更丰富的市场价格信息。

    参数:
        symbol: 交易对符号，例如 BTCUSDT, ETHUSDT 等。

    返回:
        包含详细价格信息的字典。
    """
    try:
        ticker = client.get_ticker(symbol=symbol)
        return _format_ticker_data(ticker)
    except BinanceAPIException as e:
        return {"error": f"获取 {symbol} 价格失败: {str(e)}"}

def get_multiple_prices(symbols: List[str] = ["BTCUSDT", "ETHUSDT", "BNBUSDT"]) -> List[Dict[str, Any]]:
    """
    高效获取多个加密货币的当前价格信息。
    此函数通过一次API调用获取所有市场数据，然后进行过滤，以提高性能。

    参数:
        symbols: 需要查询的交易对符号列表。

    返回:
        包含多个价格信息的列表。
    """
    try:
        all_tickers = client.get_ticker()
        # 创建一个以symbol为键的字典以便快速查找
        tickers_map = {ticker['symbol']: ticker for ticker in all_tickers}
        
        results = []
        for symbol in symbols:
            if symbol in tickers_map:
                results.append(_format_ticker_data(tickers_map[symbol]))
            else:
                results.append({"symbol": symbol, "error": "未找到该交易对"})
        
        return results
    except BinanceAPIException as e:
        # 如果API调用失败，为每个请求的symbol返回错误信息
        return [{"symbol": symbol, "error": f"API请求失败: {str(e)}"} for symbol in symbols]
