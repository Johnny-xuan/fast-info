/**
 * AI 路由 - AI 摘要和分析相关接口
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// 为单篇文章生成 AI 摘要
router.post('/generate-summary/:id', aiController.generateSummary.bind(aiController));

// 为单篇文章生成深度分析
router.post('/generate-analysis/:id', aiController.generateAnalysis.bind(aiController));

// 批量生成 AI 摘要
router.post('/batch-generate', aiController.batchGenerate.bind(aiController));

// 获取 AI 生成统计
router.get('/stats', aiController.getStats.bind(aiController));

module.exports = router;
