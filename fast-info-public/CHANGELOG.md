# Changelog

All notable changes to Fast Info will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- AI 智能摘要功能
- AI 深度技术分析
- 搜索功能
- 用户系统和登录
- 个性化推荐

---

## [0.1.0] - 2025-11-16

### Added - 新功能

**核心功能**
- 🎉 首次发布！Fast Info Beta 版本上线
- 🌐 集成 6 个数据源：Hacker News, GitHub Trending, Dev.to, arXiv, AIBase, Product Hunt
- 🏷️ 自动分类系统：tech, dev, opensource, academic, product
- 📊 智能评分系统：质量分和热度分
- 🔄 自动爬虫调度：定时抓取最新内容
- 🧹 自动数据清理：48 小时自动清理旧数据

**前端页面**
- 🏠 首页：Figma 极简风格设计
- 📑 分类页面：Tech, Dev, Academic
- 🔍 搜索页面（占位）
- ⚖️ 法律合规页面：版权声明、服务条款、隐私政策、DMCA 投诉
- 📱 基础响应式支持

**技术实现**
- ⚡ 前端：Vue 3 + Vite + TailwindCSS + Geist 字体
- 🔧 后端：Node.js + Express + Supabase PostgreSQL
- 🕷️ 爬虫：多种技术（API、HTML 解析、Puppeteer）
- 🎨 设计：48px 固定顶栏 + transform 效果

### Changed - 改进

**产品定位**
- 从"信息聚合平台"调整为"技术情报分析平台"
- 明确不转载内容，只提供分析和聚合

**法律合规**
- 所有文章明确标注来源
- 提供 DMCA 投诉渠道
- 添加版权声明和用户协议

### Technical Details - 技术细节

**数据统计**（截至 2025-11-16）
- 数据库文章：132 篇
- 数据源：6 个稳定运行
- 分类：5 个
- 爬虫频率：2-6 小时/次

**架构**
- 前端部署：Vercel（规划中）
- 后端部署：Railway/Render（规划中）
- 数据库：Supabase PostgreSQL（免费版）
- 爬虫：node-cron 定时任务

---

## [0.0.1] - 2025-11-15

### Added
- 项目初始化
- 项目策划文档（PROJECT_PLAN.md）
- 开发工作流文档（WORKFLOW.md）
- AI 助手工作指南（AI_GUIDE.md）
- 基础前后端框架搭建

---

## 版本号说明

- **Major（主版本）**：重大功能变更或架构调整
- **Minor（次版本）**：新功能添加
- **Patch（修订号）**：Bug 修复和小改进

当前版本：`0.1.0`
- `0`：项目处于初期阶段（1.0.0 发布前）
- `1`：已有基础功能
- `0`：首个 Beta 版本

---

## 更新类型说明

- **Added**：新功能
- **Changed**：现有功能的改进
- **Deprecated**：即将废弃的功能
- **Removed**：已移除的功能
- **Fixed**：Bug 修复
- **Security**：安全相关更新

---

**最后更新**：2025-11-16
