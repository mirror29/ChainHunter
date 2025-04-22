from typing import Dict, Any, List
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

def get_market_summary() -> Dict[str, Any]:
    """
    获取市场综合概况，包括主要加密货币价格、24小时涨跌幅、成交量、市场结构分析和情绪指标

    返回:
        市场综合分析数据
    """
    try:
        # 主要加密货币列表 - 扩展更多币种
        major_coins = [
            "BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT",
            "DOGEUSDT", "SOLUSDT", "DOTUSDT", "MATICUSDT", "AVAXUSDT",
            "LINKUSDT", "UNIUSDT", "SHIBUSDT", "LTCUSDT", "ATOMUSDT"
        ]

        # 获取所有价格信息
        tickers = client.get_ticker()

        # 获取市场整体24小时成交量和总市值
        all_volume = 0
        btc_dominance = 0
        eth_dominance = 0
        btc_price = 0
        total_market_cap = 0

        # 筛选主要加密货币
        major_data = []
        for ticker in tickers:
            symbol = ticker['symbol']

            # 计算总成交量
            if symbol.endswith('USDT'):
                all_volume += float(ticker['quoteVolume'])

            # 收集主要币种数据
            if symbol in major_coins:
                price = float(ticker['lastPrice'])
                volume = float(ticker['volume'])
                quote_volume = float(ticker['quoteVolume'])

                # 估算市值 (注意：这只是一个粗略估计)
                if symbol == "BTCUSDT":
                    market_cap = price * 19000000  # 估计BTC流通量
                    btc_price = price
                    btc_dominance = market_cap
                elif symbol == "ETHUSDT":
                    market_cap = price * 120000000  # 估计ETH流通量
                    eth_dominance = market_cap
                else:
                    # 其他币种使用成交量作为参考
                    market_cap = quote_volume * 100  # 粗略估计

                total_market_cap += market_cap

                # 添加到主要币种列表
                major_data.append({
                    "symbol": symbol,
                    "price": price,
                    "priceChangePercent": float(ticker['priceChangePercent']),
                    "volume": volume,
                    "quoteVolume": quote_volume,
                    "estimated_market_cap": market_cap
                })

        # 计算BTC和ETH的市场占比
        if total_market_cap > 0:
            btc_dominance = (btc_dominance / total_market_cap) * 100
            eth_dominance = (eth_dominance / total_market_cap) * 100

        # 按涨跌幅排序
        major_data.sort(key=lambda x: x['priceChangePercent'], reverse=True)

        # 计算更丰富的市场趋势分析指标
        positive_count = sum(1 for coin in major_data if coin['priceChangePercent'] > 0)
        negative_count = len(major_data) - positive_count

        # 计算市场平均涨跌幅
        avg_change = sum(coin['priceChangePercent'] for coin in major_data) / len(major_data)

        # 计算Top5表现最好和最差的币种
        top_performers = major_data[:5]
        worst_performers = major_data[-5:]
        worst_performers.reverse()  # 从跌幅最大到最小排序

        # 计算涨跌幅标准差（市场分化程度）
        changes = [coin['priceChangePercent'] for coin in major_data]
        market_divergence = np.std(changes)

        # 获取BTC的历史数据，用于分析整体市场趋势
        btc_klines = client.get_klines(symbol="BTCUSDT", interval='1d', limit=14)
        btc_df = pd.DataFrame(btc_klines, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume',
                                      'close_time', 'quote_asset_volume', 'number_of_trades',
                                      'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'])

        btc_df['close'] = btc_df['close'].astype(float)
        btc_df['volume'] = btc_df['volume'].astype(float)

        # 计算BTC动量指标
        btc_momentum = ((btc_df['close'].iloc[-1] / btc_df['close'].iloc[-7]) - 1) * 100 if len(btc_df) >= 7 else 0

        # 计算BTC波动率 (14日)
        btc_volatility = btc_df['close'].pct_change().std() * 100 * np.sqrt(14) if len(btc_df) > 1 else 0

        # 分析市场整体情绪
        if positive_count > len(major_data) * 0.7:
            market_sentiment = "强烈看涨"
        elif positive_count > len(major_data) * 0.6:
            market_sentiment = "温和看涨"
        elif positive_count > len(major_data) * 0.4:
            market_sentiment = "中性偏多"
        elif positive_count > len(major_data) * 0.3:
            market_sentiment = "中性偏空"
        elif positive_count > len(major_data) * 0.2:
            market_sentiment = "温和看跌"
        else:
            market_sentiment = "强烈看跌"

        # 市场强度指数 (0-100)
        market_strength = (positive_count / len(major_data)) * 100

        # 市场结构分析
        if avg_change > 3:
            market_structure = "强势上涨"
        elif avg_change > 1:
            market_structure = "温和上涨"
        elif avg_change > -1:
            market_structure = "盘整震荡"
        elif avg_change > -3:
            market_structure = "温和下跌"
        else:
            market_structure = "强势下跌"

        # 分析市场分化程度
        divergence_level = "高" if market_divergence > 5 else "中等" if market_divergence > 2 else "低"

        # 分析成交量变化
        volume_analysis = "活跃" if all_volume > 50000000000 else "一般" if all_volume > 20000000000 else "低迷"

        # 分析市场阶段
        if btc_momentum > 10 and market_strength > 70:
            market_phase = "牛市上升阶段"
        elif btc_momentum > 0 and market_strength > 50:
            market_phase = "牛市盘整阶段"
        elif btc_momentum < -10 and market_strength < 30:
            market_phase = "熊市下跌阶段"
        elif btc_momentum < 0 and market_strength < 50:
            market_phase = "熊市盘整阶段"
        else:
            market_phase = "转换阶段"

        # 综合市场评估
        market_assessment = f"当前市场处于{market_phase}，整体呈{market_structure}态势。市场情绪{market_sentiment}，"
        market_assessment += f"BTC主导地位{btc_dominance:.1f}%，成交量{volume_analysis}，市场分化程度{divergence_level}。"
        market_assessment += f"\n\n表现最佳的前五大币种为：{', '.join([f'{coin['symbol']}({coin['priceChangePercent']}%)' for coin in top_performers])}。"
        market_assessment += f"\n表现最差的五大币种为：{', '.join([f'{coin['symbol']}({coin['priceChangePercent']}%)' for coin in worst_performers])}。"

        if market_divergence > 5:
            market_assessment += "\n\n市场呈现高度分化，各币种表现差异明显，建议关注强势币种的独立行情。"
        elif positive_count > len(major_data) * 0.7:
            market_assessment += "\n\n市场呈现一致性上涨，显示出较强的做多意愿，短期可能继续上行。"
        elif negative_count > len(major_data) * 0.7:
            market_assessment += "\n\n市场呈现一致性下跌，抛售压力较大，短期可能继续承压。"

        # 返回市场概况
        return {
            "timestamp": datetime.now().isoformat(),
            "market_overview": {
                "sentiment": market_sentiment,
                "strength_index": market_strength,
                "average_change": avg_change,
                "market_structure": market_structure,
                "market_phase": market_phase,
                "btc_dominance": btc_dominance,
                "eth_dominance": eth_dominance,
                "total_volume_usdt": all_volume,
                "market_divergence": market_divergence,
                "divergence_level": divergence_level,
                "btc_momentum_7d": btc_momentum,
                "btc_volatility_14d": btc_volatility
            },
            "major_coins": major_data,
            "top_performers": top_performers,
            "worst_performers": worst_performers,
            "coins_up": positive_count,
            "coins_down": negative_count,
            "market_assessment": market_assessment
        }

    except BinanceAPIException as e:
        return {"error": f"获取市场概况失败: {str(e)}"}
    except Exception as e:
        return {"error": f"分析市场数据时出错: {str(e)}"}
