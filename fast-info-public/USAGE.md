# 如何上传到 GitHub

本目录包含 Fast Info 的公开展示内容，不包含源代码。

## 📁 目录结构

```
fast-info-public/
├── .github/
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       ├── feature_request.md
│       ├── dmca_takedown.md
│       ├── question.md
│       └── config.yml
├── .gitignore
├── README.md
├── LICENSE
├── CHANGELOG.md
└── USAGE.md (本文件，上传后可删除)
```

## 🚀 上传步骤

### 1. 在 GitHub 创建新仓库

1. 访问 https://github.com/new
2. 填写信息：
   - **Repository name**：`fast-info`
   - **Description**：`技术情报分析平台 - 聚合全球优质技术资讯`
   - **Visibility**：**Public** ✅
   - **不要勾选**任何初始化选项（README、.gitignore、License）
3. 点击 **Create repository**

### 2. 初始化本地仓库并推送

```bash
# 进入本目录
cd "/Users/johnny/Project/Fast Info/fast-info-public"

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "docs: 初始化 Fast Info 公开文档

- 添加详细的 README
- 配置 MIT License
- 创建 CHANGELOG
- 设置 Issue 模板（Bug、Feature、DMCA、Question）

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
"

# 添加远程仓库（替换成你的用户名）
git remote add origin https://github.com/你的用户名/fast-info.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 3. 需要替换的占位符

推送前，请全局替换以下内容：

#### README.md、Issue 模板中的占位符：

```bash
# 替换 GitHub 用户名
find . -type f -name "*.md" -exec sed -i '' 's/yourname/你的GitHub用户名/g' {} +

# 替换域名（如果有）
find . -type f -name "*.md" -exec sed -i '' 's/your-domain.com/你的域名/g' {} +

# 如果还没有域名，可以先用 GitHub Pages：
# your-domain.com → 你的用户名.github.io/fast-info
```

### 4. 配置 GitHub 仓库设置

推送后，在 GitHub 上配置：

1. **启用 Issues**：Settings → Features → ✅ Issues
2. **添加 Topics**：About → ⚙️ → 添加：
   - `tech-news`
   - `news-aggregator`
   - `ai-analysis`
   - `developer-tools`
   - `vue3`
   - `nodejs`
3. **添加描述**：About → Description → `技术情报分析平台 - 聚合全球优质技术资讯`

### 5. 可选：添加 Logo

如果有 Logo：

```bash
cp "/Users/johnny/Project/Fast Info/frontend/public/logo.png" ./logo.png
git add logo.png
git commit -m "docs: 添加项目 Logo"
git push
```

然后在 README.md 中更新 Logo 路径。

## ⚠️ 安全提醒

**本仓库绝对不要包含**：
- ❌ 源代码（frontend/backend）
- ❌ API Keys
- ❌ 数据库配置
- ❌ .env 文件
- ❌ node_modules

**只包含**：
- ✅ 项目介绍文档
- ✅ Issue 模板
- ✅ License 和 Changelog
- ✅ Logo 和截图

## 📝 后续维护

### 更新 CHANGELOG

每次有重大更新时：

```bash
cd "/Users/johnny/Project/Fast Info/fast-info-public"

# 编辑 CHANGELOG.md，添加新版本

git add CHANGELOG.md
git commit -m "docs: 更新 CHANGELOG - v0.2.0"
git push
```

### 创建 Release

```bash
# 创建版本标签
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0

# 然后在 GitHub 上：Releases → Draft a new release
```

---

**准备好了吗？** 按照上面的步骤上传吧！

上传后可以删除本 USAGE.md 文件：
```bash
git rm USAGE.md
git commit -m "docs: 移除使用说明"
git push
```
