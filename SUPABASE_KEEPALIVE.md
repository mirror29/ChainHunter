# Supabase数据库保活解决方案

## 问题说明

Supabase免费计划的数据库会在超过7天无活动后自动暂停，这会导致应用无法正常访问数据库。本解决方案提供了多种策略来防止数据库自动暂停。

## 解决方案架构

### 1. 多层保活策略

#### A. GitHub Actions自动化（推荐）
- **文件**: `.github/workflows/database-keepalive.yml`
- **频率**: 每6小时自动执行
- **特点**: 无需用户在线，最可靠的保活方式
- **配置**: 需要在GitHub Secrets中设置`APP_URL`

#### B. 客户端保活服务
- **组件**: `KeepAliveService`
- **位置**: 浏览器端定时任务
- **特点**: 用户在线时提供额外保障
- **配置**: 可自定义执行间隔（3-24小时）

#### C. 第三方监控服务
- **推荐**: Uptime Robot, Pingdom
- **端点**: `/api/database/keepalive`
- **特点**: 专业监控服务，提供额外保障

### 2. 核心API端点

#### `/api/database/keepalive`
- **GET**: 执行轻量级数据库查询
- **POST**: 执行复合操作预热数据库
- **返回**: 连接状态和响应时间

#### `/api/database/status`
- **功能**: 详细的数据库状态检查
- **返回**: 统计信息、活动状态、风险评估

### 3. 管理界面

#### `/admin` - 数据库管理页面
- 实时状态监控
- 保活服务控制
- 自动化配置管理
- 第三方服务指导

#### 聊天侧边栏集成
- 简化的状态指示器
- 快速访问管理页面
- 实时连接状态显示

## 部署配置

### 1. GitHub Actions配置

1. 确保工作流文件已提交：`.github/workflows/database-keepalive.yml`

2. 在GitHub仓库设置中配置Secrets：
   ```
   APP_URL=https://your-app-domain.com
   ALERT_WEBHOOK=https://your-webhook-url (可选)
   ```

3. 验证工作流执行：访问GitHub Actions页面查看执行历史

### 2. 环境变量设置

确保以下环境变量已正确配置：
```env
POSTGRES_PRISMA_URL=your_supabase_connection_string
POSTGRES_URL_NON_POOLING=your_supabase_direct_connection_string
```

### 3. 第三方监控配置（可选）

#### Uptime Robot设置
1. 注册Uptime Robot账户
2. 创建HTTP(S)监控
3. URL：`https://your-app-domain.com/api/database/keepalive`
4. 间隔：6小时（360分钟）

#### Pingdom设置
1. 注册Pingdom账户
2. 创建Uptime监控
3. URL：`https://your-app-domain.com/api/database/keepalive`
4. 检查间隔：6小时

## 使用指南

### 1. 启用保活服务

1. 访问`/admin`页面
2. 进入"保活服务"标签
3. 启用"自动保活"开关
4. 选择合适的执行间隔（推荐6小时）

### 2. 监控数据库状态

1. 在聊天侧边栏查看实时状态指示器
2. 访问`/admin`页面查看详细状态
3. 检查GitHub Actions执行历史

### 3. 应急处理

如果数据库已暂停：
1. 访问Supabase控制台手动恢复
2. 使用`/admin`页面的"激活数据库"按钮
3. 检查保活服务配置是否正确

## 最佳实践

### 1. 保活频率建议
- **推荐**: 6小时 - 平衡效果和资源消耗
- **保守**: 3小时 - 更安全但消耗更多资源
- **经济**: 12小时 - 节省资源但有一定风险

### 2. 多重保障策略
1. GitHub Actions作为主要保活机制
2. 客户端保活作为备用方案
3. 第三方监控提供额外保障

### 3. 监控和告警
1. 定期检查GitHub Actions执行状态
2. 监控数据库响应时间
3. 设置失败告警（Webhook通知）

## 故障排除

### 常见问题

#### 1. GitHub Actions执行失败
- 检查`APP_URL`是否正确设置
- 确认应用部署正常且可访问
- 查看Actions日志获取详细错误信息

#### 2. 数据库连接超时
- 检查Supabase项目状态
- 验证连接字符串是否正确
- 确认数据库未被手动暂停

#### 3. 保活请求失败
- 检查网络连接
- 验证API端点是否正常工作
- 查看浏览器控制台错误信息

### 诊断工具

1. **状态检查**: `GET /api/database/status`
2. **手动保活**: `POST /api/database/keepalive`
3. **管理界面**: `/admin`页面提供完整诊断

## 性能影响

### 资源消耗
- **每次保活**: 1-2个简单数据库查询
- **响应时间**: 通常<500ms
- **数据传输**: 每次<1KB

### 成本影响
- Supabase免费计划：保活查询消耗极少配额
- GitHub Actions：免费计划提供充足执行时间
- 第三方监控：大多提供免费套餐

## 升级路径

### 付费计划优势
- Supabase Pro计划：无自动暂停限制
- 更高的连接池限制
- 更好的性能和可靠性

### 迁移考虑
- 评估应用规模和使用频率
- 考虑长期维护成本
- 权衡免费方案的复杂性vs付费方案的简洁性

## 总结

本解决方案通过多层保活策略确保Supabase数据库保持活跃状态，避免7天自动暂停问题。GitHub Actions提供可靠的自动化保活，客户端服务和第三方监控提供额外保障。通过合理配置和监控，可以在免费计划下维持数据库的持续可用性。