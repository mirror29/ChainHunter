# 加密货币价格分析服务

本模块提供了一套完整的加密货币价格分析工具，包括当前价格查询、历史数据分析、市场概况、价格预测和综合分析功能。系统采用多种技术指标和统计模型，提供专业的市场分析与预测。

## 代码结构

项目结构如下：

```
CryptocPrices/
├── client.py         # Binance API 客户端配置
├── main.py           # 主入口文件
├── README.md         # 项目说明文档
├── run.py            # 直接运行脚本
└── tools/            # 工具函数目录
    ├── __init__.py   # 工具函数导出
    ├── current_price.py # 当前价格相关工具
    ├── history.py    # 历史价格分析工具
    ├── market.py     # 市场概况工具
    ├── prediction.py # 价格预测工具
    └── comprehensive.py # 综合分析工具
```

## 功能模块

1. **客户端配置** (client.py)
   - Binance API 客户端初始化
   - 自动支持测试模式（无 API 密钥时）

2. **当前价格查询** (tools/current_price.py)
   - `get_current_price`: 获取单个加密货币当前价格
   - `get_multiple_prices`: 批量获取多个加密货币价格

3. **历史价格分析** (tools/history.py)
   - `get_price_history`: 获取历史K线数据并计算技术指标，包括移动平均线、RSI和MACD等

4. **市场概览** (tools/market.py)
   - `get_market_summary`: 提供全面的市场分析，包括主要加密货币涨跌幅、市场情绪、BTC主导地位、市场分化程度等
   - 分析市场整体结构、阶段和发展趋势

5. **价格预测** (tools/prediction.py)
   - `get_price_prediction`: 基于多重技术指标和统计模型进行价格预测
   - 结合ARIMA时间序列预测和技术分析，提供更准确的预测结果
   - 包含风险评估、趋势分析和支撑/阻力位识别

6. **综合分析** (tools/comprehensive.py)
   - `get_comprehensive_analysis`: 整合市场概览和多币种预测，提供全面的分析报告
   - 生成市场环境评估、币种预测摘要、投资建议和特别关注点

## 技术指标

本系统使用多种专业技术指标进行分析，包括：

- **移动平均线系统**: MA5, MA10, MA20, MA30, MA60, MA120及其交叉形态
- **MACD指标**: 动量与趋势确认，金叉/死叉信号
- **相对强弱指数(RSI)**: 超买/超卖信号识别
- **布林带指标**: 价格通道与波动分析
- **波动率分析**: 价格波动性与市场风险评估
- **市场结构分析**: 多头/空头排列，牛熊市阶段判断
- **ARIMA时间序列模型**: 结合统计建模的预测分析

## 使用方法

有三种方式运行本服务：

### 1. 使用run.py脚本直接运行

```bash
cd python_backend/mcp/CryptocPrices
python run.py
```

### 2. 作为Python模块导入使用

```python
# 导入MCP实例
from python_backend.mcp.CryptocPrices.main import mcp

# 调用工具函数
result = mcp.tools.get_current_price("BTCUSDT")
print(result)

# 获取综合分析报告
report = mcp.tools.get_comprehensive_analysis(["BTCUSDT", "ETHUSDT", "BNBUSDT"], days=7)
print(report)
```

### 3. 作为包运行（从项目根目录）

```bash
python -m python_backend.mcp.CryptocPrices.run
```

## 环境变量

服务支持通过环境变量配置 Binance API 密钥：

- `BINANCE_API_KEY`: Binance API Key
- `BINANCE_API_SECRET`: Binance API Secret

如果未设置环境变量，将使用测试模式连接 Binance API。

## 依赖项

本项目依赖以下主要库：
- python-binance: Binance API交互
- pandas, numpy: 数据处理与计算
- statsmodels: ARIMA模型与时间序列分析
- fastmcp: MCP服务框架

完整依赖列表请参见项目根目录的pyproject.toml文件。

## 免责声明

本服务提供的分析和预测仅供参考，不构成投资建议。加密货币市场波动性大，交易决策请结合多种因素并自行承担风险。
