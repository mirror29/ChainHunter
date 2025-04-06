# ChainHunter Vercel 部署指南

本文档提供了如何在 Vercel 上部署 ChainHunter 项目的步骤。

## 前端部署

1. 在 Vercel 上创建一个新项目
2. 连接你的 GitHub 仓库
3. 配置构建设置:
   - 构建命令: `cd frontend && pnpm install && pnpm build`
   - 输出目录: `frontend/.next`
   - 安装命令: `cd frontend && pnpm install`
   - 根目录: `/`
4. 添加环境变量:
   - `NEXT_PUBLIC_API_URL`: 设置为你的 Python 后端 API URL

### 解决构建错误

如果在构建过程中遇到 ESLint 错误，可以通过以下方法解决:

1. 方法1: 使用 `app.dockerfile` 而不是 `Dockerfile`
   - 此文件已配置为在构建时跳过 ESLint 检查 (`--no-lint`)

2. 方法2: 修改 `next.config.ts` 配置
   - 已添加 `eslint: { ignoreDuringBuilds: true }` 配置，构建时会忽略 ESLint 错误

3. 方法3: 在 Vercel 部署设置中添加环境变量
   - 添加 `NEXT_LINT=false` 环境变量

## Python 后端部署

由于 Vercel 主要支持前端应用和 Serverless 函数，Python 后端需要部署在支持长时间运行的服务器上:

1. 选项1: 使用云服务器 (AWS, GCP, Azure, 阿里云等)
   - 使用 Docker 部署:
     ```bash
     docker build -t chainhunter-backend ./python_backend
     docker run -p 8000:8000 -e DATABASE_URL=... -e DEEPSEEK_API_BASE=... -e DEEPSEEK_API_KEY=... chainhunter-backend
     ```

2. 选项2: 使用 Railway, Render, Fly.io 等平台
   - 这些平台支持直接从 Dockerfile 部署

## 数据库部署

1. 推荐使用云数据库服务，如 Vercel Postgres, Supabase, Railway 或其他 PostgreSQL 服务
2. 更新环境变量中的 `DATABASE_URL` 指向你的云数据库

## 在本地测试 Vercel 部署

可以使用 Vercel CLI 在本地测试部署:

```bash
npm i -g vercel
vercel dev
```

## 注意事项

1. 确保所有环境变量在 Vercel 上正确配置
2. Python 后端需要单独部署，确保 `NEXT_PUBLIC_API_URL` 指向正确的地址
3. 在生产环境中，请使用安全的数据库凭据和 API 密钥
4. 确保数据库允许从你的后端服务器和 Vercel 访问
5. 如果遇到 TypeScript 或 ESLint 错误，可以选择在构建时忽略这些错误，或者逐个修复代码问题
