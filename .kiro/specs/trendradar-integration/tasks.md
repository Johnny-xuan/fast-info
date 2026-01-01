# Implementation Tasks

## Phase 1: 基础设施搭建

### Task 1.1: PostgreSQL 数据库部署

- [x] 在 vpn1 服务器创建 docker-compose.yml
- [x] 配置 PostgreSQL 15-alpine 容器
- [x] 设置数据持久化卷
- [x] 配置环境变量和密码
- [ ] 启动数据库服务
- [ ] 验证连接

**Requirements**: Requirement 1
**Files**: `docker-compose.yml`, `.env`

### Task 1.2: 数据库表结构初始化

- [x] 创建 articles 表
- [x] 创建 conversations 表
- [x] 创建 push_configs 表
- [x] 添加全文搜索索引
- [x] 创建初始化 SQL 脚本

**Requirements**: Requirement 1
**Files**: `scripts/init.sql`

### Task 1.3: Supabase 数据迁移

- [x] 导出 Supabase 现有 233+ 文章数据
- [x] 转换数据格式适配新表结构
- [x] 导入到 PostgreSQL
- [ ] 验证数据完整性

**Requirements**: Requirement 1
**Files**: `scripts/migrate.js`

## Phase 2: 后端核心开发

### Task 2.1: 数据库连接层

- [x] 安装 pg 依赖
- [x] 创建数据库连接池
- [x] 实现连接重试机制
- [x] 添加连接健康检查

**Requirements**: Requirement 1
**Files**: `backend/src/db/index.js`

### Task 2.2: Agent 工具实现

- [x] 实现 search_articles 工具
- [x] 实现 filter_by_category 工具
- [x] 实现 filter_by_date 工具
- [x] 实现 filter_by_source 工具
- [x] 实现 get_trending 工具
- [x] 实现 get_daily_digest 工具
- [x] 实现 get_stats 工具

**Requirements**: Requirement 3
**Files**: `backend/src/services/tools/*.js`

### Task 2.3: Newsboy Agent 核心

- [x] 集成豆包大模型 API
- [x] 实现 Function Calling 逻辑
- [x] 实现工具调度器
- [x] 实现会话上下文管理
- [x] 实现降级处理

**Requirements**: Requirement 2
**Files**: `backend/src/services/newsboyAgent.js`

### Task 2.4: Chat API 接口

- [x] 创建 POST /api/chat 接口
- [x] 实现会话管理
- [x] 添加请求验证
- [x] 添加错误处理

**Requirements**: Requirement 2, Requirement 5
**Files**: `backend/src/routes/chat.js`

## Phase 3: MCP Server 开发

### Task 3.1: MCP Server 基础结构

- [x] 创建 Python 项目结构
- [x] 安装 FastMCP 依赖
- [x] 配置数据库连接
- [x] 创建基础 server.py

**Requirements**: Requirement 4
**Files**: `mcp_server/server.py`, `mcp_server/requirements.txt`

### Task 3.2: MCP 工具注册

- [x] 注册 search_articles 工具
- [x] 注册 filter_* 工具
- [x] 注册 get_trending 工具
- [x] 注册 get_stats 工具
- [x] 添加工具参数验证

**Requirements**: Requirement 4
**Files**: `mcp_server/server.py`

### Task 3.3: MCP 配置文件

- [x] 创建 config.yaml 配置
- [x] 支持环境变量覆盖
- [x] 添加配置示例文件

**Requirements**: Requirement 4
**Files**: `mcp_server/config.yaml`, `mcp_server/config.example.yaml`

## Phase 4: 推送服务开发

### Task 4.1: Telegram 推送

- [x] 创建 Telegram Bot
- [x] 实现消息发送功能
- [x] 实现 Markdown 格式化
- [x] 添加错误重试

**Requirements**: Requirement 6
**Files**: `backend/src/services/pushService.js`

### Task 4.2: 每日摘要功能

- [x] 实现定时任务调度
- [x] 实现摘要生成逻辑
- [x] 实现批量推送
- [x] 添加推送日志

**Requirements**: Requirement 6
**Files**: `backend/src/services/pushService.js`, `backend/src/jobs/dailyDigest.js`

### Task 4.3: 推送配置管理

- [x] 创建推送配置 API
- [x] 实现配置 CRUD
- [x] 添加配置验证

**Requirements**: Requirement 6
**Files**: `backend/src/routes/push.js`

## Phase 5: 前端开发

### Task 5.1: Chat 组件

- [x] 创建 ChatView 页面
- [x] 实现消息输入框
- [x] 实现消息列表
- [x] 实现加载状态

**Requirements**: Requirement 5
**Files**: `frontend/src/views/ChatView.vue`

### Task 5.2: 文章卡片组件

- [x] 创建 ArticleCard 组件
- [x] 实现文章信息展示
- [x] 添加点击跳转

**Requirements**: Requirement 5
**Files**: `frontend/src/components/ArticleCard.vue`

### Task 5.3: 快捷操作

- [x] 实现快捷按钮组件
- [x] 添加预设查询
- [x] 实现一键触发

**Requirements**: Requirement 5
**Files**: `frontend/src/components/QuickActions.vue`

## Phase 6: 项目规范化

### Task 6.1: Docker 部署配置

- [x] 创建完整 docker-compose.yml
- [x] 添加所有服务配置
- [x] 创建 Dockerfile
- [ ] 测试一键部署

**Requirements**: Requirement 7
**Files**: `docker-compose.yml`, `Dockerfile`, `backend/Dockerfile`, `frontend/Dockerfile`

### Task 6.2: 文档完善

- [x] 更新 README.md
- [x] 添加安装说明
- [x] 添加使用指南
- [x] 添加 API 文档

**Requirements**: Requirement 7
**Files**: `README.md`, `docs/API.md`

### Task 6.3: 配置示例

- [x] 创建 .env.example
- [x] 创建 config.example.yaml
- [x] 添加配置说明

**Requirements**: Requirement 7
**Files**: `.env.example`, `config.example.yaml`

## Phase 7: 测试与优化

### Task 7.1: 单元测试

- [x] 工具函数测试
- [x] Agent 逻辑测试
- [x] API 接口测试

**Files**: `backend/tests/*.test.js`, `mcp_server/tests/*.py`

### Task 7.2: 集成测试

- [ ] 完整对话流程测试
- [ ] 数据库操作测试
- [ ] 推送功能测试

**Files**: `backend/tests/integration/*.test.js`

### Task 7.3: 性能优化

- [ ] 数据库查询优化
- [ ] 添加缓存层
- [ ] 内存使用优化（适配 2GB）

---

## 实施顺序建议

1. **Week 1**: Phase 1 (基础设施) + Task 2.1 (数据库连接)
2. **Week 2**: Phase 2 (后端核心) - Agent 和工具
3. **Week 3**: Phase 3 (MCP Server) + Phase 4 (推送)
4. **Week 4**: Phase 5 (前端) + Phase 6 (规范化)
5. **Week 5**: Phase 7 (测试优化)

## 依赖关系

```
Task 1.1 → Task 1.2 → Task 1.3
    ↓
Task 2.1 → Task 2.2 → Task 2.3 → Task 2.4
    ↓
Task 3.1 → Task 3.2 → Task 3.3
    ↓
Task 4.1 → Task 4.2 → Task 4.3
    ↓
Task 5.1 → Task 5.2 → Task 5.3
    ↓
Task 6.1 → Task 6.2 → Task 6.3
    ↓
Task 7.1 → Task 7.2 → Task 7.3
```
