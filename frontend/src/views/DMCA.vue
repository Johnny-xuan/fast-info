<template>
  <div class="min-h-screen bg-white">
    <!-- Header 占位 -->
    <div class="h-12"></div>

    <!-- 主内容 -->
    <div class="max-w-4xl mx-auto px-4 py-12">
      <!-- 标题 -->
      <h1 class="text-3xl font-bold mb-2">DMCA 版权投诉</h1>
      <p class="text-gray-500 mb-8">Digital Millennium Copyright Act Notice</p>

      <!-- 最后更新时间 -->
      <div class="text-sm text-gray-500 mb-8">
        最后更新：2025年11月16日
      </div>

      <!-- 内容区域 -->
      <div class="prose prose-slate max-w-none">

        <!-- 引言 -->
        <section class="mb-10">
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p class="text-gray-700 font-medium">
              Fast Info 尊重知识产权，并致力于遵守《数字千年版权法》(DMCA) 及相关法律。
            </p>
          </div>
          <p class="text-gray-700 leading-relaxed">
            如果您认为 Fast Info 上展示的内容侵犯了您的版权，请按照以下流程提交投诉。
          </p>
        </section>

        <!-- 我们的立场 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">1. Fast Info 的立场</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            首先，请了解 Fast Info 的运作方式：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li><strong>我们不存储原文内容</strong> - 只展示标题、来源摘要和链接</li>
            <li><strong>我们提供原创分析</strong> - AI 生成的摘要和技术分析属于评论性质</li>
            <li><strong>我们明确标注来源</strong> - 所有内容都标注原作者和原链接</li>
            <li><strong>我们引导流量到原网站</strong> - 用户需访问原链接查看完整内容</li>
          </ul>
          <p class="text-gray-700 leading-relaxed mt-4">
            我们相信这符合"合理使用"（Fair Use）原则，但如果您仍认为有侵权行为，我们会认真对待。
          </p>
        </section>

        <!-- 投诉前须知 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">2. 提交投诉前请考虑</h2>

          <h3 class="text-xl font-semibold mb-3 mt-6">2.1 是否真的侵权？</h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            以下情况通常<strong>不构成</strong>侵权：
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-700 mb-4">
            <li>仅展示标题和公开摘要</li>
            <li>提供指向您网站的链接（这实际上帮您引流）</li>
            <li>对公开信息的评论和分析</li>
            <li>使用官方 API 获取的数据</li>
          </ul>

          <h3 class="text-xl font-semibold mb-3 mt-6">2.2 替代方案</h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            在提交 DMCA 投诉前，您可以：
          </p>
          <div class="bg-green-50 p-4 rounded-lg">
            <ol class="list-decimal pl-6 space-y-2 text-gray-700">
              <li><strong>简单请求移除</strong> - 通过 GitHub Issues 礼貌地请求我们移除特定内容</li>
              <li><strong>联系沟通</strong> - 告诉我们您的顾虑，我们可能可以调整展示方式</li>
              <li><strong>加入白名单</strong> - 如果您不希望内容出现在 Fast Info，我们可以将您的网站加入排除列表</li>
            </ol>
          </div>
          <p class="text-gray-700 leading-relaxed mt-4">
            <strong>注意：</strong>提交虚假 DMCA 投诉可能导致法律责任（伪证罪）。
          </p>
        </section>

        <!-- 如何提交投诉 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">3. 如何提交 DMCA 投诉</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            如果您坚持认为存在侵权行为，请提供以下信息：
          </p>

          <h3 class="text-xl font-semibold mb-3 mt-6">必需信息：</h3>
          <div class="bg-gray-50 p-6 rounded-lg">
            <ol class="list-decimal pl-6 space-y-4 text-gray-700">
              <li>
                <strong>您的身份信息：</strong>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>真实姓名或授权代理人姓名</li>
                  <li>联系方式（邮箱、电话）</li>
                  <li>物理地址</li>
                </ul>
              </li>
              <li>
                <strong>版权作品信息：</strong>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>被侵权作品的描述</li>
                  <li>原作品的链接或位置</li>
                  <li>版权归属证明</li>
                </ul>
              </li>
              <li>
                <strong>侵权内容信息：</strong>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>Fast Info 上侵权内容的具体 URL</li>
                  <li>侵权方式的详细说明</li>
                  <li>为什么不符合"合理使用"的理由</li>
                </ul>
              </li>
              <li>
                <strong>诚信声明：</strong>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>"我诚信地相信，上述使用未经版权所有者、其代理人或法律授权"</li>
                  <li>"本通知中的信息准确无误"</li>
                  <li>"在伪证处罚下，我是版权所有者或授权代表"</li>
                </ul>
              </li>
              <li>
                <strong>签名：</strong>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>物理签名或电子签名</li>
                  <li>日期</li>
                </ul>
              </li>
            </ol>
          </div>
        </section>

        <!-- 提交方式 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">4. 提交方式</h2>
          <div class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-lg font-semibold mb-3">方式 1：GitHub Issue（推荐）</h3>
            <p class="text-gray-700 mb-2">
              <a href="https://github.com/yourname/fast-info/issues/new?labels=dmca"
                 target="_blank"
                 class="text-blue-600 hover:text-blue-800 underline">
                创建 DMCA 投诉 Issue
              </a>
            </p>
            <p class="text-gray-700 text-sm mb-4">
              请使用标题格式："DMCA Takedown Request - [您的作品名称]"
            </p>

            <h3 class="text-lg font-semibold mb-3 mt-6">方式 2：邮件</h3>
            <p class="text-gray-700 mb-2">
              发送至：<code class="bg-gray-200 px-2 py-1 rounded">dmca@fastinfo.example.com</code>
              （待配置）
            </p>
          </div>
        </section>

        <!-- 处理流程 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">5. 处理流程</h2>
          <div class="space-y-4">
            <div class="flex items-start">
              <div class="flex-shrink-0 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                1
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">收到投诉</h3>
                <p class="text-gray-700">
                  我们会在 <strong>24 小时内</strong>确认收到您的投诉
                </p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="flex-shrink-0 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                2
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">审核投诉</h3>
                <p class="text-gray-700">
                  我们会审核投诉是否完整、是否合理
                </p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="flex-shrink-0 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                3
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">采取行动</h3>
                <p class="text-gray-700">
                  如果投诉有效，我们会<strong>立即</strong>：
                </p>
                <ul class="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li>移除或禁用相关内容</li>
                  <li>将相关网站/来源加入排除列表</li>
                  <li>通知您处理结果</li>
                </ul>
              </div>
            </div>

            <div class="flex items-start">
              <div class="flex-shrink-0 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                4
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">反通知（如适用）</h3>
                <p class="text-gray-700">
                  我们会通知内容发布者（如适用），他们有权提交反通知
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- 反通知 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">6. 反通知 (Counter-Notice)</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            如果您收到 DMCA 移除通知，但认为移除是错误的（例如：您拥有版权、使用已授权、属于合理使用），
            您可以提交反通知。
          </p>
          <p class="text-gray-700 leading-relaxed">
            反通知要求与 DMCA 投诉类似，需包含您的身份信息、诚信声明和签名。
          </p>
        </section>

        <!-- 重复侵权 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">7. 重复侵权政策</h2>
          <p class="text-gray-700 leading-relaxed">
            我们会记录所有 DMCA 通知。
            对于重复侵权的来源，我们可能采取进一步措施，包括永久排除该来源的内容。
          </p>
        </section>

        <!-- 滥用警告 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">8. 滥用警告</h2>
          <div class="bg-red-50 border-l-4 border-red-500 p-4">
            <p class="text-gray-700 font-medium mb-2">
              ⚠️ 提交虚假 DMCA 投诉可能导致：
            </p>
            <ul class="list-disc pl-6 space-y-1 text-gray-700">
              <li>伪证罪指控</li>
              <li>民事赔偿责任</li>
              <li>律师费和诉讼费用</li>
            </ul>
          </div>
          <p class="text-gray-700 leading-relaxed mt-4">
            请确保您的投诉是诚信且基于真实的版权侵犯。
          </p>
        </section>

        <!-- 联系信息 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">9. 联系信息</h2>
          <div class="bg-gray-50 p-6 rounded-lg">
            <p class="text-gray-700 mb-3">
              <strong>DMCA 代理人：</strong>Johnny（开发者）
            </p>
            <p class="text-gray-700 mb-3">
              <strong>GitHub：</strong>
              <a href="https://github.com/yourname/fast-info"
                 target="_blank"
                 class="text-blue-600 hover:text-blue-800 underline">
                Fast Info Repository
              </a>
            </p>
            <p class="text-gray-700 mb-3">
              <strong>Issues：</strong>
              <a href="https://github.com/yourname/fast-info/issues"
                 target="_blank"
                 class="text-blue-600 hover:text-blue-800 underline">
                提交 Issue
              </a>
            </p>
            <p class="text-gray-700 text-sm mt-4">
              响应时间：通常在 24 小时内
            </p>
          </div>
        </section>

        <!-- 相关链接 -->
        <section class="mb-10">
          <h2 class="text-2xl font-semibold mb-4">10. 相关链接</h2>
          <ul class="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <router-link to="/copyright" class="text-blue-600 hover:text-blue-800 underline">
                版权声明
              </router-link>
              - 了解我们如何使用内容
            </li>
            <li>
              <a href="https://www.copyright.gov/legislation/dmca.pdf"
                 target="_blank"
                 class="text-blue-600 hover:text-blue-800 underline">
                DMCA 法案全文
              </a>（英文）
            </li>
            <li>
              <a href="https://www.eff.org/issues/intellectual-property/guide-to-youtube-removals"
                 target="_blank"
                 class="text-blue-600 hover:text-blue-800 underline">
                EFF 的 DMCA 指南
              </a>（英文）
            </li>
          </ul>
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
