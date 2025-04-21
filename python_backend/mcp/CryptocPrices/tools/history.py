from typing import Dict, Any
import pandas as pd
from datetime import datetime
from binance.exceptions import BinanceAPIException
from python_backend.mcp.CryptocPrices.client import client

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
