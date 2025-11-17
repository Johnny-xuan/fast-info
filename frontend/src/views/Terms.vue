<template>
  <div class="min-h-screen bg-white">
    <!-- Header 占位 -->
    <div class="h-12"></div>

    <!-- 主内容 -->
    <div class="max-w-4xl mx-auto px-4 py-12">
      <!-- 标题 -->
      <h1 class="text-3xl font-bold mb-2">服务条款</h1>
      <p class="text-gray-500 mb-8">Terms of Service</p>

      <!-- 最后更新时间 -->
      <div class="text-sm text-gray-500 mb-8">
        最后更新：2025年11月16日
      </div>

      <!-- 内容区域 -->
      <div class="prose prose-slate max-w-none">

        <!-- 欢迎 -->
        <section class="mb-10">
          <p class="text-gray-700 leading-relaxed mb-4">
            欢迎使用 Fast Info！在使用我们的服务前，请仔细阅读以下服务条款。
            使用 Fast Info 即表示您同意遵守这些条款。
          </p>
        </section>

        <!-- 服务说明 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">1. 服务说明</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            Fast Info 是一个技术情报分析平台，提供以下服务：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>聚合全球优质技术资讯来源</li>
            <li>提供 AI 生成的技术摘要和分析</li>
            <li>提供趋势预测和技术评分</li>
            <li>帮助开发者高效获取技术信息</li>
          </ul>
        </section>

        <!-- 用户责任 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">2. 用户责任</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            使用 Fast Info 时，您同意：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>不将本平台用于任何非法目的</li>
            <li>尊重原作者的知识产权</li>
            <li>不传播病毒、恶意代码或其他有害内容</li>
            <li>不尝试未经授权访问系统或数据</li>
            <li>不滥用或过度使用服务（如爬虫、批量请求）</li>
          </ul>
        </section>

        <!-- 内容使用 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">3. 内容使用规范</h2>

          <h3 class="text-xl font-semibold mb-3 mt-6">3.1 原文内容</h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            Fast Info 展示的文章标题、摘要等信息来自第三方平台，版权归原作者所有。
            用户应：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li>通过提供的链接访问原文</li>
            <li>不将摘要作为原文的替代品</li>
            <li>引用时注明原作者和来源</li>
          </ul>

          <h3 class="text-xl font-semibold mb-3 mt-6">3.2 AI 生成内容</h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            AI 生成的摘要和分析属于 Fast Info 的原创内容，用户可以：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li>个人学习和参考</li>
            <li>引用时注明来源为 "Fast Info"</li>
          </ul>
          <p class="text-gray-700 leading-relaxed">
            用户不得：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>批量抓取或复制 AI 生成的内容</li>
            <li>将内容用于商业目的而不注明来源</li>
            <li>声称 AI 内容为自己创作</li>
          </ul>
        </section>

        <!-- 隐私保护 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">4. 隐私保护</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            我们重视您的隐私。详细信息请查看：
            <router-link to="/privacy" class="text-blue-600 hover:text-blue-800 underline">
              隐私政策
            </router-link>
          </p>
        </section>

        <!-- 免责声明 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">5. 免责声明</h2>

          <h3 class="text-xl font-semibold mb-3 mt-6">5.1 服务可用性</h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            Fast Info 尽力保证服务的稳定性，但不保证：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>服务不中断或无错误</li>
            <li>所有数据的准确性和完整性</li>
            <li>第三方链接的可用性</li>
          </ul>

          <h3 class="text-xl font-semibold mb-3 mt-6">5.2 AI 内容准确性</h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            AI 生成的摘要和分析仅供参考，可能存在错误或不准确之处。
            用户应：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>将 AI 分析作为参考，而非绝对依据</li>
            <li>重要决策前查看原文</li>
            <li>自行判断内容的准确性</li>
          </ul>

          <h3 class="text-xl font-semibold mb-3 mt-6">5.3 第三方内容</h3>
          <p class="text-gray-700 leading-relaxed">
            Fast Info 不对第三方平台的内容负责。原文内容的准确性、合法性由原作者和原平台负责。
          </p>
        </section>

        <!-- 知识产权 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">6. 知识产权</h2>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>Fast Info 的网站设计、代码、Logo 等归开发者所有</li>
            <li>AI 生成的分析内容归 Fast Info 所有</li>
            <li>第三方内容的版权归原作者所有</li>
            <li>用户在平台的反馈和建议，授予 Fast Info 使用权</li>
          </ul>
        </section>

        <!-- 服务变更 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">7. 服务变更和终止</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            Fast Info 保留以下权利：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>随时修改或终止服务（部分或全部）</li>
            <li>更新服务条款</li>
            <li>限制或终止违反条款的用户访问</li>
            <li>移除侵权或不当内容</li>
          </ul>
          <p class="text-gray-700 leading-relaxed mt-4">
            重大变更会在网站上公布，继续使用服务即表示接受新条款。
          </p>
        </section>

        <!-- 赔偿责任 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">8. 赔偿责任限制</h2>
          <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <p class="text-gray-700">
              Fast Info 是<strong>免费</strong>的学生项目，按"现状"提供服务。
            </p>
          </div>
          <p class="text-gray-700 leading-relaxed mb-4">
            在法律允许的最大范围内，Fast Info 及其开发者对以下情况不承担责任：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>使用或无法使用服务导致的任何损失</li>
            <li>数据丢失、错误或中断</li>
            <li>第三方内容的准确性或合法性</li>
            <li>AI 生成内容的错误或不准确</li>
            <li>通过服务获取的信息导致的任何决策后果</li>
          </ul>
        </section>

        <!-- 适用法律 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">9. 适用法律</h2>
          <p class="text-gray-700 leading-relaxed">
            本服务条款受中华人民共和国法律管辖。
            如发生争议，双方应友好协商解决；协商不成的，提交有管辖权的人民法院裁决。
          </p>
        </section>

        <!-- 联系我们 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">10. 联系我们</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            如对服务条款有任何疑问，请通过以下方式联系：
          </p>
          <div class="bg-gray-50 p-6 rounded-lg">
            <p class="text-gray-700 mb-2">
              <strong>项目主页：</strong>
              <a href="https://github.com/yourname/fast-info" target="_blank"
                 class="text-blue-600 hover:text-blue-800 underline ml-2">
                GitHub
              </a>
            </p>
            <p class="text-gray-700">
              <strong>开发者：</strong>Johnny
            </p>
          </div>
        </section>

      </div>

      <!-- 返回首页 -->
      <div class="mt-12 pt-8 border-t">
        <router-link to="/"
          class="inline-flex items-center text-blue-600 hover:text-blue-800">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// 页面逻辑
</script>

<style scoped>
.prose h2 {
  color: #1a202c;
}
.prose h3 {
  color: #2d3748;
}
</style>
