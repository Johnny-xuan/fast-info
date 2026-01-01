#!/bin/bash
# Fast Info 部署脚本
# 用法: ./scripts/deploy.sh

set -e

echo "🚀 Fast Info 部署脚本"
echo "===================="

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "❌ 错误: .env 文件不存在"
    echo "请复制 .env.example 为 .env 并配置"
    exit 1
fi

# 加载环境变量
source .env

# 检查必要的环境变量
if [ -z "$DB_PASSWORD" ]; then
    echo "❌ 错误: DB_PASSWORD 未设置"
    exit 1
fi

echo "📦 拉取最新代码..."
git pull origin main 2>/dev/null || true

echo "🐳 启动 Docker 服务..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

echo "⏳ 等待数据库启动..."
sleep 10

echo "✅ 部署完成!"
echo ""
echo "服务状态:"
docker-compose ps
echo ""
echo "访问地址:"
echo "  - 前端: http://localhost:${FRONTEND_PORT:-8080}"
echo "  - 后端: http://localhost:${BACKEND_PORT:-3000}"
echo "  - API 文档: http://localhost:${BACKEND_PORT:-3000}/api"
echo ""
echo "查看日志: docker-compose logs -f"
