from fastmcp import FastMCP
from binance import Client, ThreadedWebsocketManager, ThreadedDepthCacheManager
from binance.exceptions import BinanceAPIException
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 尝试读取Binance API密钥（如不存在则使用测试模式）
api_key = os.getenv("BINANCE_API_KEY", "")
api_secret = os.getenv("BINANCE_API_SECRET", "")

# 初始化Binance客户端
try:
    client = Client(api_key, api_secret)
    # 测试连接
    client.ping()
    print("成功连接到Binance API")
except BinanceAPIException as e:
    print(f"Binance API连接错误: {e}")
    # 如无密钥，使用测试模式
    client = Client()
    print("使用测试模式连接Binance API")

# 初始化MCP服务
mcp = FastMCP("加密货币市场分析服务")

@mcp.tool()
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

@mcp.tool()
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

@mcp.tool()
def get_price_history(symbol: str = "BTCUSDT", interval: str = "1d", limit: int = 30) -> Dict[str, Any]:
    """
    获取加密货币的历史价格数据

    参数:
        symbol: 交易对符号，例如BTCUSDT
        interval: 时间间隔，如1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
        limit: 获取的数据点数量，最大1000

    返回:
        包含历史价格数据和基本分析的字典
    """
    try:
        # 获取K线数据
        klines = client.get_klines(symbol=symbol, interval=interval, limit=limit)

        # 将数据转换为DataFrame
        df = pd.DataFrame(klines, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume',
                                          'close_time', 'quote_asset_volume', 'number_of_trades',
                                          'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'])

        # 转换数据类型
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        for col in ['open', 'high', 'low', 'close', 'volume']:
            df[col] = df[col].astype(float)

        # 计算基本技术指标
        # 1. 移动平均线 (7日和21日)
        df['MA7'] = df['close'].rolling(window=7).mean()
        df['MA21'] = df['close'].rolling(window=21).mean()

        # 2. 相对强弱指标 (RSI)
        delta = df['close'].diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        avg_gain = gain.rolling(window=14).mean()
        avg_loss = loss.rolling(window=14).mean()
        rs = avg_gain / avg_loss
        df['RSI'] = 100 - (100 / (1 + rs))

        # 3. 计算MACD
        df['EMA12'] = df['close'].ewm(span=12, adjust=False).mean()
        df['EMA26'] = df['close'].ewm(span=26, adjust=False).mean()
        df['MACD'] = df['EMA12'] - df['EMA26']
        df['Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
        df['Histogram'] = df['MACD'] - df['Signal']

        # 准备返回数据
        price_data = []
        for _, row in df.iterrows():
            price_data.append({
                "date": row['timestamp'].isoformat(),
                "open": row['open'],
                "high": row['high'],
                "low": row['low'],
                "close": row['close'],
                "volume": row['volume'],
                "ma7": row['MA7'],
                "ma21": row['MA21'],
                "rsi": row['RSI'],
                "macd": row['MACD'],
                "signal": row['Signal'],
                "histogram": row['Histogram']
            })

        # 进行趋势分析
        current_price = float(df['close'].iloc[-1])
        prev_price = float(df['close'].iloc[-2]) if len(df) > 1 else current_price
        price_change = ((current_price - prev_price) / prev_price) * 100

        # 分析RSI
        latest_rsi = df['RSI'].iloc[-1]
        rsi_status = "超卖区域" if latest_rsi < 30 else "超买区域" if latest_rsi > 70 else "中性区域"

        # 分析MACD
        latest_macd = df['MACD'].iloc[-1]
        latest_signal = df['Signal'].iloc[-1]
        macd_trend = "看涨信号" if latest_macd > latest_signal else "看跌信号"

        # 分析MA交叉
        ma_cross = "无明显趋势"
        if df['MA7'].iloc[-1] > df['MA21'].iloc[-1] and df['MA7'].iloc[-2] <= df['MA21'].iloc[-2]:
            ma_cross = "金叉形成，可能上涨"
        elif df['MA7'].iloc[-1] < df['MA21'].iloc[-1] and df['MA7'].iloc[-2] >= df['MA21'].iloc[-2]:
            ma_cross = "死叉形成，可能下跌"

        # 汇总分析结果
        analysis = {
            "current_price": current_price,
            "price_change_percent": price_change,
            "trend": "上涨" if price_change > 0 else "下跌",
            "rsi_value": latest_rsi,
            "rsi_status": rsi_status,
            "macd_trend": macd_trend,
            "moving_average_analysis": ma_cross,
            "summary": f"{symbol}当前价格{current_price}，24小时变化{price_change:.2f}%。RSI处于{rsi_status}，MACD显示{macd_trend}，移动平均线分析：{ma_cross}。"
        }

        return {
            "symbol": symbol,
            "interval": interval,
            "price_data": price_data,
            "analysis": analysis
        }

    except BinanceAPIException as e:
        return {"error": f"获取历史价格失败: {str(e)}"}
    except Exception as e:
        return {"error": f"分析数据时出错: {str(e)}"}

@mcp.tool()
def get_market_summary() -> Dict[str, Any]:
    """
    获取市场概况，包括主要加密货币价格、24小时涨跌幅和成交量

    返回:
        市场概况数据
    """
    try:
        # 主要加密货币列表
        major_coins = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "SOLUSDT", "DOTUSDT"]

        # 获取所有价格信息
        tickers = client.get_ticker()

        # 筛选主要加密货币
        major_data = []
        for ticker in tickers:
            if ticker['symbol'] in major_coins:
                major_data.append({
                    "symbol": ticker['symbol'],
                    "price": ticker['lastPrice'],
                    "priceChangePercent": ticker['priceChangePercent'],
                    "volume": ticker['volume'],
                    "quoteVolume": ticker['quoteVolume']
                })

        # 按涨跌幅排序
        major_data.sort(key=lambda x: float(x['priceChangePercent']), reverse=True)

        # 市场趋势分析
        positive_count = sum(1 for coin in major_data if float(coin['priceChangePercent']) > 0)
        negative_count = len(major_data) - positive_count

        market_sentiment = "看涨" if positive_count > negative_count else "看跌" if positive_count < negative_count else "中性"

        # 返回市场概况
        return {
            "timestamp": datetime.now().isoformat(),
            "market_sentiment": market_sentiment,
            "major_coins": major_data,
            "summary": f"当前市场情绪: {market_sentiment}。{positive_count}个主要币种上涨，{negative_count}个下跌。表现最好的是{major_data[0]['symbol']}，涨幅{major_data[0]['priceChangePercent']}%。"
        }

    except BinanceAPIException as e:
        return {"error": f"获取市场概况失败: {str(e)}"}

@mcp.tool()
def get_price_prediction(symbol: str = "BTCUSDT", days: int = 7) -> Dict[str, Any]:
    """
    基于历史数据提供简单的价格预测分析

    参数:
        symbol: 交易对符号，例如BTCUSDT
        days: 预测天数

    返回:
        包含预测分析的字典
    """
    try:
        # 获取更多历史数据用于预测
        klines = client.get_klines(symbol=symbol, interval='1d', limit=60)

        # 将数据转换为DataFrame
        df = pd.DataFrame(klines, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume',
                                          'close_time', 'quote_asset_volume', 'number_of_trades',
                                          'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'])

        # 转换数据类型
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        df['close'] = df['close'].astype(float)

        # 简单的移动平均预测模型
        last_price = float(df['close'].iloc[-1])

        # 计算均线
        ma7 = df['close'].rolling(window=7).mean().iloc[-1]
        ma14 = df['close'].rolling(window=14).mean().iloc[-1]
        ma30 = df['close'].rolling(window=30).mean().iloc[-1]

        # 计算增长率
        growth_rate_7d = (df['close'].iloc[-1] - df['close'].iloc[-7]) / df['close'].iloc[-7] if len(df) >= 7 else 0
        growth_rate_14d = (df['close'].iloc[-1] - df['close'].iloc[-14]) / df['close'].iloc[-14] if len(df) >= 14 else 0
        growth_rate_30d = (df['close'].iloc[-1] - df['close'].iloc[-30]) / df['close'].iloc[-30] if len(df) >= 30 else 0

        # 加权平均增长率
        weighted_growth_rate = (growth_rate_7d * 0.5) + (growth_rate_14d * 0.3) + (growth_rate_30d * 0.2)

        # 生成预测价格
        prediction_dates = [(datetime.now() + timedelta(days=i)).isoformat() for i in range(1, days+1)]
        predicted_prices = [last_price * (1 + weighted_growth_rate) ** i for i in range(1, days+1)]

        # 检查与均线关系
        price_vs_ma7 = "高于" if last_price > ma7 else "低于"
        price_vs_ma30 = "高于" if last_price > ma30 else "低于"

        # 综合分析
        if weighted_growth_rate > 0.01:
            prediction_text = f"基于过去数据分析，{symbol}在未来{days}天内可能会上涨。"
        elif weighted_growth_rate < -0.01:
            prediction_text = f"基于过去数据分析，{symbol}在未来{days}天内可能会下跌。"
        else:
            prediction_text = f"基于过去数据分析，{symbol}在未来{days}天内可能会保持横盘整理。"

        prediction_text += f" 当前价格{last_price}，{price_vs_ma7}7日均线({ma7:.2f})，{price_vs_ma30}30日均线({ma30:.2f})。"

        disclaimer = "免责声明：此预测仅基于历史数据分析，不构成投资建议。加密货币市场波动性大，实际价格走势可能与预测有显著差异。"

        return {
            "symbol": symbol,
            "current_price": last_price,
            "prediction_period": f"{days}天",
            "weighted_growth_rate": weighted_growth_rate,
            "moving_averages": {
                "ma7": ma7,
                "ma14": ma14,
                "ma30": ma30
            },
            "predictions": [
                {"date": date, "predicted_price": price}
                for date, price in zip(prediction_dates, predicted_prices)
            ],
            "analysis": prediction_text,
            "disclaimer": disclaimer
        }

    except BinanceAPIException as e:
        return {"error": f"获取数据失败: {str(e)}"}
    except Exception as e:
        return {"error": f"分析预测时出错: {str(e)}"}

if __name__ == "__main__":
    mcp.run()

