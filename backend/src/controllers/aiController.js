/**
 * AI Controller - 处理 AI 相关的请求
 */

const aiService = require('../services/aiService');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class AIController {
  /**
   * 为单篇文章生成 AI 摘要
   * POST /api/ai/generate-summary/:id
   */
  async generateSummary(req, res) {
    try {
      const { id } = req.params;

      // 1. 获取文章
      const { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !article) {
        return res.status(404).json({ error: '文章不存在' });
      }

      // 2. 检查是否已有 AI 摘要
      if (article.ai_summary && article.ai_status === 'completed') {
        return res.json({
          message: 'AI 摘要已存在',
          article: {
            id: article.id,
            title: article.title,
            ai_summary: article.ai_summary,
            ai_generated_at: article.ai_generated_at
          }
        });
      }

      // 3. 标记为处理中
      await supabase
        .from('articles')
        .update({ ai_status: 'processing' })
        .eq('id', id);

      // 4. 生成 AI 摘要
      const aiSummary = await aiService.generateSummary(article);

      if (!aiSummary) {
        await supabase
          .from('articles')
          .update({ ai_status: 'failed' })
          .eq('id', id);

        return res.status(500).json({ error: 'AI 摘要生成失败' });
      }

      // 5. 保存到数据库
      const { data: updated } = await supabase
        .from('articles')
        .update({
          ai_summary: aiSummary,
          ai_status: 'completed',
          ai_generated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      res.json({
        message: 'AI 摘要生成成功',
        article: {
          id: updated.id,
          title: updated.title,
          ai_summary: updated.ai_summary,
          ai_generated_at: updated.ai_generated_at
        }
      });

    } catch (error) {
      console.error('生成 AI 摘要失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 为单篇文章生成深度分析
   * POST /api/ai/generate-analysis/:id
   */
  async generateAnalysis(req, res) {
    try {
      const { id } = req.params;

      const { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !article) {
        return res.status(404).json({ error: '文章不存在' });
      }

      if (article.ai_analysis) {
        return res.json({
          message: 'AI 深度分析已存在',
          article: {
            id: article.id,
            title: article.title,
            ai_analysis: article.ai_analysis
          }
        });
      }

      const aiAnalysis = await aiService.generateAnalysis(article);

      if (!aiAnalysis) {
        return res.status(500).json({ error: 'AI 深度分析生成失败' });
      }

      const { data: updated } = await supabase
        .from('articles')
        .update({
          ai_analysis: aiAnalysis,
          ai_generated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      res.json({
        message: 'AI 深度分析生成成功',
        article: {
          id: updated.id,
          title: updated.title,
          ai_analysis: updated.ai_analysis
        }
      });

    } catch (error) {
      console.error('生成 AI 深度分析失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 批量生成 AI 摘要
   * POST /api/ai/batch-generate
   */
  async batchGenerate(req, res) {
    try {
      const { limit = 10, category, source } = req.body;

      // 1. 查询需要生成 AI 摘要的文章
      let query = supabase
        .from('articles')
        .select('*')
        .is('ai_summary', null)
        .not('summary', 'is', null)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      if (source) {
        query = query.eq('source', source);
      }

      const { data: articles, error } = await query;

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (!articles || articles.length === 0) {
        return res.json({ message: '没有需要生成 AI 摘要的文章' });
      }

      // 2. 开始批量生成
      res.json({
        message: `开始批量生成 ${articles.length} 篇文章的 AI 摘要`,
        count: articles.length,
        status: 'processing'
      });

      // 3. 异步处理（不阻塞响应）
      this._processBatchGeneration(articles);

    } catch (error) {
      console.error('批量生成失败:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 私有方法：处理批量生成
   * @private
   */
  async _processBatchGeneration(articles) {
    console.log(`\n🤖 开始批量生成 ${articles.length} 篇 AI 摘要\n`);

    for (const article of articles) {
      try {
        // 标记为处理中
        await supabase
          .from('articles')
          .update({ ai_status: 'processing' })
          .eq('id', article.id);

        // 生成 AI 摘要
        const aiSummary = await aiService.generateSummary(article);

        if (aiSummary) {
          // 保存
          await supabase
            .from('articles')
            .update({
              ai_summary: aiSummary,
              ai_status: 'completed',
              ai_generated_at: new Date().toISOString()
            })
            .eq('id', article.id);

          console.log(`✅ 成功: ${article.title}`);
        } else {
          await supabase
            .from('articles')
            .update({ ai_status: 'failed' })
            .eq('id', article.id);

          console.log(`❌ 失败: ${article.title}`);
        }

        // 延迟 1 秒，避免 API 限流
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`处理失败: ${article.title}`, error);
      }
    }

    console.log('\n✅ 批量生成完成\n');
  }

  /**
   * 获取 AI 生成统计
   * GET /api/ai/stats
   */
  async getStats(req, res) {
    try {
      // 统计各状态的数量
      const { count: totalCount } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      const { count: completedCount } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('ai_status', 'completed');

      const { count: pendingCount } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('ai_status', 'pending');

      const { count: failedCount } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('ai_status', 'failed');

      const { count: processingCount } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('ai_status', 'processing');

      res.json({
        total: totalCount,
        completed: completedCount,
        pending: pendingCount,
        processing: processingCount,
        failed: failedCount,
        completion_rate: ((completedCount / totalCount) * 100).toFixed(2) + '%'
      });

    } catch (error) {
      console.error('获取统计信息失败:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AIController();
