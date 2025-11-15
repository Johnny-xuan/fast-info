import request from './request'

/**
 * 获取文章列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getArticles(params) {
  return request({
    url: '/articles',
    method: 'get',
    params
  })
}

/**
 * 获取文章详情
 * @param {String} id - 文章ID
 * @returns {Promise}
 */
export function getArticleDetail(id) {
  return request({
    url: `/articles/${id}`,
    method: 'get'
  })
}

/**
 * 获取分类列表
 * @returns {Promise}
 */
export function getCategories() {
  return request({
    url: '/categories',
    method: 'get'
  })
}

/**
 * 搜索文章
 * @param {Object} data - 搜索参数
 * @returns {Promise}
 */
export function searchArticles(data) {
  return request({
    url: '/search',
    method: 'post',
    data
  })
}

/**
 * 获取热门文章
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getTrendingArticles(params) {
  return request({
    url: '/trending',
    method: 'get',
    params
  })
}
