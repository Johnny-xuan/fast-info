"""
MCP Server 工具测试
运行: pytest tests/
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# 添加父目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestSearchArticles:
    """搜索文章工具测试"""
    
    @patch('server.get_db_connection')
    def test_search_returns_results(self, mock_conn):
        """测试搜索返回结果"""
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            ('1', 'Vue 3.5 发布', 'devto', 'dev', '2025-01-01', 'Vue 新版本')
        ]
        mock_conn.return_value.cursor.return_value = mock_cursor
        
        from server import search_articles
        results = search_articles('Vue', 10)
        
        assert len(results) > 0
        assert 'title' in results[0]
    
    @patch('server.get_db_connection')
    def test_search_empty_results(self, mock_conn):
        """测试搜索无结果"""
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = []
        mock_conn.return_value.cursor.return_value = mock_cursor
        
        from server import search_articles
        results = search_articles('nonexistent', 10)
        
        assert len(results) == 0


class TestFilterByCategory:
    """分类筛选工具测试"""
    
    @patch('server.get_db_connection')
    def test_filter_valid_category(self, mock_conn):
        """测试有效分类筛选"""
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            ('1', 'Tech Article', 'hackernews', 'tech', '2025-01-01', 'Summary')
        ]
        mock_conn.return_value.cursor.return_value = mock_cursor
        
        from server import filter_by_category
        results = filter_by_category('tech', 10)
        
        assert len(results) > 0
    
    def test_filter_invalid_category(self):
        """测试无效分类"""
        from server import filter_by_category
        
        with pytest.raises(ValueError):
            filter_by_category('invalid_category', 10)


class TestFilterByDate:
    """时间筛选工具测试"""
    
    @patch('server.get_db_connection')
    def test_filter_today(self, mock_conn):
        """测试今日筛选"""
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = []
        mock_conn.return_value.cursor.return_value = mock_cursor
        
        from server import filter_by_date
        results = filter_by_date('today', 10)
        
        assert isinstance(results, list)
    
    @patch('server.get_db_connection')
    def test_filter_week(self, mock_conn):
        """测试本周筛选"""
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = []
        mock_conn.return_value.cursor.return_value = mock_cursor
        
        from server import filter_by_date
        results = filter_by_date('week', 10)
        
        assert isinstance(results, list)


class TestGetTrending:
    """热门文章工具测试"""
    
    @patch('server.get_db_connection')
    def test_trending_sorted_by_score(self, mock_conn):
        """测试热门文章按分数排序"""
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            ('1', 'Hot Article 1', 'hackernews', 'tech', 200),
            ('2', 'Hot Article 2', 'devto', 'dev', 150),
        ]
        mock_conn.return_value.cursor.return_value = mock_cursor
        
        from server import get_trending
        results = get_trending(10)
        
        assert len(results) == 2
        # 验证降序
        if len(results) > 1:
            assert results[0]['hot_score'] >= results[1]['hot_score']


class TestGetStats:
    """统计信息工具测试"""
    
    @patch('server.get_db_connection')
    def test_stats_structure(self, mock_conn):
        """测试统计信息结构"""
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (100,)
        mock_cursor.fetchall.side_effect = [
            [('tech', 50), ('dev', 30)],
            [('hackernews', 40), ('devto', 35)]
        ]
        mock_conn.return_value.cursor.return_value = mock_cursor
        
        from server import get_stats
        stats = get_stats()
        
        assert 'total' in stats
        assert 'by_category' in stats
        assert 'by_source' in stats


class TestGetDailyDigest:
    """每日摘要工具测试"""
    
    @patch('server.get_db_connection')
    def test_digest_structure(self, mock_conn):
        """测试摘要结构"""
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            ('1', 'Article 1', 'https://example.com/1', 'hackernews', 'tech', 'Summary 1'),
        ]
        mock_conn.return_value.cursor.return_value = mock_cursor
        
        from server import get_daily_digest
        digest = get_daily_digest()
        
        assert 'date' in digest
        assert 'articles' in digest
        assert 'total' in digest


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
