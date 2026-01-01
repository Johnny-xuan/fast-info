# Requirements Document

## Introduction

本文档定义了 Fast Info 平台升级为"卖报员 Agent"的需求规格。借鉴 TrendRadar 的成熟架构，打造一个具备工具调用能力的智能技术资讯检索 Agent。

**核心定位**：卖报员 Agent - 知道库里有什么文章、了解文章内容、理解用户需求、精准推荐

**项目约束**：

- 预算限制：¥200/月
- 服务器：Ubuntu 24.04 / 2GB RAM / 1 核 / 33GB 硬盘
- 技术栈：Node.js v20 + Express + Vue 3 + PostgreSQL（自建）+ 豆包大模型
- 开发理念：不造轮子，优先使用成熟开源方案
- 内容理念：开源内容自由获取，降低信息壁垒

## Glossary

- **Newsboy_Agent**: 卖报员智能体，具备工具调用能力的文章检索 Agent
- **Tool**: Agent 可调用的工具/技能，如搜索、筛选、统计等
- **Article_DB**: 自建 PostgreSQL 数据库，存储所有抓取的文章
- **MCP_Server**: Model Context Protocol 服务，提供 Agent 工具接口（借鉴 TrendRadar）
- **Push_Channel**: 推送通道，支持多平台消息推送
- **User**: 使用 Fast Info 平台的技术爱好者或学生
- **Article**: 从各数据源抓取的技术资讯文章

## Requirements

### Requirement 1: 自建数据库部署

**User Story:** As a developer, I want to deploy the database on my own server, so that I have full control over the data and don't depend on third-party cloud services.

#### Acceptance Criteria

1. THE Article_DB SHALL be deployed as PostgreSQL on the vpn1 server using Docker
2. THE Article_DB SHALL support migration of existing 233+ articles from Supabase
3. THE Article_DB SHALL include full-text search capability for Chinese and English content
4. WHEN the server restarts, THE Article_DB SHALL automatically recover with data persistence
5. THE Article_DB SHALL provide connection interface for the backend service
6. IF database connection fails, THEN THE system SHALL retry with exponential backoff

### Requirement 2: 卖报员 Agent 核心

**User Story:** As a user, I want to interact with an intelligent agent that understands my needs and recommends relevant articles, so that I can quickly find the tech news I'm interested in.

#### Acceptance Criteria

1. THE Newsboy_Agent SHALL understand user queries in natural language (Chinese/English)
2. WHEN a user asks a question, THE Newsboy_Agent SHALL select appropriate tools to fulfill the request
3. THE Newsboy_Agent SHALL return article recommendations with title, source, date, and summary
4. THE Newsboy_Agent SHALL explain why it recommends certain articles
5. IF no relevant articles are found, THEN THE Newsboy_Agent SHALL suggest alternative search terms
6. THE Newsboy_Agent SHALL maintain conversation context within a session

### Requirement 3: Agent 工具箱

**User Story:** As a user, I want the agent to have various tools to search and filter articles, so that I can get precise results based on different criteria.

#### Acceptance Criteria

1. THE Newsboy_Agent SHALL support a "search_articles" tool for keyword-based search
2. THE Newsboy_Agent SHALL support a "filter_by_category" tool for category filtering (tech/dev/academic/product/opensource)
3. THE Newsboy_Agent SHALL support a "filter_by_date" tool for time-based filtering (today/week/month)
4. THE Newsboy_Agent SHALL support a "filter_by_source" tool for source filtering (Hacker News/GitHub/Dev.to etc.)
5. THE Newsboy_Agent SHALL support a "get_trending" tool for retrieving hot articles
6. THE Newsboy_Agent SHALL support a "get_daily_digest" tool for generating daily news summary
7. THE Newsboy_Agent SHALL support a "get_stats" tool for database statistics
8. WHEN using tools, THE Newsboy_Agent SHALL be able to combine multiple tools for complex queries

### Requirement 4: MCP Server 集成（借鉴 TrendRadar）

**User Story:** As a developer, I want to expose agent tools via MCP protocol, so that the agent can be integrated with various AI clients.

#### Acceptance Criteria

1. THE MCP_Server SHALL expose all agent tools as MCP-compatible endpoints
2. THE MCP_Server SHALL follow FastMCP 2.0 protocol specification
3. THE MCP_Server SHALL support tool discovery and schema introspection
4. WHEN a tool is called, THE MCP_Server SHALL validate input parameters
5. THE MCP_Server SHALL return structured responses with proper error handling
6. THE MCP_Server SHALL be configurable via YAML configuration file

### Requirement 5: 对话界面

**User Story:** As a user, I want a chat interface to interact with the agent, so that I can have natural conversations about tech news.

#### Acceptance Criteria

1. THE Chat_Interface SHALL provide a text input for users to type questions
2. WHEN a user sends a message, THE Chat_Interface SHALL display a loading indicator
3. THE Chat_Interface SHALL display agent responses with markdown formatting
4. THE Chat_Interface SHALL show recommended articles as clickable cards
5. THE Chat_Interface SHALL maintain conversation history within a session
6. THE Chat_Interface SHALL support suggested quick actions (e.g., "今日热点", "AI 新闻")
7. WHEN an error occurs, THE Chat_Interface SHALL display a user-friendly message

### Requirement 6: 推送通知（借鉴 TrendRadar）

**User Story:** As a user, I want to receive push notifications for important tech news, so that I stay updated without actively checking the platform.

#### Acceptance Criteria

1. THE Push_Channel SHALL support at least one push method (Telegram or Email)
2. THE Push_Channel SHALL allow users to configure push preferences
3. THE Push_Channel SHALL support daily digest push at configurable time
4. WHEN a trending article is detected, THE Push_Channel SHALL optionally send immediate notification
5. THE Push_Channel SHALL include article title, source, and link in notifications
6. IF push fails, THEN THE system SHALL log the error and retry later

### Requirement 7: 开源项目规范

**User Story:** As a developer, I want the project to follow open-source best practices, so that others can easily understand, use, and contribute to it.

#### Acceptance Criteria

1. THE project SHALL have a comprehensive README with installation and usage instructions
2. THE project SHALL use Docker Compose for one-click deployment
3. THE project SHALL provide example configuration files (.env.example, config.example.yaml)
4. THE project SHALL include API documentation
5. THE project SHALL follow semantic versioning
6. THE project SHALL have a clear project structure following industry conventions
