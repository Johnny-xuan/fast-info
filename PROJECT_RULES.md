# Fast Info 开发规范

> 项目开发规范与协作指南
> **版本**: v2.0.0 | **更新日期**: 2026-01-01

---

## 📋 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [项目架构](#项目架构)
4. [Git 工作流程](#git-工作流程)
5. [代码规范](#代码规范)
6. [开发环境](#开发环境)
7. [关键文件说明](#关键文件说明)
8. [常见陷阱与注意事项](#常见陷阱与注意事项)

---

## 项目概述

**Fast Info** 是一个技术资讯智能检索平台，通过「卖报员 Agent」帮助用户快速找到有价值的技术资讯。

### 核心功能

- 多源技术资讯聚合（HackerNews、GitHub Trending、Dev.to、V2EX、掘金、arXiv）
- AI 自动生成文章摘要（豆包大模型）
- 卖报员 Agent 对话式检索
- Telegram 推送通知
- 全文搜索与分类筛选

### 当前状态

- ✅ 自建 PostgreSQL 数据库
- ✅ 卖报员 Agent 核心
- ✅ AI 摘要服务
- ✅ Telegram 推送
- ✅ 多源爬虫系统

---

## 技术栈

### 后端

- **Node.js v20+** - 运行环境
- **Express.js** - Web 框架
- **PostgreSQL** - 主数据库（自建）
- **Supabase** - 备用数据库（降级方案）
- **pg (node-postgres)** - PostgreSQL 客户端
- **豆包 AI API** - 摘要生成 + Agent 推理

### 前端

- **Vue 3** - Composition API + `<script setup>`
- **Vite** - 构建工具
- **Tailwind CSS** - 原子化样式
- **Naive UI** - UI 组件库
- **Axios** - HTTP 客户端

### 外部服务

- **Telegram Bot API** - 消息推送
- **HackerNews/GitHub/Dev.to** - 数据源 API

---

## 项目架构

```
Fast Info/
├── backend/                    # 后端代码
│   ├── server.js              # 服务器入口
│   ├── src/
│   │   ├── config/            # 配置文件
│   │   │   └── supabase.js    # Supabase 客户端
│   │   ├── db/                # PostgreSQL 连接
│   │   │   └── index.js       # 数据库连接池
│   │   ├── controllers/       # 控制器
│   │   │   ├── articleController.js
│   │   │   └── aiController.js
│   │   ├── routes/            # 路由
│   │   │   ├── article.js
│   │   │   ├── ai.js
│   │   │   ├── chat.js        # Agent 聊天
│   │   │   └── push.js        # 推送通知
│   │   ├── services/          # 业务逻辑
│   │   │   ├── articleService.js
│   │   │   ├── aiService.js
│   │   │   ├── autoAIService.js
│   │   │   ├── newsboyAgent.js # 卖报员 Agent
│   │   │   └── pushService.js
│   │   ├── crawlers/          # 爬虫
│   │   │   ├── scheduler.js   # 调度器
│   │   │   ├── hackernews.js
│   │   │   ├── github-trending.js
│   │   │   └── ...
│   │   ├── jobs/              # 定时任务
│   │   │   └── dailyDigest.js
│   │   └── utils/             # 工具函数
│   └── package.json
│
├── frontend/                   # 前端代码
│   ├── src/
│   │   ├── views/             # 页面
│   │   │   ├── Home.vue
│   │   │   ├── Tech.vue
│   │   │   ├── Dev.vue
│   │   │   ├── Academic.vue
│   │   │   ├── Product.vue
│   │   │   └── Search.vue
│   │   ├── components/        # 组件
│   │   ├── api/               # API 封装
│   │   │   ├── request.js
│   │   │   └── article.js
│   │   ├── router/            # 路由配置
│   │   └── store/             # 状态管理
│   └── package.json
│
├── scripts/                    # 工具脚本
│   ├── init.sql               # 数据库初始化
│   └── migrate.js             # 数据迁移
│
└── docs/                       # 文档
    └── .kiro/specs/           # 需求规格
```

---

## Git 工作流程

### 标准工作流

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建功能分支（可选）
git checkout -b feature/your-feature

# 3. 进行修改
# ... 开发 ...

# 4. 查看修改
git status
git diff

# 5. 提交修改
git add .
git commit -m "feat: 添加xxx功能"

# 6. 推送
git push origin main
```

### Commit 消息规范

使用约定式提交：

```
<类型>: <简短描述>

类型:
- feat: 新功能
- fix: Bug 修复
- refactor: 代码重构
- docs: 文档更新
- style: 代码格式
- chore: 构建/工具
- test: 测试

示例:
feat: 实现 Telegram 推送通知
fix: 修复数据库连接池泄漏
docs: 更新 API 文档
```

---

## 代码规范

### JavaScript / Node.js

#### 命名规范

```javascript
// ✅ 正确
const articleService = require('./articleService')
const searchQuery = ref('')
async function getArticles() {}

// ❌ 错误
const ArticleService = require('./articleService')
const search_query = ref('')
async function GetArticles() {}
```

#### 异步处理

```javascript
// ✅ 使用 async/await
async function fetchArticles() {
  try {
    const response = await searchArticles({ q: 'AI' })
    return response.data
  } catch (error) {
    console.error('Failed:', error)
    throw error
  }
}

// ❌ 避免回调地狱
fetchArticles((err, data) => {
  if (err) { /* ... */ }
})
```

#### 错误处理

```javascript
// ✅ 完整的错误处理
try {
  const result = await articleService.searchArticles(params)
  if (!result) {
    throw new Error('No results found')
  }
  return result
} catch (error) {
  console.error('Search failed:', error)
  throw error
}
```

### Vue 3

#### 使用 Composition API

```vue
<script setup>
import { ref, onMounted } from 'vue'

// ✅ 正确
const articles = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  articles.value = await fetchArticles()
  loading.value = false
})
</script>
```

#### 响应式数据

```javascript
// ✅ 使用 ref
const count = ref(0)
count.value++

// ❌ 直接修改（不会响应）
let count = 0
count++
```

---

## 开发环境

### 环境要求

```bash
# Node.js 版本
node --version  # v20+

# PostgreSQL
psql --version  # 14+
```

### 环境变量

**Backend `.env`**:

```env
# 服务器
PORT=3000
NODE_ENV=development

# 数据库（优先使用 PostgreSQL）
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fastinfo
DB_USER=fastinfo
DB_PASSWORD=your_password

# 降级到 Supabase（可选）
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# AI 服务
DOUBAO_API_KEY=your_doubao_key
DOUBAO_API_BASE=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL=your_model_id

# 推送服务
ENABLE_PUSH=false
TELEGRAM_BOT_TOKEN=your_bot_token
```

**Frontend `.env.development`**:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 启动项目

```bash
# 后端
cd backend
npm install
npm run dev

# 前端
cd frontend
npm install
npm run dev

# 爬虫
cd backend
npm run crawler          # 定时调度
npm run crawler:now      # 立即运行
```

---

## 关键文件说明

### Backend

#### server.js - 服务器入口

```javascript
// 启动服务
const autoAIService = require('./src/services/autoAIService')
autoAIService.start()  // AI 摘要服务

// 推送服务（可选）
if (process.env.ENABLE_PUSH === 'true') {
  const dailyDigest = require('./src/jobs/dailyDigest')
  dailyDigest.start()
}
```

#### src/services/newsboyAgent.js - 卖报员 Agent

核心功能：
- 处理用户消息
- 调用豆包 API 进行工具推理
- 执行工具（搜索、筛选、统计等）
- 返回结果

#### src/db/index.js - 数据库连接

```javascript
const db = require('./src/db')

// 健康检查
await db.healthCheck()

// 执行查询
const result = await db.query('SELECT * FROM articles')
```

### Frontend

#### src/api/request.js - Axios 配置

```javascript
// 基础 URL 从环境变量读取
const baseURL = import.meta.env.VITE_API_BASE_URL
```

---

## 常见陷阱与注意事项

### 1. 数据库连接优先级

```javascript
// 优先使用 PostgreSQL，降级到 Supabase
const usePostgres = process.env.DB_HOST || process.env.USE_POSTGRES === 'true'
if (usePostgres) {
  // 使用 PostgreSQL
} else {
  // 降级到 Supabase
}
```

### 2. 前后端 API 匹配

```javascript
// ❌ 错误：方法不匹配
export function searchArticles(data) {
  return request({ url: '/search', method: 'post', data })
}

// ✅ 正确：使用 GET
export function searchArticles(params) {
  return request({ url: '/articles/search', method: 'get', params })
}
```

### 3. 环境变量

```bash
# ⚠️ 确保环境变量已配置
cat backend/.env

# 修改环境变量后需要重启服务
npm run dev
```

### 4. PostgreSQL 权限

```sql
-- 确保用户有足够权限
GRANT ALL PRIVILEGES ON DATABASE fastinfo TO fastinfo;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fastinfo;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fastinfo;
```

---

## 快速参考

### 常用命令

```bash
# Git
git status
git diff
git add .
git commit -m "feat: ..."
git push origin main

# 后端
cd backend
npm run dev        # 开发模式
npm start          # 生产模式
npm run crawler    # 启动爬虫
npm test           # 运行测试

# 前端
cd frontend
npm run dev        # 开发模式
npm run build      # 构建

# 数据库
psql -U fastinfo -d fastinfo -f scripts/init.sql
```

### 重要 URL

- 前端: http://localhost:5173
- 后端: http://localhost:3000
- API: http://localhost:3000/api
- 健康检查: http://localhost:3000/health

---

**许可证**: MIT License
**作者**: Johnny
**最后更新**: 2026-01-01
