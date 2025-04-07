from mangum import Mangum
import sys
import os

# 添加项目根目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    # 导入后端应用
    from python_backend.main import app
except ImportError:
    # 尝试直接导入
    sys.path.append("python_backend")
    from main import app

# 创建Mangum处理程序
handler = Mangum(app)
