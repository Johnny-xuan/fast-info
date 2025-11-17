/**
 * AI Service - 豆包大模型服务
 * 用于生成文章的 AI 摘要和技术分析
 */

require('dotenv').config();

class AIService {
  constructor() {
    this.apiKey = process.env.DOUBAO_API_KEY;
    this.apiBase = process.env.DOUBAO_API_BASE;
    this.model = process.env.DOUBAO_MODEL;

    if (!this.apiKey) {
      console.warn('⚠️  豆包 API Key 未配置，AI 功能将不可用');
    }
  }

  /**
   * 生成文章的 AI 摘要
   * @param {Object} article - 文章对象 { title, summary, source, category }
   * @returns {Promise<string|null>} AI 生成的摘要文本
   */
  async generateSummary(article) {
    // 1. 检查 API Key
    if (!this.apiKey) {
      console.error('豆包 API Key 未配置');
      return null;
    }

    // 2. 检查文章是否有足够的内容
    if (!article.summary || article.summary.length < 20) {
      console.log(`跳过 ${article.title}：摘要太短或不存在`);
      return null;
    }

    // 3. 构建 Prompt
    const prompt = this._buildSummaryPrompt(article);

    // 4. 调用豆包 API
    try {
      const response = await fetch(`${this.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一位专业的技术分析师，擅长评估技术价值和创新点。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_completion_tokens: 1000  // 增加到 1000，确保有足够空间生成完整摘要
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ 豆包 API 错误:');
        console.error('   Status:', response.status, response.statusText);
        console.error('   Response:', error);
        return null;
      }

      const data = await response.json();
      const message = data.choices[0].message;

      // 豆包深度思考模式：优先使用 content，如果为空则使用 reasoning_content
      let summary = message.content || message.reasoning_content || '';

      // 如果两者都有，合并（但通常只需要 content）
      if (!summary.trim()) {
        console.error('⚠️  豆包返回的内容为空');
        return null;
      }

      console.log(`✅ 成功生成 AI 摘要: ${article.title}`);
      console.log(`   内容长度: ${summary.length} 字符`);
      return summary;

    } catch (error) {
      console.error('调用豆包 API 失败:', error);
      return null;
    }
  }

  /**
   * 生成文章的深度技术分析
   * @param {Object} article - 文章对象
   * @returns {Promise<string|null>} AI 生成的技术分析
   */
  async generateAnalysis(article) {
    if (!this.apiKey) {
      console.error('豆包 API Key 未配置');
      return null;
    }

    if (!article.summary || article.summary.length < 50) {
      console.log(`跳过深度分析 ${article.title}：内容不足`);
      return null;
    }

    const prompt = this._buildAnalysisPrompt(article);

    try {
      const response = await fetch(`${this.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一位资深技术专家，擅长深度技术分析和技术选型建议。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_completion_tokens: 2000  // 深度分析需要更多空间
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ 豆包 API 错误:');
        console.error('   Status:', response.status, response.statusText);
        console.error('   Response:', error);
        return null;
      }

      const data = await response.json();
      const analysis = data.choices[0].message.content;

      console.log(`✅ 成功生成深度分析: ${article.title}`);
      return analysis;

    } catch (error) {
      console.error('调用豆包 API 失败:', error);
      return null;
    }
  }

  /**
   * 构建 AI 摘要的 Prompt
   * @private
   */
  _buildSummaryPrompt(article) {
    return `请直接输出以下格式的技术分析（不要包含任何思考过程或说明）：

💡 核心价值
用1-2句话概括这项技术的核心价值和实际应用意义

✨ 技术亮点
• 关键创新点1
• 关键创新点2
• 关键创新点3

🎯 适用场景
1-2句话说明适合的使用场景和目标人群

---
以下是文章信息，请基于这些信息生成上述格式的分析：

标题：${article.title}
来源：${article.source}
分类：${article.category}
原文摘要：${article.summary}

要求：
1. 直接输出分析内容，不要输出思考过程
2. 严格遵守上述三段式格式
3. 使用简洁专业的中文
4. 总字数200-250字`;
  }

  /**
   * 构建深度技术分析的 Prompt
   * @private
   */
  _buildAnalysisPrompt(article) {
    return `作为一位资深技术专家，请对以下技术内容进行深度分析：

标题：${article.title}
来源：${article.source}
官方摘要：${article.summary}
分类：${article.category}

请按以下结构提供深度分析（500-800字）：

## 技术栈分析
- 使用了哪些核心技术？
- 技术选型的优势和劣势

## 创新点详解
1. 核心创新点是什么？
2. 与现有解决方案的区别
3. 技术难点和突破

## 应用场景
✅ 适合：具体场景1、场景2
❌ 不适合：具体场景3、场景4

## 学习价值评分
⭐⭐⭐⭐⭐ (1-5星)
推荐理由：...

## 推荐指数
⭐⭐⭐⭐ (X/5)
综合评价：...

请用中文输出，提供专业但易懂的分析。`;
  }

  /**
   * 批量生成摘要
   * @param {Array} articles - 文章数组
   * @param {Object} options - 选项 { maxCount, delayMs }
   * @returns {Promise<Object>} { success: number, failed: number }
   */
  async batchGenerateSummaries(articles, options = {}) {
    const { maxCount = 10, delayMs = 1000 } = options;

    let success = 0;
    let failed = 0;

    const articlesToProcess = articles.slice(0, maxCount);

    console.log(`\n🤖 开始批量生成 AI 摘要，共 ${articlesToProcess.length} 篇\n`);

    for (const article of articlesToProcess) {
      const summary = await this.generateSummary(article);

      if (summary) {
        success++;
        // 这里应该保存到数据库，但现在先返回结果
      } else {
        failed++;
      }

      // 延迟，避免 API 限流
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    console.log(`\n✅ 批量生成完成：成功 ${success} 篇，失败 ${failed} 篇\n`);

    return { success, failed };
  }
}

module.exports = new AIService();
