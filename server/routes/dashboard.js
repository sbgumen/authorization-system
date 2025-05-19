const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');
const { authenticate } = require('../middlewares/auth');

// 仪表板统计数据
router.get('/stats', authenticate, dashboardController.getDashboardStats);

// 最近活动
router.get('/activities', authenticate, dashboardController.getRecentActivities);

module.exports = router;