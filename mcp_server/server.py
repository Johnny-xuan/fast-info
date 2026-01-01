"""
Fast Info MCP Server
卖报员 Agent 的 MCP 工具服务
借鉴 TrendRadar 架构
"""
import os
import json
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from mcp.server.fastmcp import FastMCP

# 加载环境变量
load_dotenv()

# 创建 MCP 服务
mcp = FastMCP("FastInfo Newsboy")

# 数据库配置
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "database": os.getenv("DB_NAME", "fastinfo"),
    "user": os.getenv("DB_USER", "fastinfo"),
    "password": os.getenv("DB_PASSWORD", ""),
}

def get_db_connection():
    """获取数据库连接"""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)


@mcp.tool()
def search_articles(query: str, limit: int = 10) -> list:
    """
    搜索文章，支持关键词匹配标题和摘要
    
    Args:
        query: 搜索关键词
        limit: 返回数量，默认10
    
    Returns:
        匹配的文章列表
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, title, url, source, category, ai_summary, hot_score, created_at
            FROM articles 
            WHERE title ILIKE %s OR summary ILIKE %s OR ai_summary ILIKE %s
            ORDER BY hot_score DESC, created_at DESC
            LIMIT %s
        """, (f'%{query}%', f'%{query}%', f'%{query}%', limit))
        return cur.fetchall()
    finally:
        conn.close()


@mcp.tool()
def filter_by_category(category: str, limit: int = 10) -> list:
    """
    按分类筛选文章
    
    Args:
        category: 文章分类 (tech/dev/academic/product/opensource)
        limit: 返回数量，默认10
    
    Returns:
        指定分类的文章列表
    """
    valid_categories = ['tech', 'dev', 'academic', 'product', 'opensource']
    if category not in valid_categories:
        raise ValueError(f"Invalid category: {category}. Valid: {valid_categories}")
    
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, title, url, source, category, ai_summary, hot_score, created_at
            FROM articles 
            WHERE category = %s
            ORDER BY created_at DESC
            LIMIT %s
        """, (category, limit))
        return cur.fetchall()
    finally:
        conn.close()


@mcp.tool()
def filter_by_date(range: str, limit: int = 10) -> list:
    """
    按时间筛选文章
    
    Args:
        range: 时间范围 (today/week/month)
        limit: 返回数量，默认10
    
    Returns:
        指定时间范围的文章列表
    """
    date_conditions = {
        'today': "created_at >= CURRENT_DATE",
        'week': "created_at >= CURRENT_DATE - INTERVAL '7 days'",
        'month': "created_at >= CURRENT_DATE - INTERVAL '30 days'"
    }
    
    if range not in date_conditions:
        raise ValueError(f"Invalid range: {range}. Valid: today, week, month")
    
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(f"""
            SELECT id, title, url, source, category, ai_summary, hot_score, created_at
            FROM articles 
            WHERE {date_conditions[range]}
            ORDER BY created_at DESC
            LIMIT %s
        """, (limit,))
        return cur.fetchall()
    finally:
        conn.close()


@mcp.tool()
def filter_by_source(source: str, limit: int = 10) -> list:
    """
    按来源筛选文章
    
    Args:
        source: 文章来源 (hackernews/github/devto/producthunt/arxiv/reddit等)
        limit: 返回数量，默认10
    
    Returns:
        指定来源的文章列表
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, title, url, source, category, ai_summary, hot_score, created_at
            FROM articles 
            WHERE source ILIKE %s
            ORDER BY created_at DESC
            LIMIT %s
        """, (f'%{source}%', limit))
        return cur.fetchall()
    finally:
        conn.close()


@mcp.tool()
def get_trending(limit: int = 10) -> list:
    """
    获取热门文章，按热度排序
    
    Args:
        limit: 返回数量，默认10
    
    Returns:
        热门文章列表
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, title, url, source, category, ai_summary, hot_score, created_at
            FROM articles 
            ORDER BY hot_score DESC, created_at DESC
            LIMIT %s
        """, (limit,))
        return cur.fetchall()
    finally:
        conn.close()


@mcp.tool()
def get_daily_digest() -> dict:
    """
    获取今日资讯摘要
    
    Returns:
        今日文章摘要，包含分类统计
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        
        # 获取今日文章
        cur.execute("""
            SELECT id, title, url, source, category, ai_summary, hot_score, created_at
            FROM articles 
            WHERE created_at >= CURRENT_DATE
            ORDER BY hot_score DESC, created_at DESC
            LIMIT 20
        """)
        articles = cur.fetchall()
        
        # 按分类分组
        by_category = {}
        for article in articles:
            cat = article['category']
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(article)
        
        return {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "total": len(articles),
            "articles": articles,
            "by_category": by_category
        }
    finally:
        conn.close()


@mcp.tool()
def get_stats() -> dict:
    """
    获取数据库统计信息
    
    Returns:
        统计信息，包含总数、分类分布、来源分布等
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        
        # 总数
        cur.execute("SELECT COUNT(*) as total FROM articles")
        total = cur.fetchone()['total']
        
        # 按分类统计
        cur.execute("""
            SELECT category, COUNT(*) as count 
            FROM articles 
            GROUP BY category 
            ORDER BY count DESC
        """)
        by_category = {row['category']: row['count'] for row in cur.fetchall()}
        
        # 按来源统计
        cur.execute("""
            SELECT source, COUNT(*) as count 
            FROM articles 
            GROUP BY source 
            ORDER BY count DESC
        """)
        by_source = {row['source']: row['count'] for row in cur.fetchall()}
        
        # 最新更新
        cur.execute("SELECT MAX(created_at) as latest FROM articles")
        latest = cur.fetchone()['latest']
        
        # 今日新增
        cur.execute("SELECT COUNT(*) as count FROM articles WHERE created_at >= CURRENT_DATE")
        today_count = cur.fetchone()['count']
        
        return {
            "total": total,
            "today_count": today_count,
            "by_category": by_category,
            "by_source": by_source,
            "latest_update": latest.isoformat() if latest else None
        }
    finally:
        conn.close()


if __name__ == "__main__":
    mcp.run()
