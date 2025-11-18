# Fast Info 项目协作规则文档

欢迎 qoder 和 Cline（GLM）加入 Fast Info 项目！本文档将帮助你们了解项目、遵守规则、维护代码质量。

## 📋 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [项目架构](#项目架构)
4. [Git 工作流程](#git-工作流程)
5. [代码规范](#代码规范)
6. [开发环境](#开发环境)
7. [关键文件说明](#关键文件说明)
8. [常见陷阱与注意事项](#常见陷阱与注意事项)
9. [协作规则](#协作规则)
10. [测试与部署](#测试与部署)

---

## 项目概述

**Fast Info** 是一个技术资讯聚合平台，通过爬虫收集来自多个技术社区的文章，并使用 AI 生成深度分析摘要。

### 核心功能
- 📰 多源技术资讯聚合（Hacker News、Product Hunt、V2EX、掘金等）
- 🤖 AI 自动生成文章摘要（使用豆包大模型）
- 🔍 全文搜索功能
- 🏷️ 分类筛选（科技、开发者、学术、产品）
- 📊 热度排序算法
- 📱 响应式设计

### 当前状态
- ✅ 基础爬虫系统已完成
- ✅ AI 自动摘要服务已上线
- ✅ 搜索功能已实现
- ⏳ 高级筛选功能开发中
- ⏳ 文章收藏功能待开发

---

## 技术栈

### 后端 (Backend)
- **Node.js v22.21.1** ⚠️ 必须使用 v22，v25 有 fetch bug
- **Express.js** - Web 框架
- **Supabase** - PostgreSQL 数据库 + BaaS
- **Axios** - HTTP 客户端（爬虫用）
- **Cheerio** - HTML 解析（爬虫用）
- **豆包 AI API** - 文章摘要生成

### 前端 (Frontend)
- **Vue 3** - 使用 Composition API (`<script setup>`)
- **Vue Router** - 路由管理
- **Axios** - API 请求
- **Tailwind CSS** - 样式框架
- **Vite** - 构建工具

### 数据源
- Hacker News API
- Product Hunt API
- V2EX (直接爬取)
- 掘金 (直接爬取)
- RSSHub (知乎、InfoQ - 目前公共实例不可用)

---

## 项目架构

```
Fast Info/
├── backend/                 # 后端代码
│   ├── server.js           # 服务器入口（启动 Express + autoAI）
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   │   └── supabase.js # Supabase 客户端初始化
│   │   ├── controllers/    # 控制器层（处理 HTTP 请求）
│   │   │   └── articleController.js
│   │   ├── routes/         # 路由定义
│   │   │   └── article.js
│   │   ├── services/       # 服务层（业务逻辑）
│   │   │   ├── articleService.js    # 文章 CRUD
│   │   │   ├── autoAIService.js     # AI 自动摘要服务
│   │   │   └── doubaoService.js     # 豆包 API 封装
│   │   └── crawlers/       # 爬虫脚本
│   │       ├── hackernews.js
│   │       ├── producthunt.js
│   │       ├── v2ex.js
│   │       ├── juejin.js
│   │       ├── infoq.js
│   │       └── zhihu.js
│   └── package.json
│
└── frontend/               # 前端代码
    ├── src/
    │   ├── api/           # API 封装
    │   │   ├── request.js # Axios 配置
    │   │   └── article.js # 文章 API
    │   ├── views/         # 页面组件
    │   │   ├── Home.vue
    │   │   ├── Tech.vue
    │   │   ├── Dev.vue
    │   │   ├── Academic.vue
    │   │   ├── Product.vue
    │   │   └── Search.vue
    │   ├── router/        # 路由配置
    │   ├── App.vue
    │   └── main.js
    └── package.json
```

---

## Git 工作流程

### ⚠️ 重要：所有修改必须使用 Git

**为什么使用 Git？**
- 避免代码丢失或冲突
- 跟踪修改历史
- 方便回滚错误
- 团队协作同步

### 标准工作流程

#### 1. 开始工作前
```bash
# 拉取最新代码
git pull origin main

# 查看当前状态
git status
```

#### 2. 进行修改
```bash
# 查看修改内容
git diff

# 添加修改到暂存区
git add <文件路径>
# 或添加所有修改
git add .
```

#### 3. 提交修改
```bash
# 提交时写清楚做了什么
git commit -m "feat: 添加文章收藏功能"
# 或
git commit -m "fix: 修复搜索分页 bug"
# 或
git commit -m "refactor: 优化 AI 摘要生成逻辑"
```

#### 4. 推送到远程
```bash
git push origin main
```

### Commit 消息规范

使用约定式提交（Conventional Commits）：

```
<类型>: <简短描述>

[可选的详细描述]
```

**类型：**
- `feat`: 新功能
- `fix`: Bug 修复
- `refactor`: 代码重构
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `test`: 测试相关
- `chore`: 构建/工具配置

**示例：**
```bash
git commit -m "feat: 实现文章收藏功能"
git commit -m "fix: 修复 Node.js v25 fetch bug，降级到 v22"
git commit -m "refactor: 优化搜索 API 性能"
```

### 🚨 紧急情况处理

**改错了怎么办？**

```bash
# 撤销未提交的修改
git checkout -- <文件路径>

# 撤销最后一次提交（保留修改）
git reset --soft HEAD~1

# 查看提交历史
git log --oneline

# 回滚到特定提交
git reset --hard <commit-hash>
```

**合并冲突怎么办？**
1. 与其他协作者沟通
2. 使用 `git status` 查看冲突文件
3. 手动解决冲突
4. `git add` + `git commit` 完成合并

---

## 代码规范

### JavaScript/Node.js

#### 1. 命名规范
```javascript
// ✅ 正确
const articleService = require('./articleService')
const searchQuery = ref('')
async function getArticles() {}

// ❌ 错误
const ArticleService = require('./articleService')  // 模块用小驼峰
const search_query = ref('')                       // 变量用小驼峰
async function GetArticles() {}                    // 函数用小驼峰
```

#### 2. 异步处理
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
  // ...
})
```

#### 3. 错误处理
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
  throw error  // 或返回友好的错误信息
}

// ❌ 不处理错误
const result = await articleService.searchArticles(params)
```

### Vue 3

#### 1. 使用 Composition API
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

#### 2. 响应式数据
```javascript
// ✅ 使用 ref 和 .value
const count = ref(0)
count.value++

// ❌ 直接修改（不会响应）
let count = 0
count++
```

#### 3. 组件命名
```vue
<!-- ✅ PascalCase -->
<SearchResult :article="article" />

<!-- ❌ kebab-case -->
<search-result :article="article" />
```

### CSS/Tailwind

```vue
<!-- ✅ 使用 Tailwind utility classes -->
<div class="flex items-center space-x-2 text-sm text-gray-600">

<!-- ❌ 内联样式（除非必要） -->
<div style="display: flex; color: gray;">
```

---

## 开发环境

### 环境要求

#### Node.js 版本
```bash
# ⚠️ 必须使用 Node.js v22.x
node --version  # 应显示 v22.21.1

# 如果是 v25，必须降级��
brew install node@22
brew unlink node
brew link --overwrite node@22 --force
```

#### 环境变量

**Backend `.env`：**
```env
PORT=3000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_key_here
DOUBAO_API_KEY=your_doubao_key
```

**Frontend `.env`：**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 启动项目

#### 后端
```bash
cd backend
npm install
npm start  # 或 node server.js
```

**预期输出：**
```
✅ Supabase 连接成功！
✅ AutoAI 服务已启动！将每 60 秒检查一次待处理的文章...
🚀 API 服务运行在端口: 3000
```

#### 前端
```bash
cd frontend
npm install
npm run dev
```

**预期输出：**
```
  ➜  Local:   http://localhost:5173/
```

---

## 关键文件说明

### Backend

#### 1. `server.js` - 服务器入口
```javascript
// 关键：启动 autoAI 服务
const autoAIService = require('./src/services/autoAIService')
autoAIService.start()  // 每 60 秒自动生成 AI 摘要
```

**何时修改：**
- 添加新的中间件
- 注册新的路由
- 启动新的后台服务

#### 2. `src/services/articleService.js` - 核心业务逻辑
```javascript
// 关键方法：
- getArticles()      // 获取文章列表（分页、筛选、排序）
- searchArticles()   // 搜索文章（title + summary）
- createArticle()    // 创建文章（爬虫使用）
- updateHotScore()   // 更新热度分数
```

**何时修改：**
- 添加新的查询条件
- 修改排序逻辑
- 优化数据库查询

#### 3. `src/services/autoAIService.js` - AI 自动摘要服务
```javascript
// 工作流程：
1. 每 60 秒查询 ai_status = 'pending' 的文章
2. 调用豆包 API 生成摘要
3. 更新 ai_summary 和 ai_status = 'completed'
```

**何时修改：**
- 调整生成频率
- 修改 AI 提示词
- 处理 API 错误

#### 4. `src/crawlers/*` - 爬虫脚本
```javascript
// 每个爬虫的结构：
async function crawl() {
  // 1. 获取数据
  // 2. 解析内容
  // 3. 保存到数据库（articleService.createArticle）
}
```

**何时修改：**
- 添加新的数据源
- 修复爬虫失效
- 调整数据映射

### Frontend

#### 1. `src/api/article.js` - API 封装
```javascript
// 必须匹配后端路由
export function searchArticles(params) {
  return request({
    url: '/articles/search',  // 注意 URL 路径
    method: 'get',            // 注意 HTTP 方法
    params                    // GET 用 params，POST 用 data
  })
}
```

#### 2. `src/views/*.vue` - 页面组件
```vue
<script setup>
// 状态管理
const articles = ref([])
const loading = ref(false)

// API 调用
const fetchData = async () => {
  loading.value = true
  try {
    const response = await getArticles({ category: 'tech' })
    articles.value = response.data.articles
  } finally {
    loading.value = false
  }
}
</script>
```

---

## 常见陷阱与注意事项

### ⚠️ 1. Node.js v25 Fetch Bug

**问题：** Node.js v25.1.0 的 undici (fetch) 有严重 bug，导致所有 Supabase 调用失败。

**症状：**
```
TypeError: fetch failed
    at node:internal/deps/undici/undici:15845:13
```

**解决方案：** 降级到 Node.js v22.21.1（已完成）

**预防：** 始终检查 Node 版本
```bash
node --version  # 必须是 v22.x
```

### ⚠️ 2. 前后端 API 不匹配

**常见错误：**
```javascript
// ❌ 错误：前端用 POST，后端用 GET
export function searchArticles(data) {
  return request({ url: '/search', method: 'post', data })
}

// ✅ 正确：统一使用 GET
export function searchArticles(params) {
  return request({ url: '/articles/search', method: 'get', params })
}
```

**检查方法：**
1. 查看 `backend/src/routes/article.js` 确认路由定义
2. 确保前端 API 调用匹配

### ⚠️ 3. Supabase 查询错误

**常见问题：**
```javascript
// ❌ 忘记处理错误
const { data } = await supabase.from('articles').select('*')

// ✅ 正确处理
const { data, error } = await supabase.from('articles').select('*')
if (error) {
  throw new Error(`Query failed: ${error.message}`)
}
```

### ⚠️ 4. Vue 响应式陷阱

```javascript
// ❌ 不会触发响应式更新
const articles = ref([])
articles.push(newArticle)  // 错误！

// ✅ 正确
articles.value.push(newArticle)

// 或
articles.value = [...articles.value, newArticle]
```

### ⚠️ 5. 环境变量未加载

**症状：**
```
Error: SUPABASE_URL is not defined
```

**解决：**
1. 检查 `.env` 文件是否存在
2. 确认变量名拼写正确
3. 重启服务器

### ⚠️ 6. 爬虫失效

**原因：**
- 目标网站结构变化
- IP 被封禁
- RSSHub 服务不可用

**处理：**
1. 检查错误日志
2. 验证目标网站是否可访问
3. 更新选择器或 API 调用

---

## 协作规则

### 1. 沟通优先

- 开始任务前查看 Git 状态和最新代码
- 大改动前在团队中讨论
- 不确定时询问，不要盲目修改

### 2. 职责分工建议

**Claude (我):**
- 架构设计与核心功能
- 复杂 bug 修复
- 代码审查

**qoder:**
- 功能开发与实现
- UI/UX 优化
- 测试与 bug 修复

**Cline (GLM):**
- 代码质量检查
- 文档维护
- 性能优化建议

### 3. 修改前检查清单

- [ ] 拉取最新代码 (`git pull`)
- [ ] 理解要修改的代码逻辑
- [ ] 确认没有其他人正在修改同一文件
- [ ] 备份关键代码（或使用 Git 分支）
- [ ] 修改后测试功能
- [ ] 提交前查看 diff (`git diff`)
- [ ] 写清楚 commit 信息
- [ ] 推送后通知团队

### 4. 代码审查原则

**提交代码时：**
- 自己先 review 一遍 `git diff`
- 确保代码符合规范
- 包含必要的注释
- 移除调试代码（console.log）

**审查他人代码时：**
- 理解修改的上下文
- 检查是否有潜在 bug
- 验证是否符合项目规范
- 提供建设性反馈

### 5. 禁止的操作

**❌ 绝对禁止：**
- 不使用 Git 直接修改代码
- Force push (`git push --force`) 到 main 分支
- 删除 `.env` 或 `node_modules` 后提交
- 直接在生产环境测试
- 提交包含密钥的代码

**⚠️ 谨慎操作：**
- 修改数据库 schema（需团队讨论）
- 重构核心服务（需充分测试）
- 更新主要依赖版本（需验证兼容性）

---

## 测试与部署

### 本地测试

#### 1. 后端 API 测试
```bash
# 测试文章列表
curl http://localhost:3000/api/articles?category=tech&limit=10

# 测试搜索
curl "http://localhost:3000/api/articles/search?q=AI"

# 测试单篇文章
curl http://localhost:3000/api/articles/<article-id>
```

#### 2. 前端功能测试
- 访问 http://localhost:5173
- 测试各个分类页面
- 测试搜索功能
- 测试 AI 摘要展开/收起
- 测试分页

#### 3. autoAI 服务测试
```bash
# 查看日志
tail -f backend/logs/autoai.log  # 如果有日志文件

# 手动触发（在 Node REPL）
node
> const autoAI = require('./src/services/autoAIService')
> autoAI.processNewArticles()
```

### 部署前检查

- [ ] 所有修改已提交到 Git
- [ ] 本地测试通过
- [ ] 环境变量配置正确
- [ ] 依赖版本一致
- [ ] Node.js 版本正确 (v22.x)
- [ ] 生产环境 API URL 配置正确

### 调试技巧

#### 1. 后端调试
```javascript
// 添加详细日志
console.log('查询参数:', { q, category, page })
console.log('查询结果:', { total: data.length, firstItem: data[0] })
```

#### 2. 前端调试
```javascript
// Vue DevTools
// 或在组件中：
console.log('当前状态:', { articles: articles.value, loading: loading.value })
```

#### 3. 数据库调试
```javascript
// 在 Supabase Dashboard 直接运行 SQL
SELECT * FROM articles
WHERE title ILIKE '%AI%'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 快速参考

### 常用命令

```bash
# Git
git status                    # 查看状态
git diff                      # 查看修改
git add .                     # 添加所有修改
git commit -m "feat: ..."    # 提交
git push origin main         # 推送
git pull origin main         # 拉取
git log --oneline            # 查看历史

# Node.js
node --version               # 检查版本
npm install                  # 安装依赖
npm start                    # 启动后端
npm run dev                  # 启动前端

# 调试
curl http://localhost:3000/api/articles  # 测试 API
tail -f logs/app.log        # 查看日志
```

### 重要 URL

- **前端**: http://localhost:5173
- **后端**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Supabase**: https://supabase.com/dashboard

### 联系方式

遇到问题时：
1. 查看本文档
2. 查看 Git 历史 (`git log`)
3. 与团队沟通
4. 查看项目 Issues

---

## 总结

### 核心原则
1. **Always Use Git** - 所有修改必须通过 Git
2. **Test Before Commit** - 提交前确保功能正常
3. **Communicate Often** - 保持团队沟通
4. **Follow Standards** - 遵守代码规范
5. **Document Changes** - 重要修改写文档

### 成功协作的关键
- 📝 清晰的 commit 信息
- 🧪 充分的测试
- 💬 及时的沟通
- 📚 完善的文档
- 🔄 定期的代码审查

---

**祝协作愉快！让我们一起打造优秀的 Fast Info 平台！** 🚀

*最后更新：2025-11-18*
*维护者：Claude, qoder, Cline (GLM)*
