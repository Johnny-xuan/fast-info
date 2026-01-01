-- 添加国内平台 source 支持
-- Migration: 添加 V2EX、掘金、开源中国、机器之心等国内平台

-- 1. 删除旧的 source 约束
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_source_check;

-- 2. 添加新的 source 约束，包含国内平台
ALTER TABLE articles ADD CONSTRAINT articles_source_check
  CHECK (source = ANY (ARRAY[
    -- 国际平台
    'Hacker News',
    'GitHub Trending',
    'Dev.to',
    'arXiv',
    'AIBase',
    'Product Hunt',
    -- 国内平台
    'V2EX',
    '掘金',
    '开源中国',
    '机器之心',
    'InfoQ',
    '少数派'
  ]::text[]));

-- 3. 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
