/**
 * Chat API 客户端
 */
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

export const chatApi = {
  /**
   * 发送消息
   */
  async send(message, sessionId = null) {
    const response = await axios.post(`${API_BASE}/api/chat`, {
      message,
      sessionId
    })
    return response.data
  },

  /**
   * 获取快捷建议
   */
  async getSuggestions() {
    const response = await axios.get(`${API_BASE}/api/chat/suggestions`)
    return response.data.suggestions
  },

  /**
   * 清除会话
   */
  async clearSession(sessionId) {
    await axios.delete(`${API_BASE}/api/chat/${sessionId}`)
  }
}
