CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  summary TEXT,
  source TEXT NOT NULL,
  category TEXT DEFAULT 'tech',
  tags TEXT[],
  image_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  hot_score INTEGER DEFAULT 0
);

CREATE INDEX idx_articles_source ON articles(source);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_hot_score ON articles(hot_score DESC);
CREATE INDEX idx_articles_title_gin ON articles USING gin(to_tsvector('english', title));

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  avatar TEXT,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- 用户设置表 (每个用户独立的 API 配置)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);

CREATE INDEX idx_users_provider ON users(provider, provider_id);
CREATE INDEX idx_user_settings_user ON user_settings(user_id);

-- 爬虫执行记录表
CREATE TABLE IF NOT EXISTS crawler_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  total_count INTEGER DEFAULT 0,
  new_count INTEGER DEFAULT 0,
  source_stats JSONB DEFAULT '{}',
  status TEXT DEFAULT 'running',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crawler_logs_started_at ON crawler_logs(started_at DESC);
CREATE INDEX idx_crawler_logs_status ON crawler_logs(status);
