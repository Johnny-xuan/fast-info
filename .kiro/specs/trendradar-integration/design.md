# Design Document

## Overview

本设计文档描述"卖报员 Agent"系统的技术架构。系统核心是一个具备工具调用能力的智能体，能够理解用户需求并从自建文章数据库中检索推荐相关内容。

**设计原则**：
- 不造轮子：优先使用成熟开源方案
- 轻量部署：适配 2GB 内存服务器
- 模块化：各组件独立可替换
- 借鉴 TrendRadar：MCP 架构、推送通知

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Vue 3)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Chat UI     │  │ Article List│  │ Settings    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Chat API    │  │ Article API │  │ Push Service│          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│  ┌─────────────────────────────────────────────────┐        │
│  │           Newsboy Agent (Tool Calling)           │        │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │        │
│  │  │search  │ │filter  │ │trending│ │digest  │    │        │
│  │  └────────┘ └────────┘ └────────┘ └────────┘    │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MCP Server (FastMCP)                      │
│  Tools: search_articles, filter_*, get_trending, get_stats  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL (Docker on vpn1 server)              │
│  Tables: articles, conversations, push_configs              │
└─────────────────────────────────────────────────────────────┘
```


## Components and Interfaces

### 1. PostgreSQL Database (Article_DB)

**部署方式**：Docker on vpn1 server

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: fastinfo
      POSTGRES_USER: fastinfo
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  pgdata:
```

**表结构**：
```sql
-- articles 表（从 Supabase 迁移）
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  summary TEXT,
  ai_summary TEXT,
  source VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL,
  quality_score INTEGER DEFAULT 0,
  hot_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 全文搜索索引
CREATE INDEX idx_articles_search ON articles 
USING GIN (to_tsvector('simple', title || ' ' || COALESCE(summary, '')));

-- conversations 表（对话历史）
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- push_configs 表（推送配置）
CREATE TABLE push_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel VARCHAR(20) NOT NULL, -- 'telegram' or 'email'
  config JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  daily_digest_time TIME DEFAULT '09:00',
  created_at TIMESTAMP DEFAULT NOW()
);
```


### 2. Newsboy Agent

**核心逻辑**：使用豆包大模型的 Function Calling 能力

```javascript
// backend/src/services/newsboyAgent.js
const tools = [
  {
    name: "search_articles",
    description: "搜索文章，支持关键词匹配",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "搜索关键词" },
        limit: { type: "number", description: "返回数量", default: 10 }
      },
      required: ["query"]
    }
  },
  {
    name: "filter_by_category",
    description: "按分类筛选文章",
    parameters: {
      type: "object",
      properties: {
        category: { 
          type: "string", 
          enum: ["tech", "dev", "academic", "product", "opensource"]
        },
        limit: { type: "number", default: 10 }
      },
      required: ["category"]
    }
  },
  {
    name: "filter_by_date",
    description: "按时间筛选文章",
    parameters: {
      type: "object",
      properties: {
        range: { type: "string", enum: ["today", "week", "month"] },
        limit: { type: "number", default: 10 }
      },
      required: ["range"]
    }
  },
  {
    name: "filter_by_source",
    description: "按来源筛选文章",
    parameters: {
      type: "object",
      properties: {
        source: { type: "string" },
        limit: { type: "number", default: 10 }
      },
      required: ["source"]
    }
  },
  {
    name: "get_trending",
    description: "获取热门文章",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", default: 10 }
      }
    }
  },
  {
    name: "get_daily_digest",
    description: "生成今日资讯摘要",
    parameters: { type: "object", properties: {} }
  },
  {
    name: "get_stats",
    description: "获取数据库统计信息",
    parameters: { type: "object", properties: {} }
  }
];
```


### 3. MCP Server（借鉴 TrendRadar）

**参考实现**：TrendRadar 的 `mcp_server/server.py`

```python
# mcp_server/server.py (Python FastMCP)
from mcp.server.fastmcp import FastMCP
import psycopg2

mcp = FastMCP("FastInfo Newsboy")

@mcp.tool()
def search_articles(query: str, limit: int = 10) -> list:
    """搜索文章"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, title, source, category, created_at, ai_summary
        FROM articles 
        WHERE title ILIKE %s OR summary ILIKE %s
        ORDER BY created_at DESC
        LIMIT %s
    """, (f'%{query}%', f'%{query}%', limit))
    return cur.fetchall()

@mcp.tool()
def filter_by_category(category: str, limit: int = 10) -> list:
    """按分类筛选"""
    # ... implementation

@mcp.tool()
def get_trending(limit: int = 10) -> list:
    """获取热门文章"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, title, source, category, hot_score
        FROM articles 
        ORDER BY hot_score DESC
        LIMIT %s
    """, (limit,))
    return cur.fetchall()

@mcp.tool()
def get_stats() -> dict:
    """获取统计信息"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM articles")
    total = cur.fetchone()[0]
    cur.execute("SELECT category, COUNT(*) FROM articles GROUP BY category")
    by_category = dict(cur.fetchall())
    return {"total": total, "by_category": by_category}
```

### 4. Push Service

**支持渠道**：Telegram（优先）、Email

```javascript
// backend/src/services/pushService.js
class PushService {
  async sendTelegram(chatId, message) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await axios.post(url, { chat_id: chatId, text: message, parse_mode: 'Markdown' });
  }

  async sendDailyDigest() {
    const articles = await articleService.getTodayArticles();
    const digest = this.formatDigest(articles);
    const configs = await this.getEnabledConfigs();
    for (const config of configs) {
      await this.send(config.channel, config.config, digest);
    }
  }

  formatDigest(articles) {
    return `📰 *今日技术资讯* (${new Date().toLocaleDateString()})\n\n` +
      articles.slice(0, 10).map((a, i) => 
        `${i+1}. [${a.title}](${a.url}) - ${a.source}`
      ).join('\n');
  }
}
```


## Data Models

### Article Model

```typescript
interface Article {
  id: string;           // UUID
  title: string;        // 文章标题
  url: string;          // 原文链接（唯一）
  summary: string;      // 原始摘要
  ai_summary: string;   // AI 生成摘要
  source: ArticleSource;
  category: ArticleCategory;
  quality_score: number; // 0-100
  hot_score: number;     // 热度分数
  created_at: Date;
  updated_at: Date;
}

type ArticleSource = 'hackernews' | 'github' | 'devto' | 'producthunt' | 'arxiv' | 'reddit';
type ArticleCategory = 'tech' | 'dev' | 'academic' | 'product' | 'opensource';
```

### Conversation Model

```typescript
interface Conversation {
  id: string;
  session_id: string;   // 会话标识
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: ToolCall[];  // Agent 调用的工具
  created_at: Date;
}

interface ToolCall {
  name: string;
  arguments: Record<string, any>;
  result: any;
}
```

### Push Config Model

```typescript
interface PushConfig {
  id: string;
  channel: 'telegram' | 'email';
  config: TelegramConfig | EmailConfig;
  enabled: boolean;
  daily_digest_time: string;  // HH:mm 格式
  created_at: Date;
}

interface TelegramConfig {
  chat_id: string;
  bot_token?: string;  // 可选，使用默认 bot
}

interface EmailConfig {
  address: string;
}
```

### Agent Tool Response

```typescript
interface ToolResponse {
  success: boolean;
  data: Article[] | StatsData | DigestData;
  error?: string;
  metadata?: {
    total: number;
    query_time_ms: number;
  };
}

interface StatsData {
  total_articles: number;
  by_category: Record<ArticleCategory, number>;
  by_source: Record<ArticleSource, number>;
  latest_update: Date;
}

interface DigestData {
  date: string;
  articles: Article[];
  summary: string;  // AI 生成的今日总结
}
```

## Correctness Properties

### Property 1: 数据一致性

**描述**：数据库中的文章数据必须保持一致性和完整性

**验证条件**：
- 每篇文章必须有唯一的 URL
- 文章的 source 和 category 必须是预定义的枚举值
- created_at 时间戳必须 <= updated_at
- quality_score 必须在 0-100 范围内

**测试方法**：
```sql
-- 检查 URL 唯一性
SELECT url, COUNT(*) FROM articles GROUP BY url HAVING COUNT(*) > 1;

-- 检查枚举值有效性
SELECT * FROM articles WHERE source NOT IN ('hackernews', 'github', 'devto', 'producthunt', 'arxiv', 'reddit');

-- 检查时间戳逻辑
SELECT * FROM articles WHERE created_at > updated_at;
```

### Property 2: Agent 工具调用正确性

**描述**：Agent 调用工具时必须返回正确的结果

**验证条件**：
- search_articles 返回的文章必须包含搜索关键词（标题或摘要）
- filter_by_category 返回的文章必须属于指定分类
- filter_by_date 返回的文章必须在指定时间范围内
- get_trending 返回的文章必须按 hot_score 降序排列
- 返回数量不超过指定的 limit

**测试方法**：
```javascript
// 搜索结果验证
const results = await searchArticles('AI');
assert(results.every(a => 
  a.title.includes('AI') || a.summary.includes('AI')
));

// 分类筛选验证
const techArticles = await filterByCategory('tech');
assert(techArticles.every(a => a.category === 'tech'));

// 热门排序验证
const trending = await getTrending(10);
for (let i = 1; i < trending.length; i++) {
  assert(trending[i-1].hot_score >= trending[i].hot_score);
}
```

### Property 3: 会话上下文保持

**描述**：同一会话内的对话上下文必须正确保持

**验证条件**：
- 同一 session_id 的消息按 created_at 排序后形成完整对话
- user 和 assistant 消息交替出现（允许连续的 assistant 消息用于工具调用）
- 会话历史在 Agent 推理时正确传递

**测试方法**：
```javascript
// 上下文保持测试
const session = createSession();
await chat(session, "搜索 AI 相关文章");
await chat(session, "只看今天的");  // 应该理解是在 AI 文章基础上筛选
const history = await getConversationHistory(session);
assert(history.length >= 4);  // 至少 2 轮对话
```

### Property 4: 推送可靠性

**描述**：推送通知必须可靠送达或正确记录失败

**验证条件**：
- 启用的推送配置必须在指定时间触发
- 推送失败时必须记录错误日志
- 推送内容必须包含完整的文章信息（标题、来源、链接）

**测试方法**：
```javascript
// 推送格式验证
const digest = formatDigest(articles);
assert(digest.includes('今日技术资讯'));
articles.forEach(a => {
  assert(digest.includes(a.title));
  assert(digest.includes(a.url));
});
```

## Error Handling

### 数据库错误

| 错误类型 | 处理策略 | 用户提示 |
|---------|---------|---------|
| 连接失败 | 指数退避重试（最多 5 次） | "服务暂时不可用，请稍后重试" |
| 查询超时 | 返回缓存结果或空结果 | "查询超时，已返回部分结果" |
| 数据不存在 | 返回空数组 | "未找到相关文章" |

```javascript
// 数据库连接重试
async function withRetry(fn, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await sleep(Math.pow(2, i) * 1000);  // 指数退避
    }
  }
}
```

### Agent 错误

| 错误类型 | 处理策略 | 用户提示 |
|---------|---------|---------|
| AI 服务不可用 | 降级为关键词搜索 | "智能推荐暂时不可用，已切换为关键词搜索" |
| 工具调用失败 | 记录日志，返回友好错误 | "抱歉，我无法完成这个操作" |
| 参数无效 | 提示用户修正 | "请提供更具体的搜索条件" |

```javascript
// Agent 降级处理
async function chat(message) {
  try {
    return await newsboyAgent.process(message);
  } catch (err) {
    logger.error('Agent error:', err);
    // 降级为简单搜索
    const keywords = extractKeywords(message);
    return await fallbackSearch(keywords);
  }
}
```

### 推送错误

| 错误类型 | 处理策略 | 后续动作 |
|---------|---------|---------|
| Telegram API 失败 | 重试 3 次 | 记录失败，下次推送时重试 |
| 无效的 chat_id | 标记配置为无效 | 通知用户重新配置 |
| 频率限制 | 延迟发送 | 加入队列稍后发送 |

## Testing Strategy

### 单元测试

**工具**：Vitest（Node.js）、pytest（Python MCP Server）

```javascript
// backend/tests/tools.test.js
describe('Newsboy Tools', () => {
  test('search_articles returns matching results', async () => {
    const results = await searchArticles('JavaScript');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('title');
    expect(results[0]).toHaveProperty('url');
  });

  test('filter_by_category validates category', async () => {
    await expect(filterByCategory('invalid'))
      .rejects.toThrow('Invalid category');
  });

  test('get_trending returns sorted results', async () => {
    const results = await getTrending(5);
    for (let i = 1; i < results.length; i++) {
      expect(results[i-1].hot_score).toBeGreaterThanOrEqual(results[i].hot_score);
    }
  });
});
```

```python
# mcp_server/tests/test_tools.py
def test_search_articles():
    results = search_articles("Python", limit=5)
    assert len(results) <= 5
    assert all('title' in r for r in results)

def test_get_stats():
    stats = get_stats()
    assert 'total' in stats
    assert 'by_category' in stats
```

### 集成测试

**测试场景**：

1. **完整对话流程**
   - 用户发送查询 → Agent 选择工具 → 执行查询 → 返回结果
   
2. **数据库迁移验证**
   - Supabase 数据导出 → PostgreSQL 导入 → 数据完整性检查

3. **推送流程**
   - 配置推送 → 触发每日摘要 → 验证消息送达

```javascript
// backend/tests/integration/chat.test.js
describe('Chat Integration', () => {
  test('complete conversation flow', async () => {
    const session = await createSession();
    
    // 第一轮对话
    const res1 = await chat(session, "有什么 AI 相关的新闻？");
    expect(res1.articles.length).toBeGreaterThan(0);
    
    // 第二轮对话（上下文）
    const res2 = await chat(session, "只看今天的");
    expect(res2.articles.every(a => isToday(a.created_at))).toBe(true);
  });
});
```

### 端到端测试

**工具**：Playwright

```javascript
// e2e/chat.spec.js
test('user can search articles via chat', async ({ page }) => {
  await page.goto('/chat');
  await page.fill('[data-testid="chat-input"]', '搜索 Vue 相关文章');
  await page.click('[data-testid="send-button"]');
  
  await expect(page.locator('[data-testid="article-card"]')).toBeVisible();
  await expect(page.locator('[data-testid="article-card"]').first())
    .toContainText('Vue');
});
```

### 测试数据

```sql
-- 测试数据种子
INSERT INTO articles (title, url, source, category, quality_score, hot_score) VALUES
('Vue 3.5 发布：性能大幅提升', 'https://example.com/vue-3.5', 'devto', 'dev', 85, 120),
('GPT-5 传闻：多模态能力增强', 'https://example.com/gpt-5', 'hackernews', 'tech', 90, 200),
('Rust 异步编程最佳实践', 'https://example.com/rust-async', 'reddit', 'dev', 75, 80);
```

### CI/CD 集成

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: fastinfo_test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```
