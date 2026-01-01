-- Fast Info 数据库 Schema
-- 用于 Supabase PostgreSQL 数据库

-- 创建文章表
CREATE TABLE IF NOT EXISTS articles (
  -- 主键
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 基本信息
  title TEXT NOT NULL CHECK (char_length(title) <= 500),
  summary TEXT CHECK (char_length(summary) <= 2000),
  url TEXT NOT NULL UNIQUE,
  cover TEXT,

  -- 来源和分类
  source TEXT NOT NULL CHECK (source IN (
    'GitHub Trending',
    'Hacker News',
    'Dev.to',
    '掘金',
    'V2EX',
    '少数派',
    'IT之家',
    'arXiv',
    '36氪',
    'CSDN'
  )),
  category TEXT NOT NULL CHECK (category IN ('tech', 'dev', 'academic')),

  -- 标签（存储为 JSON 数组）
  tags JSONB DEFAULT '[]'::jsonb,

  -- 作者
  author TEXT,

  -- 时间
  published_at TIMESTAMPTZ,
  crawled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 热度相关
  hot_score DECIMAL(10, 2) DEFAULT 0,
  quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),

  -- 统计数据
  views INTEGER DEFAULT 0 CHECK (views >= 0),
  likes INTEGER DEFAULT 0 CHECK (likes >= 0),
  comments INTEGER DEFAULT 0 CHECK (comments >= 0),

  -- 状态
  is_pinned BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,

  -- 额外数据（JSON）
  metadata JSONB DEFAULT '{}'::jsonb,

  -- 时间戳
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引以优化查询
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_hot_score ON articles(hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_is_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_crawled_at ON articles(crawled_at DESC);

-- 复合索引（用于常见查询）
CREATE INDEX IF NOT EXISTS idx_articles_category_published ON articles(category, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category_hot ON articles(category, hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_published_category_created ON articles(is_published, category, created_at DESC);

-- 全文搜索索引
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING gin(to_tsvector('english', title || ' ' || COALESCE(summary, '')));

-- 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略（RLS）
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户读取已发布的文章
CREATE POLICY "Allow anonymous read published articles"
  ON articles
  FOR SELECT
  TO anon
  USING (is_published = true);

-- 允许认证用户读取所有文章
CREATE POLICY "Allow authenticated read all articles"
  ON articles
  FOR SELECT
  TO authenticated
  USING (true);

-- 允许认证用户创建文章（用于爬虫）
CREATE POLICY "Allow authenticated insert articles"
  ON articles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 允许认证用户更新文章
CREATE POLICY "Allow authenticated update articles"
  ON articles
  FOR UPDATE
  TO authenticated
  USING (true);

-- 允许认证用户删除文章
CREATE POLICY "Allow authenticated delete articles"
  ON articles
  FOR DELETE
  TO authenticated
  USING (true);

-- 注释
COMMENT ON TABLE articles IS '文章表，存储从各个数据源爬取的新闻和文章';
COMMENT ON COLUMN articles.id IS '文章唯一标识符';
COMMENT ON COLUMN articles.title IS '文章标题';
COMMENT ON COLUMN articles.summary IS '文章摘要';
COMMENT ON COLUMN articles.url IS '原文链接，唯一索引';
COMMENT ON COLUMN articles.source IS '数据来源';
COMMENT ON COLUMN articles.category IS '分类：tech（科技）、dev（开发者）、academic（学术）';
COMMENT ON COLUMN articles.hot_score IS '热度分数，用于排序';
COMMENT ON COLUMN articles.quality_score IS '质量分数，0-100';
COMMENT ON COLUMN articles.is_published IS '是否已发布，用于审核';
