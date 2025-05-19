const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application');
const { authenticate } = require('../middlewares/auth');

// 所有应用路由都需要认证
router.use(authenticate);

// 获取用户的所有应用
router.get('/', applicationController.getUserApps);

// 获取应用详情
router.get('/:id', applicationController.getAppById);

// 创建新应用
router.post('/', applicationController.createApp);

// 更新应用
router.put('/:id', applicationController.updateApp);

// 删除应用
router.delete('/:id', applicationController.deleteApp);

module.exports = router;