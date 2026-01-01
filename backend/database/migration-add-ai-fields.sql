-- 数据库迁移：添加 AI 分析字段
-- 日期：2025-11-17
-- 用途：为 articles 表添加 AI 摘要和技术分析字段

-- 添加 AI 摘要字段（200-500字的简短分析）
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- 添加 AI 深度分析字段（500-1000字的详细技术分析）
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS ai_analysis TEXT;

-- 添加 AI 生成时间戳字段
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS ai_generated_at TIMESTAMP;

-- 添加 AI 生成状态字段（pending, processing, completed, failed）
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS ai_status VARCHAR(20) DEFAULT 'pending';

-- 为 AI 状态字段创建索引，方便查询待生成的文章
CREATE INDEX IF NOT EXISTS idx_articles_ai_status ON articles(ai_status);

-- 为 AI 生成时间戳创建索引
CREATE INDEX IF NOT EXISTS idx_articles_ai_generated_at ON articles(ai_generated_at);

COMMENT ON COLUMN articles.ai_summary IS 'AI 生成的技术摘要（200-500字）';
COMMENT ON COLUMN articles.ai_analysis IS 'AI 生成的深度技术分析（500-1000字）';
COMMENT ON COLUMN articles.ai_generated_at IS 'AI 内容生成时间';
COMMENT ON COLUMN articles.ai_status IS 'AI 生成状态：pending, processing, completed, failed';
