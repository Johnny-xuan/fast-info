<template>
  <div class="min-h-screen bg-white">
    <!-- Header 占位 -->
    <div class="h-12"></div>

    <!-- 主内容 -->
    <div class="max-w-4xl mx-auto px-4 py-12">
      <!-- 标题 -->
      <h1 class="text-3xl font-bold mb-2">版权声明</h1>
      <p class="text-gray-500 mb-8">Copyright Notice</p>

      <!-- 最后更新时间 -->
      <div class="text-sm text-gray-500 mb-8">
        最后更新：2025年11月16日
      </div>

      <!-- 内容区域 -->
      <div class="prose prose-slate max-w-none">

        <!-- 产品定位 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">1. 产品定位</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            Fast Info 是一个<strong>技术情报分析平台</strong>，而非内容转载平台。我们的核心价值在于：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>聚合全球优质技术资讯来源</li>
            <li>提供原创的技术分析和趋势洞察</li>
            <li>帮助开发者高效获取有价值的信息</li>
          </ul>
        </section>

        <!-- 内容来源 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">2. 内容来源</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            Fast Info 从以下公开数据源聚合信息：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li><strong>Hacker News</strong> - 通过官方 API 获取</li>
            <li><strong>GitHub Trending</strong> - 公开页面信息</li>
            <li><strong>Dev.to</strong> - 通过官方 API 获取</li>
            <li><strong>arXiv</strong> - 通过官方 API 获取学术论文信息</li>
            <li><strong>AIBase</strong> - 公开的 AI 产品信息</li>
            <li><strong>Product Hunt</strong> - 通过官方 GraphQL API 获取</li>
          </ul>
          <p class="text-gray-700 leading-relaxed">
            所有数据均来自公开的 API 或公开网页，我们严格遵守各平台的使用条款。
          </p>
        </section>

        <!-- 合理使用声明 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">3. 合理使用声明（Fair Use）</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            Fast Info 在以下方面符合"合理使用"原则：
          </p>

          <h3 class="text-xl font-semibold mb-3 mt-6">我们展示的内容：</h3>
          <ul class="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li>文章标题（事实性信息）</li>
            <li>作者信息和发布时间</li>
            <li>数据源 API 提供的官方摘要</li>
            <li>指向原文的链接</li>
            <li>热度数据统计（点赞数、评论数等公开数据）</li>
          </ul>

          <h3 class="text-xl font-semibold mb-3 mt-6">我们不会做的事：</h3>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>抓取并展示完整原文内容</li>
            <li>翻译并展示完整文章</li>
            <li>移除原作者署名或来源信息</li>
            <li>绕过付费墙获取付费内容</li>
            <li>声称他人内容为本平台所有</li>
          </ul>
        </section>

        <!-- AI 生成内容 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">4. AI 生成内容声明</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            Fast Info 使用 AI 技术为用户提供原创分析内容：
          </p>

          <h3 class="text-xl font-semibold mb-3 mt-6">AI 摘要：</h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            基于标题和公开摘要生成的概括性总结，目的是帮助用户快速了解内容主旨。
            这<strong>不是</strong>原文的翻译或改写，而是独立的分析性摘要。
          </p>

          <h3 class="text-xl font-semibold mb-3 mt-6">AI 技术分析：</h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            基于公开信息生成的原创技术评论，包括：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>技术栈分析</li>
            <li>创新点评估</li>
            <li>适用场景建议</li>
            <li>学习价值评分</li>
          </ul>
          <p class="text-gray-700 leading-relaxed mt-4">
            所有 AI 生成的内容均属于 <strong>评论性质的原创内容</strong>，不代表原作者观点。
          </p>
        </section>

        <!-- 版权归属 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">5. 版权归属</h2>
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p class="text-gray-700 font-medium">
              所有原文内容的版权归原作者和原发布平台所有。
            </p>
          </div>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>每篇文章都明确标注来源和作者</li>
            <li>所有文章都提供原文链接</li>
            <li>我们仅提供信息聚合和原创分析服务</li>
            <li>用户查看完整内容需访问原网站</li>
          </ul>
        </section>

        <!-- 侵权投诉 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">6. 侵权投诉</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            如果您认为 Fast Info 上的任何内容侵犯了您的版权或其他权利，请通过以下方式联系我们：
          </p>
          <div class="bg-gray-50 p-6 rounded-lg mb-4">
            <p class="text-gray-700 mb-2">
              <strong>投诉渠道：</strong>
              <router-link to="/dmca" class="text-blue-600 hover:text-blue-800 underline ml-2">
                DMCA 投诉页面
              </router-link>
            </p>
            <p class="text-gray-700 mb-2">
              <strong>响应时间：</strong>24 小时内处理
            </p>
            <p class="text-gray-700">
              <strong>处理方式：</strong>核实后立即移除相关内容
            </p>
          </div>
        </section>

        <!-- 用户责任 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">7. 用户责任</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            使用 Fast Info 时，用户应：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>尊重原作者的版权和知识产权</li>
            <li>通过提供的链接访问原文</li>
            <li>不得将 AI 生成的分析内容作为原文的替代品</li>
            <li>引用内容时应注明 Fast Info 作为来源</li>
          </ul>
        </section>

        <!-- 联系方式 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">8. 联系我们</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            如有任何版权相关问题，请联系：
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

        <!-- 声明更新 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">9. 声明更新</h2>
          <p class="text-gray-700 leading-relaxed">
            本版权声明可能随时更新。我们会在页面顶部标注最后更新时间。
            继续使用 Fast Info 即表示您接受最新的版权声明。
          </p>
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
