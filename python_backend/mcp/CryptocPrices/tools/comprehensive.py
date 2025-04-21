from typing import Dict, Any, List
from datetime import datetime
from python_backend.mcp.CryptocPrices.tools.market import get_market_summary
from python_backend.mcp.CryptocPrices.tools.prediction import get_price_prediction
from python_backend.mcp.CryptocPrices.tools.history import get_price_history

def get_comprehensive_analysis(symbols: List[str] = ["BTCUSDT", "ETHUSDT"], days: int = 7) -> Dict[str, Any]:
    """
    提供综合的市场和加密货币分析报告，整合市场概况、关键币种预测和历史数据分析

    参数:
        symbols: 要分析的加密货币列表
        days: 预测天数

    返回:
        包含综合分析的字典报告
    """
    try:
        # 获取市场概览
        market_data = get_market_summary()

        # 获取每个币种的预测
        predictions = {}
        historical_analyses = {}

        for symbol in symbols:
            predictions[symbol] = get_price_prediction(symbol=symbol, days=days)
            historical_analyses[symbol] = get_price_history(symbol=symbol, interval="1d", limit=30)

        # 从市场数据中提取关键信息
        market_phase = market_data.get("market_overview", {}).get("market_phase", "未知")
        market_sentiment = market_data.get("market_overview", {}).get("sentiment", "未知")
        market_structure = market_data.get("market_overview", {}).get("market_structure", "未知")

        # 生成综合分析结论
        # 1. 市场环境总结
        market_conclusion = f"市场环境: 加密货币市场当前处于{market_phase}，整体呈{market_structure}态势，市场情绪{market_sentiment}。"

        # 2. 主要币种预测摘要
        coin_conclusions = []
        for symbol in symbols:
            if "error" not in predictions[symbol]:
                pred = predictions[symbol]
                analysis = pred.get("analysis", "")
                risk_level = pred.get("risk_assessment", {}).get("risk_level", "中")
                price_7d = pred.get("predictions", [{}])[min(6, len(pred.get("predictions", [])) - 1)].get("predicted_price", 0)
                price_now = pred.get("current_price", 0)
                change_percent = ((price_7d - price_now) / price_now) * 100 if price_now > 0 else 0

                direction = "上涨" if change_percent > 0 else "下跌" if change_percent < 0 else "横盘"
                coin_conclusions.append(f"{symbol}预计在{days}天内可能{direction}{abs(change_percent):.2f}%，风险水平{risk_level}。{analysis}")

        # 3. 综合建议
        high_risk_symbols = [symbol for symbol in symbols if predictions.get(symbol, {}).get("risk_assessment", {}).get("risk_level", "中") == "高"]
        low_risk_potential_symbols = [symbol for symbol in symbols
                                    if predictions.get(symbol, {}).get("risk_assessment", {}).get("risk_level", "中") != "高"
                                    and predictions.get(symbol, {}).get("growth_analysis", {}).get("projected_growth", 0) > 0.02]

        recommendation = ""
        if market_sentiment in ["强烈看涨", "温和看涨"]:
            if low_risk_potential_symbols:
                recommendation = f"建议关注具有上涨潜力且风险较低的币种: {', '.join(low_risk_potential_symbols)}。"
            else:
                recommendation = "当前市场整体看涨，但所分析币种风险收益比不佳，建议谨慎观望或择机介入。"
        elif market_sentiment in ["强烈看跌", "温和看跌"]:
            recommendation = "当前市场整体看跌，建议降低仓位或暂时观望，等待市场企稳信号。"
        else:
            recommendation = "当前市场呈现震荡整理格局，建议择机介入表现强势的币种，严格止损控制风险。"

        if high_risk_symbols:
            recommendation += f" 以下币种风险较高，建议谨慎参与: {', '.join(high_risk_symbols)}。"

        # 4. 特别关注
        btc_pred = predictions.get("BTCUSDT", {})
        btc_special_note = ""
        if "BTCUSDT" in symbols and "error" not in btc_pred:
            btc_risk = btc_pred.get("risk_assessment", {}).get("risk_level", "中")
            btc_trend_score = btc_pred.get("technical_indicators", {}).get("ma_trend_score", 0)
            if abs(btc_trend_score) > 0.5:
                trend_direction = "看涨" if btc_trend_score > 0 else "看跌"
                btc_special_note = f"特别关注: 作为市场领导者，BTC目前技术指标{trend_direction}明显，风险水平{btc_risk}。BTC的走势可能引导整体市场方向。"

        # 整合报告
        comprehensive_report = {
            "timestamp": datetime.now().isoformat(),
            "report_period": f"{days}天综合分析",
            "market_overview": market_data.get("market_overview", {}),
            "market_assessment": market_data.get("market_assessment", ""),
            "coin_predictions": predictions,
            "historical_analyses": historical_analyses,
            "comprehensive_conclusion": {
                "market_conclusion": market_conclusion,
                "coin_analyses": coin_conclusions,
                "recommendation": recommendation,
                "btc_special_note": btc_special_note
            },
            "top_performers": market_data.get("top_performers", []),
            "worst_performers": market_data.get("worst_performers", [])
        }

        return comprehensive_report

    except Exception as e:
        return {"error": f"综合分析生成失败: {str(e)}"}
