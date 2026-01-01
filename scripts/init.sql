-- Fast Info 数据库初始化脚本
-- PostgreSQL 15+

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- articles 表（文章存储）
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  summary TEXT,
  ai_summary TEXT,
  source VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL,
  quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  hot_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 全文搜索索引（支持中英文）
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles 
USING GIN (to_tsvector('simple', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(ai_summary, '')));

-- 常用查询索引
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_hot_score ON articles(hot_score DESC);

-- conversations 表（对话历史）
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tool_calls JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id, created_at);

-- push_configs 表（推送配置）
CREATE TABLE IF NOT EXISTS push_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('telegram', 'email')),
  config JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  daily_digest_time TIME DEFAULT '09:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER push_configs_updated_at
  BEFORE UPDATE ON push_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 插入测试数据（可选）
-- INSERT INTO articles (title, url, source, category, quality_score, hot_score) VALUES
-- ('Vue 3.5 发布：性能大幅提升', 'https://example.com/vue-3.5', 'devto', 'dev', 85, 120),
-- ('GPT-5 传闻：多模态能力增强', 'https://example.com/gpt-5', 'hackernews', 'tech', 90, 200);

COMMENT ON TABLE articles IS '文章存储表';
COMMENT ON TABLE conversations IS '对话历史表';
COMMENT ON TABLE push_configs IS '推送配置表';
