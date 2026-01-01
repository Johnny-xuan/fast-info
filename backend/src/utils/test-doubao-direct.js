/**
 * 直接测试豆包 API 连接
 */

require('dotenv').config();

async function testDoubao() {
  const API_KEY = process.env.DOUBAO_API_KEY;
  const API_BASE = process.env.DOUBAO_API_BASE;
  const MODEL = process.env.DOUBAO_MODEL;

  console.log('\n🔍 豆包 API 配置检查:');
  console.log('API_KEY:', API_KEY ? `${API_KEY.substring(0, 10)}...` : '未配置');
  console.log('API_BASE:', API_BASE);
  console.log('MODEL (Endpoint ID):', MODEL);

  console.log('\n📡 发送测试请求...\n');

  try {
    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: '你好，请用一句话介绍你自己'
          }
        ],
        temperature: 0.7,
        max_completion_tokens: 100
      })
    });

    console.log('响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('\n❌ API 调用失败:');
      console.error('错误响应:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ API 调用成功!');
    console.log('\n响应数据:');
    console.log(JSON.stringify(data, null, 2));

    if (data.choices && data.choices[0]) {
      console.log('\n🤖 豆包回复:');
      console.log(data.choices[0].message.content);
    }

  } catch (error) {
    console.error('\n❌ 请求失败:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDoubao();
