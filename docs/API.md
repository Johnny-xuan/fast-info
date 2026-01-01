# Fast Info API 文档

## 概述

Fast Info API 提供技术资讯检索和智能推荐服务。

- Base URL: `http://localhost:3000/api`
- 响应格式: JSON
- 编码: UTF-8

## 认证

当前版本无需认证。

---

## Chat API（卖报员 Agent）

### POST /api/chat

与卖报员 Agent 对话，获取智能文章推荐。

**请求体**

```json
{
  "message": "有什么 AI 相关的新闻？",
  "sessionId": "optional-session-id"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| message | string | 是 | 用户消息 |
| sessionId | string | 否 | 会话ID，用于保持上下文 |

**响应**

```json
{
  "message": "找到以下 AI 相关文章：",
  "articles": [
    {
      "id": "uuid",
      "title": "GPT-5 最新进展",
      "url": "https://...",
      "source": "hackernews",
      "category": "tech",
      "ai_summary": "...",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "sessionId": "session-uuid",
  "toolCalls": [
    { "name": "search_articles", "result": [...] }
  ]
}
```

### GET /api/chat/suggestions

获取快捷查询建议。

**响应**

```json
{
  "suggestions": [
    { "label": "今日热点", "query": "今天有什么热门文章？" },
    { "label": "AI 新闻", "query": "最新的 AI 相关新闻" },
    { "label": "开源项目", "query": "推荐一些热门开源项目" }
  ]
}
```

---

## Articles API

### GET /api/articles

获取文章列表。

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| limit | number | 20 | 每页数量 |
| category | string | - | 分类筛选 |
| source | string | - | 来源筛选 |

**响应**

```json
{
  "articles": [...],
  "total": 233,
  "page": 1,
  "limit": 20
}
```

### GET /api/articles/hot

获取热门文章。

**查询参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| limit | number | 10 | 返回数量 |

### GET /api/articles/search

搜索文章。

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |
| limit | number | 否 | 返回数量，默认 20 |

---

## Push API

### GET /api/push/configs

获取推送配置列表。

### POST /api/push/configs

创建推送配置。

**请求体**

```json
{
  "channel": "telegram",
  "config": {
    "chat_id": "123456789"
  },
  "daily_digest_time": "09:00"
}
```

### PUT /api/push/configs/:id

更新推送配置。

### DELETE /api/push/configs/:id

删除推送配置。

### POST /api/push/digest

手动触发每日摘要推送。

---

## AI API

### GET /api/ai/stats

获取 AI 摘要生成统计。

**响应**

```json
{
  "total": 233,
  "withSummary": 180,
  "pending": 53
}
```

### POST /api/ai/generate-summary/:id

为指定文章生成 AI 摘要。

### POST /api/ai/batch-generate

批量生成 AI 摘要。

**请求体**

```json
{
  "limit": 10
}
```

---

## 健康检查

### GET /health

**响应**

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00Z",
  "uptime": 3600
}
```

---

## 错误响应

所有错误响应格式：

```json
{
  "error": {
    "message": "错误描述",
    "status": 400
  }
}
```

| 状态码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## Agent 工具说明

卖报员 Agent 支持以下工具：

| 工具名 | 说明 | 参数 |
|--------|------|------|
| search_articles | 关键词搜索 | query, limit |
| filter_by_category | 分类筛选 | category, limit |
| filter_by_date | 时间筛选 | range (today/week/month), limit |
| filter_by_source | 来源筛选 | source, limit |
| get_trending | 热门文章 | limit |
| get_daily_digest | 今日摘要 | - |
| get_stats | 统计信息 | - |

### 分类枚举

- `tech` - 技术趋势
- `dev` - 开发实践
- `academic` - 学术论文
- `product` - 产品发布
- `opensource` - 开源项目

### 来源枚举

- `hackernews` - Hacker News
- `github` - GitHub Trending
- `devto` - Dev.to
- `producthunt` - Product Hunt
- `arxiv` - arXiv
- `reddit` - Reddit
