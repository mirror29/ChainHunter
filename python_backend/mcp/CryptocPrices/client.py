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
    """
    获取Binance客户端实例，支持无密钥的公开数据访问
    """
    try:
        if api_key and api_secret:
            # 有密钥时使用认证模式
            client = Client(api_key, api_secret)
            # 测试连接
            client.ping()
            print("成功连接到Binance API (认证模式)")
        else:
            # 无密钥时使用公开数据模式
            client = Client()
            # 测试连接
            client.ping()
            print("成功连接到Binance API (公开数据模式)")
        return client
    except BinanceAPIException as e:
        print(f"Binance API连接错误: {e}")
        # 如果连接失败，尝试无密钥模式
        try:
            client = Client()
            client.ping()
            print("降级使用公开数据模式连接Binance API")
            return client
        except Exception as fallback_error:
            print(f"Binance API完全连接失败: {fallback_error}")
            raise fallback_error

# 获取客户端实例
client = get_binance_client()
