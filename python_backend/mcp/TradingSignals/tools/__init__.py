from typing import Dict, Any, List
from datetime import datetime, timedelta
import json
import math

def calculate_rsi(prices: List[float], period: int = 14) -> float:
    """计算相对强弱指标(RSI)"""
    if len(prices) < period + 1:
        return 50.0
    
    gains = []
    losses = []
    
    for i in range(1, len(prices)):
        change = prices[i] - prices[i-1]
        if change > 0:
            gains.append(change)
            losses.append(0)
        else:
            gains.append(0)
            losses.append(abs(change))
    
    avg_gain = sum(gains[-period:]) / period
    avg_loss = sum(losses[-period:]) / period
    
    if avg_loss == 0:
        return 100.0
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_macd(prices: List[float], fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, float]:
    """计算MACD指标"""
    if len(prices) < slow:
        return {"macd": 0, "signal": 0, "histogram": 0}
    
    # 计算EMA
    def ema(data: List[float], period: int) -> float:
        multiplier = 2 / (period + 1)
        ema_val = data[0]
        for price in data[1:]:
            ema_val = (price * multiplier) + (ema_val * (1 - multiplier))
        return ema_val
    
    fast_ema = ema(prices[-fast:], fast)
    slow_ema = ema(prices[-slow:], slow)
    macd_line = fast_ema - slow_ema
    
    # 简化的信号线计算
    signal_line = macd_line * 0.8  # 简化计算
    histogram = macd_line - signal_line
    
    return {
        "macd": macd_line,
        "signal": signal_line,
        "histogram": histogram
    }

def calculate_bollinger_bands(prices: List[float], period: int = 20, std_dev: float = 2) -> Dict[str, float]:
    """计算布林带指标"""
    if len(prices) < period:
        return {"upper": 0, "middle": 0, "lower": 0}
    
    recent_prices = prices[-period:]
    sma = sum(recent_prices) / period
    
    variance = sum((price - sma) ** 2 for price in recent_prices) / period
    std = math.sqrt(variance)
    
    return {
        "upper": sma + (std * std_dev),
        "middle": sma,
        "lower": sma - (std * std_dev)
    }

def calculate_moving_averages(prices: List[float]) -> Dict[str, float]:
    """计算移动平均线"""
    result = {}
    
    for period in [5, 10, 20, 50]:
        if len(prices) >= period:
            result[f"ma_{period}"] = sum(prices[-period:]) / period
        else:
            result[f"ma_{period}"] = prices[-1] if prices else 0
    
    return result

def analyze_volume_trend(volumes: List[float]) -> Dict[str, Any]:
    """分析成交量趋势"""
    if len(volumes) < 10:
        return {"trend": "insufficient_data", "strength": 0}
    
    recent_vol = sum(volumes[-5:]) / 5
    historical_vol = sum(volumes[-20:-5]) / 15 if len(volumes) >= 20 else recent_vol
    
    volume_ratio = recent_vol / historical_vol if historical_vol > 0 else 1
    
    if volume_ratio > 1.5:
        trend = "increasing"
        strength = min(volume_ratio - 1, 1)
    elif volume_ratio < 0.7:
        trend = "decreasing" 
        strength = min(1 - volume_ratio, 1)
    else:
        trend = "stable"
        strength = 0.5
    
    return {
        "trend": trend,
        "strength": strength,
        "volume_ratio": volume_ratio
    }

def generate_technical_signal(symbol: str, prices: List[float], volumes: List[float], timeframe: str = "1h") -> Dict[str, Any]:
    """基于技术指标生成交易信号"""
    try:
        if len(prices) < 30:
            return {"error": "价格数据不足，无法生成信号"}
        
        current_price = prices[-1]
        
        # 计算技术指标
        rsi = calculate_rsi(prices)
        macd = calculate_macd(prices)
        bollinger = calculate_bollinger_bands(prices)
        ma = calculate_moving_averages(prices)
        volume_analysis = analyze_volume_trend(volumes)
        
        # 信号强度计算
        signal_strength = 0
        signal_type = "HOLD"
        analysis_points = []
        
        # RSI信号
        if rsi < 30:
            signal_strength += 0.3
            signal_type = "BUY"
            analysis_points.append(f"RSI({rsi:.1f})显示超卖")
        elif rsi > 70:
            signal_strength += 0.3
            signal_type = "SELL"
            analysis_points.append(f"RSI({rsi:.1f})显示超买")
        
        # MACD信号
        if macd["histogram"] > 0 and macd["macd"] > macd["signal"]:
            signal_strength += 0.25
            if signal_type != "SELL":
                signal_type = "BUY"
            analysis_points.append("MACD显示买入信号")
        elif macd["histogram"] < 0 and macd["macd"] < macd["signal"]:
            signal_strength += 0.25
            if signal_type != "BUY":
                signal_type = "SELL"
            analysis_points.append("MACD显示卖出信号")
        
        # 布林带信号
        if current_price < bollinger["lower"]:
            signal_strength += 0.2
            if signal_type != "SELL":
                signal_type = "BUY"
            analysis_points.append("价格触及布林带下轨，可能反弹")
        elif current_price > bollinger["upper"]:
            signal_strength += 0.2
            if signal_type != "BUY":
                signal_type = "SELL"
            analysis_points.append("价格触及布林带上轨，可能回调")
        
        # 移动平均线信号
        if current_price > ma["ma_20"] and ma["ma_5"] > ma["ma_20"]:
            signal_strength += 0.15
            if signal_type != "SELL":
                signal_type = "BUY"
            analysis_points.append("价格站上均线，趋势向好")
        elif current_price < ma["ma_20"] and ma["ma_5"] < ma["ma_20"]:
            signal_strength += 0.15
            if signal_type != "BUY":
                signal_type = "SELL"
            analysis_points.append("价格跌破均线，趋势转弱")
        
        # 成交量确认
        if volume_analysis["trend"] == "increasing" and signal_type in ["BUY", "SELL"]:
            signal_strength += 0.1
            analysis_points.append(f"成交量{volume_analysis['trend']}，确认信号")
        
        # 风险评估
        volatility = (max(prices[-10:]) - min(prices[-10:])) / current_price
        if volatility > 0.1:
            risk_level = "HIGH"
        elif volatility > 0.05:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        # 目标价格和止损
        target_price = None
        stop_loss = None
        
        if signal_type == "BUY":
            target_price = current_price * 1.05  # 5%目标
            stop_loss = current_price * 0.97     # 3%止损
        elif signal_type == "SELL":
            target_price = current_price * 0.95  # 5%目标
            stop_loss = current_price * 1.03     # 3%止损
        
        # 信号过期时间
        timeframe_minutes = {
            "1m": 5, "5m": 30, "15m": 60, 
            "1h": 240, "4h": 720, "1d": 1440
        }
        expires_minutes = timeframe_minutes.get(timeframe, 60)
        expires_at = datetime.now() + timedelta(minutes=expires_minutes)
        
        return {
            "symbol": symbol,
            "signal_type": signal_type,
            "strength": min(signal_strength, 1.0),
            "price": current_price,
            "target_price": target_price,
            "stop_loss": stop_loss,
            "risk_level": risk_level,
            "timeframe": timeframe,
            "analysis": " | ".join(analysis_points) or "技术指标显示横盘整理",
            "indicators": {
                "rsi": rsi,
                "macd": macd,
                "bollinger_bands": bollinger,
                "moving_averages": ma,
                "volume_analysis": volume_analysis
            },
            "expires_at": expires_at.isoformat()
        }
        
    except Exception as e:
        return {"error": f"生成技术信号失败: {str(e)}"}