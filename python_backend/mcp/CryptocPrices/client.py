from binance import Client
from binance.exceptions import BinanceAPIException
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 尝试读取Binance API密钥（如不存在则使用测试模式）
api_key = os.getenv("BINANCE_API_KEY", "")
api_secret = os.getenv("BINANCE_API_SECRET", "")

# 初始化Binance客户端
def get_binance_client():
    try:
        client = Client(api_key, api_secret)
        # 测试连接
        client.ping()
        print("成功连接到Binance API")
        return client
    except BinanceAPIException as e:
        print(f"Binance API连接错误: {e}")
        # 如无密钥，使用测试模式
        client = Client()
        print("使用测试模式连接Binance API")
        return client

# 获取客户端实例
client = get_binance_client()
