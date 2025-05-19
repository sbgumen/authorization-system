const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { authenticate } = require('../middlewares/auth');

// 获取所有用户 (仅管理员可操作)
router.get('/', authenticate, usersController.getAllUsers);

// 获取单个用户详情
router.get('/:id', authenticate, usersController.getUserById);

// 更新用户
router.put('/:id', authenticate, usersController.updateUser);

// 删除用户 (仅管理员可操作)
router.delete('/:id', authenticate, usersController.deleteUser);

module.exports = router;