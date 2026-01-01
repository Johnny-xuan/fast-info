# Supabase 配置指南

本项目使用 Supabase 作为后端数据库和认证服务。

## 1. 注册 Supabase 账号

访问 [https://supabase.com](https://supabase.com) 并注册账号。

**建议**：使用学校邮箱注册，可能有额外优惠。

## 2. 创建新项目

1. 登录后，点击 "New Project"
2. 填写项目信息：
   - **Name**: Fast Info（或任意名称）
   - **Database Password**: 设置一个强密码（请保存好）
   - **Region**: 选择离你最近的区域（如 Northeast Asia (Seoul) 或 Southeast Asia (Singapore)）
   - **Pricing Plan**: Free（免费版足够使用）

3. 点击 "Create new project"，等待 1-2 分钟项目创建完成

## 3. 运行数据库 Schema

项目创建完成后：

1. 进入项目控制台
2. 点击左侧菜单的 "SQL Editor"
3. 点击 "+ New query"
4. 复制 `backend/database/schema.sql` 的全部内容
5. 粘贴到 SQL 编辑器中
6. 点击 "Run" 或按 Cmd/Ctrl + Enter 执行

**验证**：
- 执行成功后，点击左侧的 "Table Editor"
- 应该能看到 `articles` 表已创建
- 表中包含所有字段和索引

## 4. 获取 API 凭证

1. 点击左侧菜单的 "Project Settings"（齿轮图标）
2. 点击 "API"
3. 找到以下两个值：

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (一串很长的字符串)

## 5. 配置到项目

1. 在 `backend` 目录下创建 `.env` 文件：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入刚才获取的值：
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. 保存文件

## 6. 验证配置

启动后端服务器：

```bash
cd backend
npm run dev
```

如果看到以下输出，说明配置成功：

```
✅ Supabase client initialized
   URL: https://your-project-id.supabase.co

╔════════════════════════════════════════╗
║                                        ║
║       Fast Info Backend Server         ║
║                                        ║
║  Status: Running                       ║
║  Port: 3000                            ║
...
╚════════════════════════════════════════╝
```

## 7. 测试 API

打开浏览器或使用 curl 测试：

```bash
# 健康检查
curl http://localhost:3000/health

# 获取文章列表（现在应该是空数组）
curl http://localhost:3000/api/articles
```

## 常见问题

### Q: schema.sql 执行失败怎么办？

**A**: 检查以下几点：
- 确保在 SQL Editor 中执行，不是在其他地方
- 确保复制了完整的 SQL 内容
- 如果有错误提示，可以尝试分段执行

### Q: 为什么文章列表是空的？

**A**: 这是正常的，因为还没有运行爬虫填充数据。等爬虫开发完成后，会自动填充数据。

### Q: Supabase 免费版有什么限制？

**A**:
- 数据库存储：500 MB
- 文件存储：1 GB
- 带宽：5 GB/月
- API 请求：无限制
- 对于我们的项目来说完全够用

### Q: 如何查看数据库中的数据？

**A**:
1. 进入 Supabase 控制台
2. 点击 "Table Editor"
3. 选择 `articles` 表
4. 可以直接查看、编辑、删除数据

## 下一步

配置完成后，就可以：
1. 开发爬虫模块填充数据
2. 测试 API 接口
3. 连接前端进行联调

## 相关链接

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端文档](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL 教程](https://www.postgresql.org/docs/current/tutorial.html)
