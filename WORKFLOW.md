# Fast Info 开发工作流

> 项目开发流程、任务分解和进度跟踪
> **版本**: v2.0.0 | **更新日期**: 2026-01-01

---

## 📊 项目状态

```
项目进度: ▰▰▰▰▰▰▰▰▰▰ 100%

v2.0.0 里程碑 ✅
- ✅ 自建 PostgreSQL 数据库
- ✅ 卖报员 Agent 核心功能
- ✅ AI 摘要服务
- ✅ Telegram 推送通知
- ✅ 多源爬虫系统

下一版本: v2.1.0 (规划中)
```

---

## 🗓️ 开发里程碑

### v2.0.0 - 卖报员 Agent (已完成)

**目标**: 从内容聚合平台升级为智能检索平台

**核心成果**:

#### 1. 自建数据库
- ✅ PostgreSQL 数据库部署
- ✅ 数据库连接池
- ✅ 指数退避重试机制
- ✅ 健康检查功能
- ✅ 降级到 Supabase 的备用方案

#### 2. 卖报员 Agent
- ✅ 自然语言理解
- ✅ 工具推理（豆包大模型）
- ✅ 搜索工具
- ✅ 分类筛选工具
- ✅ 时间筛选工具
- ✅ 来源筛选工具
- ✅ 热点获取工具
- ✅ 数据统计工具

#### 3. AI 摘要服务
- ✅ 自动摘要生成
- ✅ 后台调度服务
- ✅ 摘要存储与展示

#### 4. 推送通知系统
- ✅ Telegram Bot 集成
- ✅ 每日摘要推送
- ✅ 用户订阅管理

#### 5. 多源爬虫系统
- ✅ Hacker News API
- ✅ GitHub Trending 爬虫
- ✅ Dev.to API
- ✅ arXiv API
- ✅ V2EX 爬虫
- ✅ 掘金爬虫

---

## 📁 项目结构

```
Fast Info/
├── backend/
│   ├── server.js              # 服务器入口
│   ├── src/
│   │   ├── db/                # PostgreSQL 连接
│   │   ├── routes/            # API 路由
│   │   │   ├── article.js     # 文章 API
│   │   │   ├── ai.js          # AI API
│   │   │   ├── chat.js        # Agent 聊天
│   │   │   └── push.js        # 推送通知
│   │   ├── services/          # 业务逻辑
│   │   │   ├── newsboyAgent.js  # 卖报员 Agent
│   │   │   ├── articleService.js
│   │   │   ├── aiService.js
│   │   │   ├── autoAIService.js
│   │   │   └── pushService.js
│   │   ├── crawlers/          # 爬虫
│   │   │   └── scheduler.js   # 调度器
│   │   └── jobs/              # 定时任务
│   │       └── dailyDigest.js # 每日摘要推送
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── views/             # 页面
│   │   ├── components/        # 组件
│   │   ├── api/               # API 封装
│   │   ├── router/            # 路由
│   │   └── store/             # 状态管理
│   └── package.json
│
├── scripts/
│   ├── init.sql               # 数据库初始化
│   └── migrate.js             # 数据迁移
│
└── docs/
    └── .kiro/specs/           # 需求规格
```

---

## 🔧 开发工作流

### 1. 功能开发流程

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建功能分支
git checkout -b feature/your-feature

# 3. 开发
# ... 编写代码 ...

# 4. 测试
npm test                # 后端测试
cd frontend && npm test # 前端测试

# 5. 提交
git add .
git commit -m "feat: 添加xxx功能"

# 6. 推送
git push origin feature/your-feature

# 7. 合并到主分支
git checkout main
git merge feature/your-feature
git push origin main
```

### 2. Bug 修复流程

```bash
# 1. 创建修复分支
git checkout -b fix/bug-name

# 2. 修复 Bug
# ... 修复代码 ...

# 3. 测试验证
npm test

# 4. 提交
git commit -m "fix: 修复xxx问题"

# 5. 合并
git checkout main
git merge fix/bug-name
git push origin main
```

### 3. 发布流程

```bash
# 1. 更新版本号
npm version patch  # 或 minor / major

# 2. 构建
cd backend && npm test
cd ../frontend && npm run build

# 3. 提交
git add .
git commit -m "chore: 发布 v2.0.0"
git push origin main

# 4. 打标签
git tag v2.0.0
git push origin v2.0.0
```

---

## 📋 任务清单

### v2.1.0 规划

#### 高优先级
- [ ] MCP Server 集成
- [ ] 邮件推送支持
- [ ] 用户收藏功能
- [ ] 高级筛选界面

#### 中优先级
- [ ] 文章详情页
- [ ] 相关文章推荐
- [ ] 阅读历史记录
- [ ] 个性化推荐

#### 低优先级
- [ ] 深色模式
- [ ] 多语言支持
- [ ] 移动端优化
- [ ] PWA 支持

---

## 🚀 快速命令

### 后端开发

```bash
cd backend

# 开发模式
npm run dev

# 生产模式
npm start

# 爬虫
npm run crawler          # 定时调度
npm run crawler:now      # 立即运行
npm run crawler:test     # 测试爬虫

# 测试
npm test                 # 运行测试
npm run test:watch       # 监视模式

# 数据库迁移
npm run migrate          # 运行迁移
```

### 前端开发

```bash
cd frontend

# 开发模式
npm run dev

# 构建
npm run build

# 预览构建
npm run preview
```

### 数据库操作

```bash
# 初始化数据库
psql -U fastinfo -d fastinfo -f scripts/init.sql

# 连接数据库
psql -U fastinfo -d fastinfo

# 备份数据库
pg_dump -U fastinfo fastinfo > backup.sql

# 恢复数据库
psql -U fastinfo fastinfo < backup.sql
```

---

## 📊 API 端点

### 文章 API

```
GET  /api/articles           # 获取文章列表
GET  /api/articles/:id       # 获取文章详情
GET  /api/articles/hot       # 获取热门文章
GET  /api/articles/search    # 搜索文章
```

### Agent API

```
POST   /api/chat                    # 发送消息给 Agent
GET    /api/chat/suggestions        # 获取快捷建议
DELETE /api/chat/:sessionId         # 清除会话
```

### AI API

```
GET  /api/ai/stats                  # AI 统计信息
POST /api/ai/batch-generate         # 批量生成摘要
GET  /api/ai/generate-summary/:id   # 生成单篇文章摘要
```

### 推送 API

```
GET    /api/push/configs            # 获取推送配置
POST   /api/push/configs            # 创建推送配置
PUT    /api/push/configs/:id        # 更新推送配置
DELETE /api/push/configs/:id        # 删除推送配置
POST   /api/push/digest             # 手动触发摘要推送
```

---

## 🔍 常见问题

### Q: 如何添加新的数据源？

1. 在 `backend/src/crawlers/` 创建新的爬虫文件
2. 继承 BaseCrawler 类
3. 实现 `crawl()` 方法
4. 在 `scheduler.js` 中注册

### Q: 如何添加新的 Agent 工具？

1. 在 `newsboyAgent.js` 中定义工具
2. 实现工具函数
3. 在系统提示词中描述工具

### Q: 如何配置 Telegram 推送？

```env
# backend/.env
ENABLE_PUSH=true
TELEGRAM_BOT_TOKEN=your_bot_token
```

### Q: 如何切换数据库？

```env
# 使用 PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fastinfo
DB_USER=fastinfo
DB_PASSWORD=your_password

# 降级到 Supabase（不设置 DB_HOST）
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
```

---

## 📚 相关文档

- [PROJECT_PLAN.md](PROJECT_PLAN.md) - 项目策划书
- [PROJECT_RULES.md](PROJECT_RULES.md) - 开发规范
- [AI_GUIDE.md](AI_GUIDE.md) - AI 助手指南
- [README.md](README.md) - 项目说明

---

**许可证**: MIT License
**作者**: Johnny
**最后更新**: 2026-01-01
