# ChainHunter Vercel部署指南

本项目使用Vercel部署Next.js前端和Python后端服务。以下是部署步骤和注意事项。

## 项目结构

```
ChainHunter/
├── frontend/            # Next.js前端
├── python_backend/      # Python FastAPI后端
├── vercel.json          # Vercel部署配置
└── README.md
```

## 部署步骤

### 1. 准备工作

确保你有一个Vercel账户并已安装Vercel CLI：

```bash
npm install -g vercel
```

### 2. 环境变量设置

在Vercel仪表盘或通过CLI设置必要的环境变量：

- `DEEPSEEK_API_BASE` - Deepseek API的基础URL
- `DEEPSEEK_API_KEY` - Deepseek API密钥
- 其他前端或后端需要的环境变量

### 3. 部署命令

在项目根目录执行：

```bash
vercel
```

或者直接部署到生产环境：

```bash
vercel --prod
```

### 4. 特定配置

#### 前端配置

前端使用Next.js 15.2.4，确保API请求指向正确的后端URL。

#### 后端配置

后端使用FastAPI，通过Vercel Serverless Functions运行。

## 注意事项

1. **冷启动时间**：Python后端在Vercel上可能有较长的冷启动时间。

2. **执行时间限制**：Vercel免费计划的函数执行时间限制为10秒。

3. **数据库连接**：如果使用数据库，确保适当配置数据库URL和连接池。

4. **MCP服务器**：注意MCP服务器在Vercel上的启动可能需要特殊处理。

## 故障排除

如果遇到部署问题：

1. 检查Vercel的构建日志和函数日志
2. 确认环境变量设置正确
3. 检查API路由配置是否正确
