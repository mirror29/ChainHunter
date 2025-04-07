from mangum import Mangum
import sys
import os

# 添加父目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 导入后端应用
from main import app

# 创建Mangum处理程序
handler = Mangum(app)
