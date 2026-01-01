/**
 * AI 功能测试脚本
 * 用于测试豆包 API 的连接和 AI 摘要生成功能
 */

const aiService = require('../services/aiService');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAIService() {
  console.log('\n🔍 开始测试 AI 服务...\n');

  try {
    // 1. 获取一篇有摘要的文章
    console.log('1️⃣  查找测试文章...');
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .not('summary', 'is', null)
      .limit(1);

    if (error || !articles || articles.length === 0) {
      console.error('❌ 没有找到合适的测试文章');
      return;
    }

    const testArticle = articles[0];
    console.log(`✅ 找到测试文章: ${testArticle.title}`);
    console.log(`   来源: ${testArticle.source}`);
    console.log(`   摘要长度: ${testArticle.summary ? testArticle.summary.length : 0} 字符`);

    // 2. 测试 AI 摘要生成
    console.log('\n2️⃣  测试 AI 摘要生成...');
    console.log('   调用豆包 API...');

    const startTime = Date.now();
    const aiSummary = await aiService.generateSummary(testArticle);
    const endTime = Date.now();

    console.log('   返回的 aiSummary 类型:', typeof aiSummary);
    console.log('   返回的 aiSummary 值:', aiSummary);

    if (aiSummary) {
      console.log(`✅ AI 摘要生成成功！`);
      console.log(`   耗时: ${endTime - startTime} ms`);
      console.log(`   摘要长度: ${aiSummary.length} 字符`);
      console.log('\n--- AI 生成的摘要 ---');
      console.log(aiSummary);
      console.log('--- 结束 ---\n');

      // 3. 保存到数据库
      console.log('3️⃣  保存到数据库...');
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          ai_summary: aiSummary,
          ai_status: 'completed',
          ai_generated_at: new Date().toISOString()
        })
        .eq('id', testArticle.id);

      if (updateError) {
        console.error('❌ 保存失败:', updateError);
      } else {
        console.log('✅ 保存成功！');
      }

      // 4. 显示统计
      console.log('\n4️⃣  AI 生成统计:');
      const { count: total } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      const { count: completed } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('ai_status', 'completed');

      console.log(`   总文章数: ${total}`);
      console.log(`   已生成 AI 摘要: ${completed}`);
      console.log(`   完成率: ${((completed / total) * 100).toFixed(2)}%`);

      console.log('\n✅ AI 功能测试通过！\n');

    } else {
      console.error('❌ AI 摘要生成失败');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testAIService()
  .then(() => {
    console.log('测试完成');
    process.exit(0);
  })
  .catch(error => {
    console.error('测试出错:', error);
    process.exit(1);
  });
