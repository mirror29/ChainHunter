from fastmcp import FastMCP
from python_backend.mcp.CryptocPrices.tools import (
    get_current_price,
    get_multiple_prices,
    get_price_history,
    get_market_summary,
    get_price_prediction,
    get_comprehensive_analysis
)

# 初始化MCP服务
mcp = FastMCP("加密货币市场分析服务")

# 注册工具函数
mcp.tool()(get_current_price)
mcp.tool()(get_multiple_prices)
mcp.tool()(get_price_history)
mcp.tool()(get_market_summary)
mcp.tool()(get_price_prediction)
mcp.tool()(get_comprehensive_analysis)

if __name__ == "__main__":
    mcp.run()

