const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { authenticate } = require('../middlewares/auth');
const {
  registerValidator,
  loginValidator,
  passwordValidator
} = require('../middlewares/validators');

// 注册新管理员
router.post('/register', registerValidator, authController.register);

// 管理员登录
router.post('/login', loginValidator, authController.login);

// 获取管理员个人信息
router.get('/profile', authenticate, authController.getProfile);

// 修改密码
router.put('/password', authenticate, passwordValidator, authController.changePassword);

// 生成API令牌
router.get('/api-token', authenticate, authController.generateApiToken);

module.exports = router;