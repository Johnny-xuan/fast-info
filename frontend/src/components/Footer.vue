<template>
  <footer class="bg-white border-t mt-auto">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">

        <!-- 关于 -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">关于 Fast Info</h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            技术情报分析平台，聚合全球优质技术资讯，提供 AI 智能分析。
          </p>
        </div>

        <!-- 数据来源 -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">数据来源</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li>Hacker News</li>
            <li>GitHub Trending</li>
            <li>Dev.to</li>
            <li>Product Hunt</li>
            <li>arXiv</li>
            <li>AIBase</li>
          </ul>
        </div>

        <!-- 法律合规 -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">法律信息</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <router-link to="/copyright" class="text-gray-600 hover:text-blue-600 transition-colors">
                版权声明
              </router-link>
            </li>
            <li>
              <router-link to="/terms" class="text-gray-600 hover:text-blue-600 transition-colors">
                服务条款
              </router-link>
            </li>
            <li>
              <router-link to="/privacy" class="text-gray-600 hover:text-blue-600 transition-colors">
                隐私政策
              </router-link>
            </li>
            <li>
              <router-link to="/dmca" class="text-gray-600 hover:text-blue-600 transition-colors">
                DMCA 投诉
              </router-link>
            </li>
          </ul>
        </div>

        <!-- 联系方式 -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">联系我们</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <a href="https://github.com/yourname/fast-info"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="text-gray-600 hover:text-blue-600 transition-colors inline-flex items-center">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
                </svg>
                GitHub
              </a>
            </li>
            <li class="text-gray-600">
              开发者：Johnny
            </li>
          </ul>
        </div>

      </div>

      <!-- 底部版权 -->
      <div class="mt-8 pt-6 border-t text-center text-sm text-gray-500">
        <p class="mb-2">
          © 2025 Fast Info. 技术情报分析平台.
        </p>
        <p class="text-xs">
          内容来自第三方平台，版权归原作者所有。AI 分析由 Fast Info 提供。
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Footer 组件
</script>

<style scoped>
/* Footer 样式 */
</style>
