-- 添加 'opensource' 分类迁移脚本
-- 执行时间: 2025-11-16

-- 1. 删除现有的 category CHECK 约束
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_category_check;

-- 2. 添加新的 CHECK 约束，包含 'opensource'
ALTER TABLE articles ADD CONSTRAINT articles_category_check
CHECK (category IN ('tech', 'dev', 'academic', 'opensource'));

-- 3. 将现有的 GitHub Trending 文章更新为 'opensource' 分类
UPDATE articles
SET category = 'opensource'
WHERE source = 'GitHub Trending';

-- 4. 验证更新
SELECT category, COUNT(*) as count
FROM articles
GROUP BY category
ORDER BY count DESC;
