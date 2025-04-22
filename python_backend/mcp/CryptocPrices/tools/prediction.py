from typing import Dict, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
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

from statsmodels.tsa.arima.model import ARIMA

def get_price_prediction(symbol: str = "BTCUSDT", days: int = 7) -> Dict[str, Any]:
    """
    基于多重技术指标和统计模型的综合价格预测分析

    参数:
        symbol: 交易对符号，例如BTCUSDT
        days: 预测天数

    返回:
        包含预测分析的字典
    """
    try:
        # 获取更多历史数据用于预测
        klines = client.get_klines(symbol=symbol, interval='1d', limit=120)  # 增加历史数据量

        # 将数据转换为DataFrame
        df = pd.DataFrame(klines, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume',
                                          'close_time', 'quote_asset_volume', 'number_of_trades',
                                          'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'])

        # 转换数据类型
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        for col in ['open', 'high', 'low', 'close', 'volume']:
            df[col] = df[col].astype(float)

        # 1. 技术指标计算
        # 移动平均线
        df['MA5'] = df['close'].rolling(window=5).mean()
        df['MA10'] = df['close'].rolling(window=10).mean()
        df['MA20'] = df['close'].rolling(window=20).mean()
        df['MA30'] = df['close'].rolling(window=30).mean()
        df['MA60'] = df['close'].rolling(window=60).mean()
        df['MA120'] = df['close'].rolling(window=120).mean()

        # 指数移动平均线
        df['EMA12'] = df['close'].ewm(span=12, adjust=False).mean()
        df['EMA26'] = df['close'].ewm(span=26, adjust=False).mean()

        # MACD指标
        df['MACD'] = df['EMA12'] - df['EMA26']
        df['Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
        df['Histogram'] = df['MACD'] - df['Signal']

        # 相对强弱指数(RSI)
        delta = df['close'].diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        avg_gain = gain.rolling(window=14).mean()
        avg_loss = loss.rolling(window=14).mean()
        rs = avg_gain / avg_loss
        df['RSI'] = 100 - (100 / (1 + rs))

        # 布林带指标
        df['BB_Middle'] = df['close'].rolling(window=20).mean()
        df['BB_Std'] = df['close'].rolling(window=20).std()
        df['BB_Upper'] = df['BB_Middle'] + (df['BB_Std'] * 2)
        df['BB_Lower'] = df['BB_Middle'] - (df['BB_Std'] * 2)

        # 成交量变化率
        df['Volume_Change'] = df['volume'].pct_change()

        # 价格波动率
        df['Volatility'] = df['close'].rolling(window=20).std() / df['close'].rolling(window=20).mean()

        # 当前最新数据
        last_row = df.iloc[-1]
        last_price = float(last_row['close'])

        # 2. 综合预测模型
        # A. 趋势分析 - 基于多周期移动平均线
        ma_trend_signals = {
            'MA5_vs_MA20': 1 if last_row['MA5'] > last_row['MA20'] else -1,
            'MA10_vs_MA30': 1 if last_row['MA10'] > last_row['MA30'] else -1,
            'MA20_vs_MA60': 1 if last_row['MA20'] > last_row['MA60'] else -1,
            'Price_vs_MA20': 1 if last_price > last_row['MA20'] else -1
        }
        ma_trend_score = sum(ma_trend_signals.values()) / len(ma_trend_signals)

        # B. 动量分析
        rsi_signal = 1 if last_row['RSI'] > 50 else (-1 if last_row['RSI'] < 50 else 0)
        macd_signal = 1 if last_row['MACD'] > last_row['Signal'] else -1
        histogram_trend = 1 if df['Histogram'].iloc[-1] > df['Histogram'].iloc[-2] else -1

        momentum_signals = {
            'RSI': rsi_signal,
            'MACD': macd_signal,
            'Histogram': histogram_trend
        }
        momentum_score = sum(momentum_signals.values()) / len(momentum_signals)

        # C. 波动性和支撑/阻力分析
        bb_position = (last_price - last_row['BB_Lower']) / (last_row['BB_Upper'] - last_row['BB_Lower'])
        volatility_level = last_row['Volatility']

        # D. 计算历史增长率
        growth_rates = []
        for period in [7, 14, 30, 60]:
            if len(df) > period:
                rate = (df['close'].iloc[-1] - df['close'].iloc[-period-1]) / df['close'].iloc[-period-1]
                growth_rates.append(rate)

        # 使用加权平均的历史增长率
        if growth_rates:
            weights = [0.4, 0.3, 0.2, 0.1][:len(growth_rates)]
            weighted_growth_rate = sum(r * w for r, w in zip(growth_rates, weights)) / sum(weights[:len(growth_rates)])
        else:
            weighted_growth_rate = 0

        # E. ARIMA时间序列预测模型
        try:
            # 准备ARIMA模型数据
            arima_data = df['close'].dropna()
            if len(arima_data) > 30:  # 确保有足够数据
                model = ARIMA(arima_data, order=(5,1,0))
                model_fit = model.fit()
                arima_forecast = model_fit.forecast(steps=days)
                arima_prices = arima_forecast.tolist()
            else:
                arima_prices = None
        except:
            arima_prices = None

        # 3. 综合多模型预测
        # 基于技术分析的预测
        ta_prediction = last_price * (1 + (weighted_growth_rate * ma_trend_score * (1 + momentum_score) / 2))

        # 生成最终预测价格: 如果ARIMA可用，取两种模型的加权平均
        prediction_dates = [(datetime.now() + timedelta(days=i)).isoformat() for i in range(1, days+1)]
        if arima_prices:
            predicted_prices = []
            for i in range(days):
                # 两种模型权重: 技术分析(60%) + ARIMA(40%)
                tech_price = last_price * (1 + weighted_growth_rate * (i+1))
                combined_price = (tech_price * 0.6) + (arima_prices[i] * 0.4)
                predicted_prices.append(combined_price)
        else:
            # 仅使用技术分析模型
            predicted_prices = [last_price * (1 + weighted_growth_rate * (i+1)) for i in range(days)]

        # 4. 市场状态分析
        # RSI超买/超卖状态
        rsi_state = "超买区域" if last_row['RSI'] > 70 else "超卖区域" if last_row['RSI'] < 30 else "中性区域"

        # 均线系统状态
        ma_cross_state = "多头排列" if (last_row['MA5'] > last_row['MA10'] > last_row['MA20'] > last_row['MA30']) else \
                        "空头排列" if (last_row['MA5'] < last_row['MA10'] < last_row['MA20'] < last_row['MA30']) else \
                        "混合排列"

        # 布林带状态
        bb_state = "触及上轨" if last_price > last_row['BB_Upper'] * 0.98 else \
                  "触及下轨" if last_price < last_row['BB_Lower'] * 1.02 else \
                  "上轨行进" if last_price > last_row['BB_Middle'] else \
                  "下轨行进"

        # MACD状态
        macd_state = "金叉形成" if (df['MACD'].iloc[-2] < df['Signal'].iloc[-2] and df['MACD'].iloc[-1] > df['Signal'].iloc[-1]) else \
                    "死叉形成" if (df['MACD'].iloc[-2] > df['Signal'].iloc[-2] and df['MACD'].iloc[-1] < df['Signal'].iloc[-1]) else \
                    "多头行情" if df['MACD'].iloc[-1] > df['Signal'].iloc[-1] else \
                    "空头行情"

        # 5. 风险评估
        risk_factors = {
            "短期超买/超卖": 1 if last_row['RSI'] > 70 or last_row['RSI'] < 30 else 0,
            "MACD背离": 1 if (last_row['MACD'] > 0 and ma_trend_score < 0) or (last_row['MACD'] < 0 and ma_trend_score > 0) else 0,
            "价格波动性": min(1, last_row['Volatility'] * 5),  # 标准化波动性为0-1
            "布林带突破": 1 if last_price > last_row['BB_Upper'] or last_price < last_row['BB_Lower'] else 0
        }
        risk_score = sum(risk_factors.values()) / len(risk_factors)
        risk_level = "高" if risk_score > 0.6 else "中" if risk_score > 0.3 else "低"

        # 6. 综合技术分析结论
        # 计算综合信号得分 (-1到1)
        signal_score = (ma_trend_score + momentum_score) / 2

        if signal_score > 0.5:
            prediction_text = f"{symbol}呈现强势上涨趋势，技术指标整体看多。"
        elif signal_score > 0.2:
            prediction_text = f"{symbol}目前偏向上涨趋势，但上行动能有限。"
        elif signal_score > -0.2:
            prediction_text = f"{symbol}处于盘整区间，短期内可能横盘震荡。"
        elif signal_score > -0.5:
            prediction_text = f"{symbol}呈现下跌趋势，但下行空间有限。"
        else:
            prediction_text = f"{symbol}呈现强势下跌趋势，技术指标整体看空。"

        # 添加关键技术指标状态
        prediction_text += f" 当前价格{last_price:.2f}，位于布林带{bb_state}，均线系统{ma_cross_state}，MACD指标{macd_state}，RSI处于{rsi_state}({last_row['RSI']:.1f})。"

        # 风险提示
        prediction_text += f" 短期市场波动风险{risk_level}。"

        disclaimer = "免责声明：此预测基于技术分析和统计模型，仅供参考，不构成投资建议。加密货币市场受多种因素影响，实际价格走势可能与预测有显著差异。投资决策请结合基本面分析并控制风险。"

        return {
            "symbol": symbol,
            "current_price": last_price,
            "prediction_period": f"{days}天",
            "technical_indicators": {
                "ma_trend_score": ma_trend_score,
                "momentum_score": momentum_score,
                "rsi": float(last_row['RSI']),
                "macd": float(last_row['MACD']),
                "signal": float(last_row['Signal']),
                "bb_position": bb_position,
                "volatility": float(last_row['Volatility'])
            },
            "market_state": {
                "rsi_state": rsi_state,
                "ma_system": ma_cross_state,
                "bollinger_band_state": bb_state,
                "macd_state": macd_state
            },
            "risk_assessment": {
                "risk_level": risk_level,
                "risk_score": risk_score,
                "risk_factors": risk_factors
            },
            "growth_analysis": {
                "weighted_historical_growth": weighted_growth_rate,
                "projected_growth": weighted_growth_rate * signal_score
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
