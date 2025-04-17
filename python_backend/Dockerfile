FROM python:3.12-slim

WORKDIR /app

# 安装 Node.js 和 npm
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# 安装uv
RUN pip install uv

# 复制项目文件
COPY pyproject.toml .
COPY uv.lock .

# 使用UV安装依赖（使用--system参数）
RUN uv pip install --system .

# 安装MCP服务
# RUN npm install -g coincap-mcp @mzxrai/mcp-webresearch

# 复制应用代码
COPY . .

# 运行应用
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
