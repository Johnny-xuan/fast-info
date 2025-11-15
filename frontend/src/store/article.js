import { defineStore } from 'pinia'
import { getArticles, getTrendingArticles } from '../api/article'

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [],
    trending: [],
    loading: false,
    currentCategory: 'all',
    currentPage: 1,
    pageSize: 20,
    total: 0
  }),

  getters: {
    filteredArticles: (state) => {
      if (state.currentCategory === 'all') {
        return state.articles
      }
      return state.articles.filter(article => article.category === state.currentCategory)
    }
  },

  actions: {
    async fetchArticles(params = {}) {
      this.loading = true
      try {
        const data = await getArticles({
          page: this.currentPage,
          pageSize: this.pageSize,
          category: this.currentCategory !== 'all' ? this.currentCategory : undefined,
          ...params
        })
        this.articles = data.articles || []
        this.total = data.total || 0
      } catch (error) {
        console.error('获取文章失败:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchTrending() {
      try {
        const data = await getTrendingArticles()
        this.trending = data.articles || []
      } catch (error) {
        console.error('获取热门文章失败:', error)
      }
    },

    setCategory(category) {
      this.currentCategory = category
      this.currentPage = 1
      this.fetchArticles()
    },

    setPage(page) {
      this.currentPage = page
      this.fetchArticles()
    }
  }
})
