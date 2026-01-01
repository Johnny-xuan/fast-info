/**
 * 自动 AI 摘要生成服务
 * 监听新文章并自动生成 AI 摘要
 */

const aiService = require('./aiService');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class AutoAIService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.checkInterval = 60000; // 每 60 秒检查一次
  }

  /**
   * 启动自动 AI 生成服务
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  自动 AI 服务已在运行中');
      return;
    }

    this.isRunning = true;
    console.log('🤖 启动自动 AI 摘要生成服务');
    console.log(`   检查间隔: ${this.checkInterval / 1000} 秒`);

    // 立即执行一次
    this.processNewArticles();

    // 定时执行
    this.intervalId = setInterval(() => {
      this.processNewArticles();
    }, this.checkInterval);
  }

  /**
   * 停止自动 AI 生成服务
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('🛑 停止自动 AI 摘要生成服务');
  }

  /**
   * 处理新文章
   * @private
   */
  async processNewArticles() {
    try {
      // 1. 查找待生成 AI 摘要的文章（有摘要且未生成 AI）
      const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .is('ai_summary', null)
        .not('summary', 'is', null)
        .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // 只处理 24 小时内的文章
        .order('published_at', { ascending: false })
        .limit(5); // 每次最多处理 5 篇

      if (error) {
        console.error('查询待处理文章失败:', error);
        return;
      }

      if (!articles || articles.length === 0) {
        // 没有待处理的文章
        return;
      }

      console.log(`\n🆕 发现 ${articles.length} 篇新文章待生成 AI 摘要\n`);

      // 2. 逐篇生成 AI 摘要
      for (const article of articles) {
        await this.generateSummaryForArticle(article);

        // 延迟 2 秒，避免 API 限流
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error('处理新文章失败:', error);
    }
  }

  /**
   * 为单篇文章生成 AI 摘要
   * @private
   */
  async generateSummaryForArticle(article) {
    try {
      // 1. 标记为处理中
      await supabase
        .from('articles')
        .update({ ai_status: 'processing' })
        .eq('id', article.id);

      console.log(`🔄 正在生成: ${article.title.substring(0, 50)}...`);

      // 2. 调用 AI Service 生成摘要
      const aiSummary = await aiService.generateSummary(article);

      if (aiSummary) {
        // 3. 保存到数据库
        await supabase
          .from('articles')
          .update({
            ai_summary: aiSummary,
            ai_status: 'completed',
            ai_generated_at: new Date().toISOString()
          })
          .eq('id', article.id);

        console.log(`✅ 成功: ${article.title.substring(0, 50)}...`);
      } else {
        // 4. 标记为失败
        await supabase
          .from('articles')
          .update({ ai_status: 'failed' })
          .eq('id', article.id);

        console.log(`❌ 失败: ${article.title.substring(0, 50)}...`);
      }

    } catch (error) {
      console.error(`处理文章失败: ${article.title}`, error);

      // 标记为失败
      await supabase
        .from('articles')
        .update({ ai_status: 'failed' })
        .eq('id', article.id);
    }
  }

  /**
   * 手动触发为新文章生成 AI 摘要
   * @param {string} articleId - 文章 ID
   */
  async generateForNewArticle(articleId) {
    try {
      const { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error || !article) {
        console.error('文章不存在:', articleId);
        return false;
      }

      // 检查是否已有 AI 摘要
      if (article.ai_summary) {
        console.log('文章已有 AI 摘要:', article.title);
        return true;
      }

      // 生成摘要
      await this.generateSummaryForArticle(article);
      return true;

    } catch (error) {
      console.error('生成失败:', error);
      return false;
    }
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      nextCheck: this.intervalId ? new Date(Date.now() + this.checkInterval).toISOString() : null
    };
  }
}

// 创建单例
const autoAIService = new AutoAIService();

module.exports = autoAIService;
