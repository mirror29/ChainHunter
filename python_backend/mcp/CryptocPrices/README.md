# 加密货币市场分析服务 (CryptocPrices)

这是一个基于Binance API的加密货币市场分析服务，通过MCP框架提供丰富的价格分析和图表生成功能。

## 功能特点

1. **价格查询**
   - 获取单个加密货币实时价格
   - 获取多个加密货币实时价格
   - 查看订单簿深度数据和买卖压力分析

2. **历史价格与技术分析**
   - 获取历史K线数据并进行技术分析
   - 支持多种技术指标：
     - 布林带 (BOLL)
     - 移动平均线 (MA7, MA20, MA50, MA100等)
     - 相对强弱指标 (RSI)
     - MACD指标
     - KDJ随机震荡指标
     - 抛物线转向指标 (PSAR)
     - 能量潮指标 (OBV)
     - 平均真实范围 (ATR)
   - 加密货币对比分析与相关性计算

3. **市场概况**
   - 主要加密货币市场概况和市场情绪分析
   - 不同类型加密货币板块的表现分析

4. **价格预测**
   - 基础价格预测模型
   - 高级预测分析，包括支撑位、阻力位和趋势通道

5. **图表生成**
   - 生成价格走势图，支持多种技术指标
   - 生成多币种对比图表
   - 返回Base64编码图像和图表数据，方便前端展示

## 项目结构

```
CryptocPrices/
├── main.py              # 主程序入口
├── README.md            # 项目说明
├── tools/               # 工具模块目录
│   ├── __init__.py      # 工具模块初始化
│   ├── current_price.py # 当前价格查询工具
│   ├── historical_price.py # 历史价格分析工具
│   ├── market_summary.py # 市场概况工具
│   ├── price_prediction.py # 价格预测工具
│   └── chart_generator.py # 图表生成工具
└── utils/               # 实用工具目录
    ├── __init__.py      # 实用工具初始化
    ├── client.py        # Binance客户端工具
    ├── technical_indicators.py # 技术指标计算模块
    ├── market_analysis.py # 市场分析工具
    └── prediction_models.py # 预测模型工具
```

## 模块说明

### 工具模块 (tools)

1. **current_price.py**
   - 获取实时价格和订单簿数据
   - 计算买卖压力

2. **historical_price.py**
   - 获取历史价格和技术指标
   - 提供多币种对比分析

3. **market_summary.py**
   - 市场整体概况
   - 不同板块分析

4. **price_prediction.py**
   - 基本和高级价格预测
   - 支持多种预测模型

5. **chart_generator.py**
   - 价格走势图生成
   - 对比图表生成

### 实用工具 (utils)

1. **client.py**
   - Binance API客户端管理
   - 实现单例模式

2. **technical_indicators.py**
   - 计算各种技术指标
   - 包含BOLL, RSI, MACD, KDJ等

3. **market_analysis.py**
   - 趋势分析工具
   - 支撑位和阻力位识别

4. **prediction_models.py**
   - 预测算法实现
   - 预测结果处理

## 使用方法

本服务通过ChainHunter MCP框架自动加载，无需手动启动。

## API密钥设置（可选）

如需使用自己的Binance API密钥（非必需），请在项目根目录的`.env`文件中设置：

```
BINANCE_API_KEY=你的Binance API Key
BINANCE_API_SECRET=你的Binance API Secret
```

注意：未设置API密钥时，将使用Binance公共API，可能存在访问限制。

## 图表功能

本服务提供两种方式的图表展示：

1. **Base64编码图像**
   - 直接生成完整的图表图像
   - 可在前端直接嵌入显示
   - 支持K线图、多指标和对比图

2. **JSON格式数据**
   - 提供结构化的数据点
   - 支持前端使用图表库（如Chart.js、ECharts等）自定义渲染
   - 包含所有技术指标的数据点

### 图表示例

通过调用`generate_price_chart`工具可以生成多种图表：
- 蜡烛图 + 布林带
- 蜡烛图 + 移动平均线
- 蜡烛图 + RSI + MACD + 成交量
- 多币种对比图和相关性热图

## 示例查询

以下是通过ChainHunter助手使用本服务的一些示例问题：

1. "比特币现在多少价格？"
2. "显示以太坊30天的价格走势图"
3. "分析比特币的布林带和MACD指标"
4. "比较BTC、ETH和SOL过去一个月的表现"
5. "查看比特币的支撑位和阻力位"
6. "预测下一周以太坊的价格走势"
7. "显示主要加密货币的市场概况"
8. "哪个板块的加密货币表现最好？"
9. "分析SOL币的KDJ指标"
10. "比特币现在是超买还是超卖状态？"

## 依赖项

- python-binance
- pandas
- numpy
- matplotlib
- scikit-learn
- fastmcp

## 免责声明

本服务提供的价格预测和技术分析仅供参考，不构成投资建议。加密货币市场波动性大，投资决策请谨慎并进行充分研究。
