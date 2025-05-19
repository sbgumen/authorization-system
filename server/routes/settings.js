const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings');
const { authenticate } = require('../middlewares/auth');

// 获取系统设置
router.get('/', authenticate, settingsController.getSettings);

// 更新系统设置 (仅管理员可操作)
router.put('/', authenticate, settingsController.updateSettings);

module.exports = router;