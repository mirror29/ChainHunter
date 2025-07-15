# ChainHunter 🚀

一个基于 AI 的区块链智能助手平台，集成了自动化交易、套利发现、量化分析和链上监控等功能。

## ✨ 主要功能

### 🤖 AI 聊天助手
- 基于 DeepSeek 模型的智能对话系统
- 支持中英文双语交互
- 实时流式响应
- 聊天记录保存和管理

### 💰 加密货币分析
- **实时价格查询**: 获取主流加密货币的最新价格和市场数据
- **价格预测**: 基于技术指标和统计模型的价格预测分析
- **市场概况**: 综合市场分析，包括涨跌幅、成交量、市场情绪等
- **历史数据**: 获取和分析历史价格走势
- **综合分析**: 多维度市场分析报告

### 🔧 技术特性
- **MCP (Model Context Protocol)**: 模块化的工具集成架构
- **Next.js 前端**: 现代化的用户界面
- **FastAPI 后端**: 高性能的 API 服务
- **PostgreSQL 数据库**: 可靠的数据存储
- **Docker 部署**: 容器化部署支持

## 🏗️ 项目架构

```
ChainHunter/
├── frontend/                 # Next.js 前端应用
│   ├── src/
│   │   ├── app/             # 页面路由
│   │   ├── components/      # React 组件
│   │   ├── lib/            # 工具库
│   │   └── types/          # TypeScript 类型定义
│   ├── prisma/             # 数据库模式
│   └── package.json
├── python_backend/          # FastAPI 后端服务
│   ├── main.py             # 主应用入口
│   ├── mcp/                # MCP 服务器模块
│   │   └── CryptocPrices/  # 加密货币分析服务
│   └── requirements.txt
├── docker-compose.yml       # Docker 编排配置
└── README.md
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Python 3.12+
- PostgreSQL 13+
- Docker (可选)

### 1. 克隆项目
```bash
git clone https://github.com/your-username/ChainHunter.git
cd ChainHunter
```

### 2. 环境配置

#### 前端配置
```bash
cd frontend
npm install
# 配置环境变量
cp .env.example .env.local
```

#### 后端配置
```bash
cd python_backend
pip install -r requirements.txt
# 配置环境变量
cp .env.example .env
```

### 3. 环境变量设置

#### 前端 (.env.local)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
DATABASE_URL=postgresql://user:password@localhost:5432/chainhunter
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 后端 (.env)
```env
DEEPSEEK_API_BASE=https://api.deepseek.com
DEEPSEEK_API_KEY=your_deepseek_api_key
BINANCE_API_KEY=your_binance_api_key (可选)
BINANCE_API_SECRET=your_binance_api_secret (可选)
```

### 4. 启动服务

#### 使用 Docker (推荐)
```bash
docker-compose up -d
```

#### 手动启动
```bash
# 启动后端
cd python_backend
python main.py

# 启动前端
cd frontend
npm run dev
```

访问 http://localhost:3000 开始使用！

## 📋 API 文档

### 聊天接口
```http
POST /api/chat
Content-Type: application/json

{
  "message": "比特币当前价格是多少？",
  "stream": true
}
```

### 健康检查
```http
GET /health
```

## 🛠️ MCP 工具集

### CryptocPrices 服务
提供全面的加密货币分析功能：

- `get_current_price(symbol)`: 获取实时价格
- `get_multiple_prices(symbols)`: 批量价格查询
- `get_price_history(symbol, interval, limit)`: 历史价格数据
- `get_market_summary()`: 市场概况分析
- `get_price_prediction(symbol, days)`: 价格预测
- `get_comprehensive_analysis(symbols, days)`: 综合分析报告

## 🎯 使用示例

### 查询比特币价格
```
用户: 比特币当前的价格是多少？
助手: [返回实时BTC价格和24小时变动]
```

### 市场分析
```
用户: 请分析当前加密货币市场的整体趋势
助手: [返回市场概况、主要币种表现和投资建议]
```

### 价格预测
```
用户: 预测以太坊未来7天的价格走势
助手: [基于技术指标和统计模型的ETH价格预测]
```

## 🔧 开发指南

### 添加新的 MCP 服务
1. 在 `python_backend/mcp/` 下创建新的服务目录
2. 实现 FastMCP 工具函数
3. 在 `main.py` 中注册新服务
4. 更新相关配置

### 前端组件开发
- 使用 shadcn/ui 组件库
- 遵循 Next.js 13+ App Router 规范
- 支持暗色主题切换
- 响应式设计

### 后端 API 开发
- 使用 FastAPI 框架
- 支持异步处理
- 集成 OpenAI Agents 框架
- 统一错误处理

## 📊 技术栈

### 前端
- **Next.js 15**: React 框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **shadcn/ui**: 组件库
- **NextAuth.js**: 身份认证
- **Prisma**: ORM
- **Framer Motion**: 动画库

### 后端
- **FastAPI**: Web 框架
- **OpenAI Agents**: AI 代理框架
- **FastMCP**: MCP 服务器框架
- **Binance API**: 加密货币数据
- **pandas**: 数据分析
- **scikit-learn**: 机器学习

### 基础设施
- **PostgreSQL**: 数据库
- **Docker**: 容器化
- **Vercel**: 前端部署 (可选)
- **Railway**: 后端部署 (可选)

## 🚧 开发计划

### 近期计划 (Q1 2025)
- [x] 基础聊天功能
- [x] 加密货币价格查询
- [x] 用户认证系统
- [ ] 交易信号推送
- [ ] 更多技术指标

### 中期计划 (Q2 2025)
- [ ] DeFi 协议分析
- [ ] NFT 市场监控
- [ ] 社交媒体情绪分析
- [ ] 移动端应用

### 长期计划 (Q3-Q4 2025)
- [ ] 自动化交易执行
- [ ] 高级量化策略
- [ ] 机器学习模型优化
- [ ] 企业级功能

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- **项目主页**: https://github.com/your-username/ChainHunter
- **问题反馈**: https://github.com/your-username/ChainHunter/issues
- **邮箱**: your-email@example.com

## ⚠️ 免责声明

本项目仅供学习和研究目的。所有投资建议和价格预测仅供参考，不构成实际投资建议。加密货币投资存在高风险，请谨慎决策。

---

Made with ❤️ by ChainHunter Team
