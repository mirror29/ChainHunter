FROM python:3.12-slim

WORKDIR /app

# 安装 Node.js 和 npm
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 创建用户(Hugging Face要求)
RUN useradd -m -u 1000 user

# 安装 UV
RUN curl -sSf https://install.sysroot.io/uv | python -

# 设置用户和环境
USER user
ENV PATH="/home/user/.local/bin:$PATH"
ENV PORT=7860

WORKDIR /app

# 复制锁文件和依赖
COPY --chown=user uv.lock .
COPY --chown=user requirements.txt .

# 使用UV安装依赖
RUN python -m uv pip sync uv.lock

# 安装MCP服务
RUN npm install -g coincap-mcp @mzxrai/mcp-webresearch

# 复制应用代码
COPY --chown=user . .

# 运行应用(必须使用7860端口)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
