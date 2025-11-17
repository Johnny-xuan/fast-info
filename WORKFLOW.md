# Fast Info 开发工作流

> 本文档记录项目的开发流程、任务分解和进度跟踪

**项目周期**：4周（MVP）
**开始日期**：2025-11-15
**目标完成**：2025-12-15

---

## 📊 总体进度

```
项目进度: ▰▰▰▰▰▰▱▱▱▱ 60%

Week 1: ▰▰▰▰▰▰▰ 7/7 ✅
Week 2-3: ▱▱▱▱▱▱▱ 0/8 (AI功能 + 前端优化)
Week 4: ▱▱▱▱▱▱▱ 0/7 (测试部署)
```

**当前阶段**：Week 1 完成 → Week 2 开始
**产品定位**：技术情报分析平台（不是内容转载平台）
**下一里程碑**：AI 智能分析功能 + 前端优化
**最后更新**：2025-11-16

**⚠️ 重要提醒**：本项目必须严格遵守中美法律法规，特别是版权法。详见下方"法律合规要求"。

---

## 🚨 法律合规要求（必读）

**Fast Info 必须严格遵守中国和美国的版权法和知识产权法。**

### 核心原则

1. **产品定位**：技术情报分析平台，不是内容转载平台
2. **核心价值**：原创分析 + 趋势发现，不是内容搬运
3. **内容使用**：只展示标题、链接、API摘要，不抓取完整原文
4. **AI功能**：生成原创分析，不改写/转述原文
5. **来源标注**：所有内容必须明确标注来源和作者

### 必须遵守的规则

**✅ 允许**：
- 展示标题、作者、时间、链接
- API 官方摘要
- 原创技术分析和评论
- 趋势统计和评分

**❌ 禁止**：
- 抓取并展示完整原文
- 翻译完整文章
- 移除作者署名
- 绕过付费墙

### 必须实现的功能

- [ ] 版权声明页面（/copyright）
- [ ] 服务条款页面（/terms）
- [ ] 隐私政策页面（/privacy）
- [ ] 版权投诉渠道（/dmca）
- [ ] 所有内容标注来源

---

## 🗓️ 开发里程碑

### Week 1：项目搭建 (2025-11-15 ~ 2025-11-22) ✅

**目标**：完成开发环境搭建和基础框架

**关键成果**：
- ✅ 项目策划书和工作流文档
- ✅ 前端项目框架搭建完成（Vue 3 + Vite + TailwindCSS + Geist 字体）
- ✅ 后端项目框架搭建完成（Express + Supabase）
- ✅ 数据库设计完成（Supabase PostgreSQL + RLS + 索引优化）
- ✅ **6 个数据源全部完成**（Hacker News, GitHub Trending, Dev.to, arXiv, AIBase, Product Hunt）
- ✅ 基础页面可以展示真实数据（5 个分类）
- ✅ 自动分类系统（tech/dev/opensource/academic/product）
- ✅ 调度器系统（定时自动抓取）
- ✅ 数据清理系统（48小时自动清理）

### Week 2-3：AI 智能分析 + 前端优化 (2025-11-17 ~ 2025-12-01) 🔄

**目标**：从简单聚合升级为智能分析平台

**核心功能调整**：
- 定位从"内容聚合"转变为"技术情报分析"
- 增加 AI 智能分析功能（合法合规）
- 优化前端展示和用户体验

**关键成果**：
- ⬜ **AI 智能分析功能**
  - AI 概括性摘要（200-300字）
  - AI 技术分析（原创内容）
  - 趋势预测评分
  - 热度分析可视化
- ⬜ **前端页面完善**
  - Product 分类页面
  - 搜索功能
  - 分页/无限滚动
  - 响应式设计
- ⬜ **法律合规**
  - 版权声明页面
  - 服务条款
  - 隐私政策
  - DMCA 投诉渠道
- ⬜ **用户体验优化**
  - 加载状态优化
  - 错误处理完善
  - 性能优化

### Week 3：功能完善 (2025-12-01 ~ 2025-12-08)

**目标**：完善功能和优化体验

**关键成果**：
- ⬜ 搜索功能可用
- ⬜ 响应式设计完成
- ⬜ 基础性能优化
- ⬜ UI/UX 优化

### Week 4：测试部署 (2025-12-09 ~ 2025-12-15)

**目标**：上线可访问的版本

**关键成果**：
- ⬜ 功能测试通过
- ⬜ 部署到免费平台
- ⬜ 域名配置完成
- ⬜ 项目文档完善

---

## 📋 详细任务清单

### Phase 1：环境准备（Day 1-2）

#### 1.1 开发环境配置
- [ ] **安装 Node.js**
  - 状态：⬜ 未开始
  - 负责人：Johnny
  - 说明：安装 Node.js 18+ LTS 版本
  - 验收：执行 `node -v` 和 `npm -v` 正常

- [ ] **安装 Git**
  - 状态：⬜ 未开始
  - 负责人：Johnny
  - 说明：用于版本管理
  - 验收：执行 `git --version` 正常

- [ ] **安装 VS Code**
  - 状态：⬜ 未开始
  - 负责人：Johnny
  - 说明：推荐插件：Volar, ESLint, Prettier
  - 验收：VS Code 可正常打开项目

- [ ] **注册必要账号**
  - 状态：⬜ 未开始
  - 负责人：Johnny
  - 说明：GitHub, Vercel, MongoDB Atlas
  - 验收：所有账号注册成功

#### 1.2 GitHub Student Pack 申请
- [ ] **申请学生认证**
  - 状态：⬜ 未开始
  - 负责人：Johnny
  - 链接：https://education.github.com/pack
  - 说明：使用学校邮箱申请
  - 验收：收到批准邮件

- [ ] **激活 DigitalOcean**
  - 状态：⬜ 未开始
  - 说明：获取 $200 信用额度
  - 验收：账户余额显示

- [ ] **激活 MongoDB Atlas**
  - 状态：⬜ 未开始
  - 说明：升级到学生版
  - 验收：可以创建集群

---

### Phase 2：前端项目搭建（Day 2-3）

#### 2.1 创建 Vue 项目
- [x] **初始化项目**
  - 状态：✅ 已完成
  - 命令：`npm create vite@latest frontend -- --template vue`
  - 位置：`/frontend`
  - 验收：项目可以启动 ✓

- [x] **安装依赖**
  - 状态：✅ 已完成
  - 依赖列表：
    ```bash
    npm install vue-router@4 pinia axios dayjs
    npm install -D tailwindcss@3 postcss autoprefixer
    npm install naive-ui geist
    ```
  - 验收：所有依赖安装成功 ✓

- [x] **配置 TailwindCSS**
  - 状态：✅ 已完成
  - 文件：`tailwind.config.js`, `postcss.config.js`
  - 验收：样式可以生效 ✓
  - 备注：降级到 TailwindCSS v3 以兼容 PostCSS

- [x] **配置路由**
  - 状态：✅ 已完成
  - 文件：`src/router/index.js`
  - 路由：/, /tech, /dev, /academic, /search
  - 验收：路由跳转正常 ✓

#### 2.2 创建基础结构
- [x] **创建目录结构**
  - 状态：✅ 已完成
  - 结构：
    ```
    frontend/
    ├── src/
    │   ├── views/        # 页面 ✓
    │   ├── components/   # 组件 ✓
    │   ├── api/          # API 调用 ✓
    │   ├── store/        # Pinia store ✓
    │   ├── router/       # 路由 ✓
    │   ├── assets/       # 静态资源 ✓
    │   └── utils/        # 工具函数 ✓
    ```
  - 验收：文件夹创建完成 ✓

- [x] **创建基础页面**
  - 状态：✅ 已完成
  - 页面：
    - `Home.vue` - 首页（Figma 风格设计）✓
    - `Tech.vue` - 科技页面 ✓
    - `Dev.vue` - 开发者页面 ✓
    - `Academic.vue` - 学术页面 ✓
    - `Search.vue` - 搜索页面 ✓
  - 验收：页面可以访问 ✓

- [x] **配置 API 服务**
  - 状态：✅ 已完成
  - 文件：`src/api/request.js`, `src/api/article.js`
  - 说明：封装 axios，配置拦截器
  - 验收：可以发送请求 ✓

#### 2.3 设计系统配置
- [x] **配置字体系统**
  - 状态：✅ 已完成
  - 字体：Geist（英文）+ Noto Sans SC（中文）
  - 说明：Vercel 官方字体，专业现代感
  - 验收：字体加载正常 ✓

- [x] **集成项目 Logo**
  - 状态：✅ 已完成
  - 文件：`public/logo.png`
  - 说明：黑底白色波浪线设计
  - 验收：Logo 显示正常 ✓

- [x] **Figma 风格设计**
  - 状态：✅ 已完成
  - 特点：极简、48px 固定顶栏、transform 效果
  - 参考：https://froth-pry-36578210.figma.site/
  - 验收：设计风格统一 ✓

---

### Phase 3：后端项目搭建（Day 3-4）

#### 3.1 创建 Node.js 项目
- [x] **初始化项目**
  - 状态：✅ 已完成
  - 命令：`npm init -y`
  - 位置：`/backend`
  - 验收：package.json 创建成功 ✓

- [x] **安装依赖**
  - 状态：✅ 已完成
  - 依赖列表：
    ```bash
    npm install express mongoose dotenv cors
    npm install axios cheerio xml2js
    npm install node-cron winston joi
    npm install -D nodemon
    ```
  - 验收：所有依赖安装成功 ✓

- [x] **配置项目结构**
  - 状态：✅ 已完成
  - 结构：
    ```
    backend/
    ├── src/
    │   ├── routes/       # 路由 ✓
    │   ├── controllers/  # 控制器 ✓
    │   ├── models/       # 数据模型 ✓
    │   ├── services/     # 业务逻辑 ✓
    │   ├── crawlers/     # 爬虫 ✓
    │   ├── utils/        # 工具 ✓
    │   └── config/       # 配置 ✓
    ├── .env.example      # 环境变量示例 ✓
    └── server.js         # 入口文件（待创建）
    ```
  - 验收：文件夹创建完成 ✓

#### 3.2 配置数据库
- [ ] **创建 MongoDB 集群**
  - 状态：⬜ 待用户操作
  - 平台：MongoDB Atlas
  - 说明：选择免费版 M0，区域选择离你近的
  - 验收：集群创建成功
  - 备注：需要用户注册账号并创建集群

- [ ] **配置数据库连接**
  - 状态：⬜ 未开始
  - 文件：`src/config/database.js`
  - 说明：使用 mongoose 连接
  - 验收：连接成功无报错
  - 依赖：需要先完成 MongoDB 集群创建

- [ ] **创建数据模型**
  - 状态：⬜ 未开始
  - 文件：
    - `src/models/Article.js`
    - `src/models/User.js` (二期)
    - `src/models/UserSave.js` (二期)
  - 验收：模型定义正确

#### 3.3 创建基础 API
- [ ] **设置路由**
  - 状态：⬜ 未开始
  - 文件：`src/routes/article.js`
  - 路由：
    - GET /api/articles
    - GET /api/articles/:id
    - GET /api/categories
    - POST /api/search
  - 验收：路由注册成功

- [ ] **编写控制器**
  - 状态：⬜ 未开始
  - 文件：`src/controllers/articleController.js`
  - 功能：获取、搜索、分类等
  - 验收：接口返回正确

- [ ] **配置 CORS**
  - 状态：⬜ 未开始
  - 文件：`server.js`
  - 说明：允许前端跨域访问
  - 验收：前端可以请求

---

### Phase 4：AI 智能分析功能（Week 2，Day 4-8）⭐ 新增

#### 4.0 法律合规页面（必须优先完成）
- [ ] **创建版权声明页面**
  - 状态：⬜ 未开始
  - 文件：`frontend/src/views/Copyright.vue`
  - 路由：`/copyright`
  - 内容：
    - 内容来源说明
    - Fair Use 声明
    - 原创内容说明
    - 投诉流程
  - 验收：页面可访问，内容完整

- [ ] **创建服务条款页面**
  - 状态：⬜ 未开始
  - 文件：`frontend/src/views/Terms.vue`
  - 路由：`/terms`
  - 内容：用户协议、使用规范
  - 验收：页面可访问

- [ ] **创建隐私政策页面**
  - 状态：⬜ 未开始
  - 文件：`frontend/src/views/Privacy.vue`
  - 路由：`/privacy`
  - 验收：页面可访问

- [ ] **创建 DMCA 投诉页面**
  - 状态：⬜ 未开始
  - 文件：`frontend/src/views/DMCA.vue`
  - 路由：`/dmca`
  - 内容：投诉表单、联系方式
  - 验收：表单可提交

- [ ] **在所有文章卡片添加来源标注**
  - 状态：⬜ 未开始
  - 位置：ArticleCard 组件
  - 显示：来源平台 + 原文链接
  - 验收：所有卡片都有清晰标注

#### 4.1 AI 服务配置
- [ ] **选择 AI 服务提供商**
  - 状态：⬜ 未开始
  - 选项：OpenAI API / Claude API / Deepseek
  - 考虑：成本、效果、稳定性
  - 验收：用户确认选择

- [ ] **配置 AI API**
  - 状态：⬜ 未开始
  - 文件：`backend/src/config/ai.js`
  - 环境变量：AI_API_KEY, AI_API_URL
  - 验收：API 可正常调用

- [ ] **创建 AI Service**
  - 状态：⬜ 未开始
  - 文件：`backend/src/services/aiService.js`
  - 功能：
    - generateSummary(article) - 生成摘要
    - generateAnalysis(article) - 生成技术分析
    - answerQuestion(article, question) - AI 问答
  - 验收：所有方法测试通过

#### 4.2 AI 摘要功能
- [ ] **设计 AI 提示词（Prompt）**
  - 状态：⬜ 未开始
  - 摘要 Prompt：
    ```
    基于以下标题和描述，生成200字的技术摘要（不是翻译原文）：
    标题：{title}
    描述：{description}

    要求：
    1. 概括核心内容
    2. 突出技术要点
    3. 中文输出
    4. 不要复述原文
    ```
  - 验收：生成效果符合要求

- [ ] **实现摘要生成逻辑**
  - 状态：⬜ 未开始
  - 策略：
    - 只对热门文章生成（quality_score > 60）
    - 异步生成，不阻塞主流程
    - 缓存结果到数据库
  - 验收：摘要生成成功

- [ ] **数据库添加 AI 字段**
  - 状态：⬜ 未开始
  - 迁移：添加 ai_summary, ai_analysis 字段
  - 类型：TEXT
  - 验收：字段创建成功

#### 4.3 AI 技术分析功能
- [ ] **设计分析 Prompt**
  - 状态：⬜ 未开始
  - 分析 Prompt：
    ```
    作为技术专家，分析以下项目/文章：
    标题：{title}
    描述：{description}
    分类：{category}

    请提供：
    1. 技术栈分析
    2. 创新点
    3. 适用场景
    4. 学习价值
    5. 推荐指数（1-5星）

    输出格式：
    ## 技术栈
    ...
    ## 创新点
    ...
    ```
  - 验收：分析内容有价值

- [ ] **实现分析生成 API**
  - 状态：⬜ 未开始
  - 路由：POST /api/articles/:id/analyze
  - 逻辑：按需生成（用户点击时）
  - 验收：API 返回正确

#### 4.4 趋势预测评分算法
- [ ] **设计趋势评分算法**
  - 状态：⬜ 未开始
  - 文件：`backend/src/utils/trendScorer.js`
  - 因素：
    - 热度增长速度（当前 vs 24h前）
    - 多源提及度（多个平台都在讨论）
    - 评论/点赞增长率
    - 时间因素（新鲜度）
  - 公式：
    ```
    trend_score =
      growth_rate(40%) +
      cross_platform(30%) +
      engagement_rate(20%) +
      freshness(10%)
    ```
  - 验收：算法合理

- [ ] **实现趋势计算**
  - 状态：⬜ 未开始
  - 存储：trend_score 字段
  - 更新：每小时重新计算
  - 验收：评分准确

- [ ] **添加"正在爆发"标签**
  - 状态：⬜ 未开始
  - 规则：trend_score > 80
  - 展示：文章卡片上显示 🔥 标签
  - 验收：标签显示正确

#### 4.5 前端 AI 功能集成
- [ ] **文章详情页面**
  - 状态：⬜ 未开始
  - 文件：`frontend/src/views/ArticleDetail.vue`
  - 路由：`/article/:id`
  - 内容：
    - 标题、来源、时间
    - AI 摘要
    - AI 技术分析（付费功能占位）
    - 原文链接按钮
    - 趋势评分可视化
  - 验收：页面完整

- [ ] **AI 摘要卡片组件**
  - 状态：⬜ 未开始
  - 组件：`AISummaryCard.vue`
  - 功能：
    - 显示 AI 摘要
    - loading 状态
    - "生成摘要"按钮
  - 验收：交互流畅

---

### Phase 5：前端页面优化（Week 2，Day 9-12）

#### 5.1 Product 分类页面
- [ ] **创建 Product 页面**
  - 状态：⬜ 未开始
  - 文件：`frontend/src/views/Product.vue`
  - 路由：`/product`
  - 功能：展示 product 分类的文章
  - 验收：页面正常展示

- [ ] **更新导航菜单**
  - 状态：⬜ 未开始
  - 添加：Product 链接
  - 位置：Header 导航栏
  - 验收：可以跳转

#### 5.2 搜索功能实现
- [ ] **后端搜索 API**
  - 状态：⬜ 未开始
  - 路由：GET /api/articles/search?q=keyword
  - 功能：
    - 全文搜索（标题 + 摘要）
    - 按相关度排序
    - 分页支持
  - 验收：搜索准确

- [ ] **前端搜索页面**
  - 状态：⬜ 未开始
  - 文件：`frontend/src/views/Search.vue`
  - 功能：
    - 搜索框
    - 结果列表
    - 关键词高亮
    - 筛选器（分类、时间）
  - 验收：搜索体验好

#### 5.3 分页功能
- [ ] **无限滚动实现**
  - 状态：⬜ 未开始
  - 工具：Intersection Observer
  - 逻辑：滚动到底部自动加载
  - 验收：加载流畅

- [ ] **加载状态优化**
  - 状态：⬜ 未开始
  - 骨架屏设计
  - Loading 动画
  - 验收：体验流畅

#### 5.4 响应式设计
- [ ] **移动端适配**
  - 状态：⬜ 未开始
  - 断点：sm(640px), md(768px)
  - 调整：
    - 导航折叠
    - 卡片单列
    - 字体大小
  - 验收：手机浏览正常

- [ ] **平板适配**
  - 状态：⬜ 未开始
  - 布局：两列
  - 验收：平板浏览正常

---

### Phase 6：爬虫开发（Day 4-7）【已完成】

#### 4.1 GitHub Trending 爬虫
- [ ] **研究数据源**
  - 状态：⬜ 未开始
  - URL：https://github.com/trending
  - 说明：分析页面结构或找 API
  - 验收：能获取到数据

- [ ] **编写爬虫**
  - 状态：⬜ 未开始
  - 文件：`src/crawlers/github.js`
  - 字段：title, url, description, stars, language
  - 验收：数据格式正确

- [ ] **测试和调试**
  - 状态：⬜ 未开始
  - 说明：运行爬虫，检查数据
  - 验收：数据保存到数据库

#### 4.2 Hacker News 爬虫
- [ ] **使用官方 API**
  - 状态：⬜ 未开始
  - API：https://github.com/HackerNews/API
  - 文件：`src/crawlers/hackernews.js`
  - 验收：能获取热门文章

- [ ] **数据处理**
  - 状态：⬜ 未开始
  - 说明：转换为统一格式
  - 验收：数据保存成功

#### 4.3 Dev.to 爬虫
- [ ] **使用官方 API**
  - 状态：⬜ 未开始
  - API：https://dev.to/api
  - 文件：`src/crawlers/devto.js`
  - 验收：能获取文章

#### 4.4 掘金爬虫
- [ ] **研究接口**
  - 状态：⬜ 未开始
  - 说明：掘金有非官方 API
  - 文件：`src/crawlers/juejin.js`
  - 验收：能获取热门文章

#### 4.5 V2EX 爬虫
- [ ] **使用官方 API**
  - 状态：⬜ 未开始
  - API：https://www.v2ex.com/api
  - 文件：`src/crawlers/v2ex.js`
  - 验收：能获取最热主题

#### 4.6 少数派 RSS
- [ ] **解析 RSS**
  - 状态：⬜ 未开始
  - URL：https://sspai.com/feed
  - 文件：`src/crawlers/sspai.js`
  - 工具：xml2js
  - 验收：能解析 RSS

#### 4.7 IT之家 RSS
- [ ] **解析 RSS**
  - 状态：⬜ 未开始
  - URL：https://www.ithome.com/rss
  - 文件：`src/crawlers/ithome.js`
  - 验收：能解析 RSS

#### 4.8 arXiv API
- [ ] **使用官方 API**
  - 状态：⬜ 未开始
  - API：http://arxiv.org/help/api
  - 文件：`src/crawlers/arxiv.js`
  - 分类：cs.AI, cs.LG 等
  - 验收：能获取论文

#### 4.9 爬虫统一管理
- [ ] **创建爬虫管理器**
  - 状态：⬜ 未开始
  - 文件：`src/crawlers/index.js`
  - 功能：
    - 统一调度所有爬虫
    - 错误处理和重试
    - 日志记录
  - 验收：可以批量运行

- [ ] **配置定时任务**
  - 状态：⬜ 未开始
  - 文件：`src/services/scheduler.js`
  - 工具：node-cron
  - 频率：每 2 小时
  - 验收：定时任务正常运行

---

### Phase 5：数据处理（Day 7-8）

#### 5.1 数据清洗
- [ ] **去重处理**
  - 状态：⬜ 未开始
  - 文件：`src/services/dataProcessor.js`
  - 规则：
    - URL 完全相同去重
    - 标题相似度 > 85% 去重
  - 验收：重复数据不会保存

- [ ] **数据标准化**
  - 状态：⬜ 未开始
  - 处理：
    - 时间格式统一
    - 文本清洗（去除 HTML 标签）
    - 摘要长度限制
  - 验收：数据格式一致

#### 5.2 质量评分
- [ ] **评分算法**
  - 状态：⬜ 未开始
  - 文件：`src/services/scorer.js`
  - 公式：`score = 来源权重(60%) + 时效性(40%)`
  - 来源权重：
    - GitHub, HN: 1.0
    - Dev.to, 掘金: 0.9
    - RSS 源: 0.8
  - 验收：每篇文章都有分数

#### 5.3 自动分类
- [ ] **分类规则**
  - 状态：⬜ 未开始
  - 规则：
    - 根据来源自动分类
    - GitHub, HN, Dev.to → dev
    - 少数派, IT之家 → tech
    - arXiv → academic
  - 验收：分类正确

---

### Phase 6：前端页面开发（Day 9-14）

#### 6.1 首页开发
- [ ] **页面布局**
  - 状态：⬜ 未开始
  - 文件：`src/views/Home.vue`
  - 组件：Header + ArticleList + Sidebar
  - 验收：布局正确

- [ ] **文章列表**
  - 状态：⬜ 未开始
  - 功能：
    - 展示文章卡片
    - 加载更多/分页
    - 加载状态
  - 验收：数据正常展示

- [ ] **文章卡片**
  - 状态：⬜ 未开始
  - 组件：`ArticleCard.vue`
  - 内容：标题、来源、摘要、时间、分类
  - 验收：样式美观

- [ ] **侧边栏**
  - 状态：⬜ 未开始
  - 内容：
    - 分类筛选
    - 热门标签
    - 热门排行
  - 验收：可以交互

#### 6.2 分类页面
- [ ] **科技分类**
  - 状态：⬜ 未开始
  - 文件：`src/views/Tech.vue`
  - 路由：/tech
  - 验收：展示科技类文章

- [ ] **开发者分类**
  - 状态：⬜ 未开始
  - 文件：`src/views/Dev.vue`
  - 路由：/dev
  - 验收：展示开发者文章

- [ ] **学术分类**
  - 状态：⬜ 未开始
  - 文件：`src/views/Academic.vue`
  - 路由：/academic
  - 验收：展示学术文章

#### 6.3 搜索页面
- [ ] **搜索框**
  - 状态：⬜ 未开始
  - 位置：Header 组件
  - 功能：输入关键词搜索
  - 验收：可以触发搜索

- [ ] **搜索结果页**
  - 状态：⬜ 未开始
  - 文件：`src/views/Search.vue`
  - 路由：/search?q=keyword
  - 功能：展示搜索结果，关键词高亮
  - 验收：搜索正常

- [ ] **高级筛选**
  - 状态：⬜ 未开始
  - 筛选项：日期范围、分类、来源
  - 验收：筛选有效

#### 6.4 响应式设计
- [ ] **移动端适配**
  - 状态：⬜ 未开始
  - 断点：sm(640px), md(768px), lg(1024px)
  - 调整：
    - 侧边栏折叠
    - 卡片单列显示
    - 导航栏响应式
  - 验收：手机浏览正常

- [ ] **平板适配**
  - 状态：⬜ 未开始
  - 调整：两列卡片布局
  - 验收：平板浏览正常

#### 6.5 用户体验优化
- [ ] **加载状态**
  - 状态：⬜ 未开始
  - 组件：骨架屏/Loading 动画
  - 验收：加载时有反馈

- [ ] **错误处理**
  - 状态：⬜ 未开始
  - 场景：网络错误、404、500
  - 验收：错误有提示

- [ ] **空状态**
  - 状态：⬜ 未开始
  - 场景：无数据、搜索无结果
  - 验收：有友好提示

---

### Phase 7：功能完善（Day 15-18）

#### 7.1 排序功能
- [ ] **多种排序**
  - 状态：⬜ 未开始
  - 选项：最新、最热、评分
  - 位置：页面顶部下拉框
  - 验收：排序有效

#### 7.2 筛选功能
- [ ] **时间筛选**
  - 状态：⬜ 未开始
  - 选项：今天、本周、本月、全部
  - 验收：筛选有效

- [ ] **来源筛选**
  - 状态：⬜ 未开始
  - 选项：所有数据源
  - 验收：筛选有效

#### 7.3 性能优化
- [ ] **图片懒加载**
  - 状态：⬜ 未开始
  - 工具：Intersection Observer
  - 验收：滚动时才加载

- [ ] **虚拟滚动**
  - 状态：⬜ 未开始
  - 场景：长列表
  - 工具：vue-virtual-scroller（可选）
  - 验收：滚动流畅

- [ ] **缓存优化**
  - 状态：⬜ 未开始
  - 方案：
    - Pinia 状态缓存
    - LocalStorage 缓存
  - 验收：重复访问更快

#### 7.4 SEO 优化
- [ ] **Meta 标签**
  - 状态：⬜ 未开始
  - 内容：title, description, keywords
  - 验收：浏览器标签显示正确

- [ ] **语义化 HTML**
  - 状态：⬜ 未开始
  - 标签：article, section, header, nav
  - 验收：HTML 结构清晰

---

### Phase 8：测试与部署（Day 19-21）

#### 8.1 功能测试
- [ ] **前端测试**
  - 状态：⬜ 未开始
  - 测试项：
    - [ ] 所有页面可访问
    - [ ] 路由跳转正常
    - [ ] 搜索功能正常
    - [ ] 筛选排序正常
    - [ ] 响应式正常
    - [ ] 加载状态正常
  - 验收：无明显 bug

- [ ] **后端测试**
  - 状态：⬜ 未开始
  - 测试项：
    - [ ] API 返回正确
    - [ ] 爬虫运行正常
    - [ ] 数据保存正确
    - [ ] 错误处理正常
  - 验收：接口稳定

- [ ] **浏览器兼容性**
  - 状态：⬜ 未开始
  - 浏览器：Chrome, Safari, Firefox, Edge
  - 验收：主流浏览器正常

#### 8.2 性能测试
- [ ] **Lighthouse 测试**
  - 状态：⬜ 未开始
  - 指标：Performance > 80
  - 验收：评分达标

- [ ] **API 响应测试**
  - 状态：⬜ 未开始
  - 工具：Postman
  - 目标：< 500ms
  - 验收：响应时间合理

#### 8.3 部署准备
- [ ] **环境变量配置**
  - 状态：⬜ 未开始
  - 文件：
    - 前端：`.env.production`
    - 后端：`.env`
  - 内容：API 地址、数据库连接等
  - 验收：配置正确

- [ ] **构建测试**
  - 状态：⬜ 未开始
  - 命令：`npm run build`
  - 验收：构建成功

#### 8.4 Vercel 部署（前端）
- [ ] **连接 GitHub**
  - 状态：⬜ 未开始
  - 平台：https://vercel.com
  - 说明：导入 GitHub 仓库
  - 验收：项目导入成功

- [ ] **配置构建**
  - 状态：⬜ 未开始
  - 设置：
    - Framework: Vite
    - Root Directory: frontend
    - Build Command: npm run build
    - Output Directory: dist
  - 验收：自动部署成功

- [ ] **配置域名**
  - 状态：⬜ 未开始
  - 说明：可用 Vercel 免费域名或自定义
  - 验收：域名可访问

#### 8.5 Railway 部署（后端）
- [ ] **创建项目**
  - 状态：⬜ 未开始
  - 平台：https://railway.app
  - 说明：New Project → Deploy from GitHub
  - 验收：项目创建成功

- [ ] **配置环境变量**
  - 状态：⬜ 未开始
  - 变量：
    - MONGODB_URI
    - PORT
    - NODE_ENV=production
  - 验收：环境变量设置完成

- [ ] **配置构建**
  - 状态：⬜ 未开始
  - 设置：
    - Root Directory: backend
    - Start Command: node server.js
  - 验收：部署成功

- [ ] **测试接口**
  - 状态：⬜ 未开始
  - 说明：访问 Railway 提供的 URL
  - 验收：API 可访问

#### 8.6 GitHub Actions 定时任务
- [ ] **创建 workflow**
  - 状态：⬜ 未开始
  - 文件：`.github/workflows/crawler.yml`
  - 内容：
    ```yaml
    name: Crawler
    on:
      schedule:
        - cron: '0 */2 * * *'  # 每2小时
      workflow_dispatch:
    jobs:
      crawl:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - name: Setup Node
            uses: actions/setup-node@v3
            with:
              node-version: 18
          - name: Install dependencies
            run: cd backend && npm install
          - name: Run crawler
            env:
              MONGODB_URI: ${{ secrets.MONGODB_URI }}
            run: cd backend && node src/crawlers/index.js
    ```
  - 验收：定时任务运行

- [ ] **配置 Secrets**
  - 状态：⬜ 未开始
  - 位置：GitHub 仓库 Settings → Secrets
  - 变量：MONGODB_URI
  - 验收：Secrets 配置完成

#### 8.7 文档完善
- [ ] **README.md**
  - 状态：⬜ 未开始
  - 内容：
    - 项目介绍
    - 功能特性
    - 技术栈
    - 本地开发
    - 部署说明
  - 验收：文档完整

- [ ] **API 文档**
  - 状态：⬜ 未开始
  - 文件：`API.md`
  - 内容：所有接口的说明
  - 验收：文档清晰

---

## 🔄 每日工作流程

### 开始工作前
1. 查看 WORKFLOW.md，确认今日任务
2. 更新任务状态为"进行中"
3. 拉取最新代码：`git pull`

### 工作中
1. 按任务清单逐项完成
2. 及时提交代码：`git commit -m "描述"`
3. 遇到问题记录到"问题记录"部分

### 结束工作后
1. 更新任务状态为"已完成"
2. 推送代码：`git push`
3. 更新总体进度
4. 规划明日任务

---

## 📝 开发日志

### 2025-11-15（Week 1, Day 1）

**今日完成**：
- ✅ 编写项目策划书（PROJECT_PLAN.md）
- ✅ 制定开发工作流文档（WORKFLOW.md）
- ✅ 创建 AI 助手工作指南（AI_GUIDE.md）
- ✅ 初始化 Git 仓库
- ✅ 创建前端项目（Vue 3 + Vite）
- ✅ 安装前端依赖（Vue Router, Pinia, Axios, TailwindCSS, Naive UI, Geist）
- ✅ 配置 TailwindCSS（降级到 v3 解决兼容性问题）
- ✅ 创建前端目录结构
- ✅ 配置路由系统（5 个页面）
- ✅ 封装 API 请求服务
- ✅ 配置 Pinia 状态管理
- ✅ 创建基础页面（Home, Tech, Dev, Academic, Search）
- ✅ 实现 Figma 极简风格设计
  - 48px 固定顶栏
  - Transform 效果代替阴影
  - 纯白背景
  - 响应式网格布局
- ✅ 集成项目 Logo（黑底白色波浪线）
- ✅ 配置字体系统（Geist + Noto Sans SC）
- ✅ 初始化后端项目（Node.js + Express）
- ✅ 安装后端依赖
- ✅ 创建后端目录结构
- ✅ 配置环境变量示例

**今日问题**：
- TailwindCSS v4 与 PostCSS 不兼容，已降级到 v3 解决

**明日计划**：
- 创建后端 server.js 入口文件
- 配置数据库连接（需要先注册 MongoDB Atlas）
- 创建 Article 数据模型
- 创建基础 API 路由

---

### 2025-11-16（Week 1, Day 2）

**今日完成**：
- ✅ 数据库搭建（Supabase 替代 MongoDB）
  - 创建 articles 表完整 schema
  - 配置 RLS 行级安全策略
  - 添加性能优化索引（分类、来源、时间等）
  - 配置自动更新 updated_at 触发器
  - 启用全文搜索索引
- ✅ 后端 API 框架完成
  - 创建 Supabase 客户端配置（anon key + service_role key）
  - 实现服务层架构（controllers → services → Supabase）
  - 完成 Article Service 全部 CRUD 方法
  - 完成 Article Controller 及参数验证
  - 创建 RESTful 路由（/api/articles）
  - 测试所有 API 端点正常运行
- ✅ 爬虫系统开发（4 个数据源）
  - 创建基础爬虫类（统一流程：fetch → transform → clean → score → save）
  - 实现质量评分算法（0-100 分，基于来源、标题、互动数据）
  - 实现热度评分算法（时间衰减，类似 Hacker News）
  - 实现自动分类系统（tech/dev/opensource/academic）
  - 开发 Hacker News 爬虫（官方 API）
  - 开发 GitHub Trending 爬虫（HTML 解析）
  - 开发 Dev.to 爬虫（官方 API）
  - 开发 arXiv 爬虫（XML API，cs.AI 分类）
  - 创建调度系统（node-cron）
  - 配置定时任务（每 2-6 小时自动运行）
- ✅ 新增 'opensource' 分类
  - 数据库迁移添加 opensource 到 category 约束
  - 更新分类器支持开源项目关键词识别
  - 更新后端 API 验证逻辑
  - 更新前端导航和分类标签（4 个分类）
  - 将 GitHub Trending 文章迁移到 opensource 分类
- ✅ 配置 Supabase MCP
  - 创建项目级 .mcp.json 配置文件
  - 测试 MCP 工具连接
  - 通过 MCP 执行数据库迁移
- ✅ 前端数据集成
  - 配置 Vite 路径别名（@）
  - 更新 Home.vue 从后端 API 获取真实数据
  - 实现加载状态、错误处理、空状态
  - 实现分类切换功能（全部/科技/开发者/开源/学术）
  - 显示文章来源、发布时间、质量分、互动数据
  - 格式化相对时间显示

**数据统计**：
- 数据库文章总数：40 条
  - opensource: 10 条（GitHub Trending）
  - dev: 17 条（Dev.to 等）
  - tech: 12 条（Hacker News 等）
  - academic: 1 条（arXiv）
- 4 个爬虫全部测试通过，插入成功率 100%

**今日问题及解决**：
- ✅ 爬虫 RLS 权限问题 → 使用 service_role key 绕过 RLS
- ✅ 后端服务器停止运行 → 重启 nodemon 恢复
- ✅ 前端路径别名未配置 → 添加 Vite resolve.alias 解决
- ✅ TailwindCSS v4 兼容性问题 → 已在 Day 1 降级到 v3

**明日计划**：
- 添加更多中文数据源爬虫（掘金、V2EX、少数派、IT之家）
- 完善前端各分类页面（Tech.vue, Dev.vue, Academic.vue）
- 实现分页功能
- 优化前端样式细节

---

### 2025-11-16（Week 1, Day 3）

**今日完成**：
- ✅ 新增第 5 个数据源：AIBase（AI 产品聚合平台）
  - 使用 Puppeteer 处理 JavaScript 渲染网站
  - 实现完整的数据提取和转换
  - 爬取 AI 工具和产品信息
  - 自动分类到 'product' 类别
  - 配置每 4 小时运行一次
- ✅ 新增第 6 个数据源：Product Hunt（每日产品推荐）
  - 集成 Product Hunt GraphQL API v2
  - 实现 OAuth Client Credentials 认证流程
  - 动态获取 access token
  - 爬取每日热门产品（按投票数排序）
  - 提取产品信息、制作者、主题标签
  - 配置每 3 小时运行一次
  - 自动分类到 'product' 类别
- ✅ 新增 'product' 分类
  - 数据库迁移添加 product 到 category 约束
  - 更新分类器支持产品关键词识别
  - 更新后端 API 验证逻辑
  - 所有 6 个爬虫全部集成到调度器
- ✅ 数据库更新
  - 添加 'AIBase' 和 'Product Hunt' 到 source 约束
  - 添加 'product' 到 category 约束

**数据统计**：
- 数据库文章总数：**132 条**
  - dev: 48 条（5 个来源）
  - tech: 41 条（6 个来源）
  - opensource: 24 条（5 个来源）
  - **product: 15 条（2 个来源：AIBase, Product Hunt）**
  - academic: 4 条（2 个来源）
- **6 个数据源全部运行正常**：
  - Hacker News（API）- 每 2 小时
  - GitHub Trending（HTML）- 每 4 小时
  - Dev.to（API）- 每 2 小时
  - arXiv（XML API）- 每 6 小时
  - AIBase（Puppeteer）- 每 4 小时
  - Product Hunt（GraphQL API）- 每 3 小时
- 调度器稳定运行，自动抓取和清理系统正常

**今日问题及解决**：
- ✅ Product Hunt 认证失败（401 错误）
  - 原因：Developer Token 不能直接使用
  - 解决：改用 OAuth Client Credentials 流程，动态获取 access token
- ✅ GraphQL 查询结构错误
  - 原因：`makers` 字段结构判断错误（不需要 edges 包装）
  - 解决：修正查询结构为 `makers { name }`
- ✅ AIBase 数据提取问题
  - 原因：网站使用 JavaScript 渲染
  - 解决：使用 Puppeteer 替代 Cheerio

**技术要点**：
- **API 类型总结**：
  - 官方 REST API：Hacker News, Dev.to
  - GraphQL API：Product Hunt
  - XML API：arXiv
  - HTML 解析：GitHub Trending（Cheerio）
  - JavaScript 渲染：AIBase（Puppeteer）
- OAuth 2.0 Client Credentials 认证流程实现
- Puppeteer 无头浏览器爬虫技术

**明日计划**：
- 完善前端各分类页面（添加 Product 分类页面）
- 优化前端样式和用户体验
- 实现搜索功能
- 考虑添加更多数据源（可选）

---

## ⚠️ 问题记录

### 未解决问题
*暂无*

### 已解决问题
*暂无*

---

## 📊 周报总结

### Week 1 总结（2025-11-15 ~ 2025-11-22）
**完成情况**：⬜
**主要成果**：
-

**遇到问题**：
-

**下周计划**：
-

---

### Week 2 总结（2025-11-23 ~ 2025-11-30）
**完成情况**：⬜
**主要成果**：


**遇到问题**：


**下周计划**：


---

### Week 3 总结（2025-12-01 ~ 2025-12-08）
**完成情况**：⬜
**主要成果**：


**遇到问题**：


**下周计划**：


---

### Week 4 总结（2025-12-09 ~ 2025-12-15）
**完成情况**：⬜
**主要成果**：


**遇到问题**：


**项目回顾**：


---

## 🎯 检查清单

### MVP 上线前检查
- [ ] 所有核心功能正常
- [ ] 没有明显 bug
- [ ] 至少 8 个数据源稳定运行
- [ ] 页面响应速度 < 3 秒
- [ ] 移动端适配完成
- [ ] 部署成功可访问
- [ ] README 文档完善
- [ ] 代码提交到 GitHub

### 后续优化检查
- [ ] 用户反馈收集
- [ ] 性能优化
- [ ] 增加新数据源
- [ ] UI/UX 改进
- [ ] 考虑二期功能

---

## 📚 参考资源

### 学习资料
- **Vue 3**：https://cn.vuejs.org/
- **Vite**：https://cn.vitejs.dev/
- **Express**：https://expressjs.com/
- **MongoDB**：https://www.mongodb.com/docs/
- **TailwindCSS**：https://tailwindcss.com/

### 部署教程
- **Vercel**：https://vercel.com/docs
- **Railway**：https://docs.railway.app/
- **GitHub Actions**：https://docs.github.com/actions

### 数据源文档
- **GitHub API**：https://docs.github.com/rest
- **Hacker News API**：https://github.com/HackerNews/API
- **Dev.to API**：https://developers.forem.com/api
- **arXiv API**：https://arxiv.org/help/api

---

**最后更新**：2025-11-15
**文档版本**：v1.0
