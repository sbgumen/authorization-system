const bcrypt = require('bcryptjs');
const { Admin } = require('../models');

// 获取所有用户
const getAllUsers = async (req, res) => {
  try {
    // 检查当前用户是否是超级管理员
    if (req.admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有超级管理员可以查看用户列表'
      });
    }
    
    const users = await Admin.findAll({
      attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt']
    });
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取单个用户详情
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 检查当前用户是否是超级管理员或者是查询自己
    if (req.admin.role !== 'admin' && req.admin.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: '没有权限查看其他用户信息'
      });
    }
    
    const user = await Admin.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户详情失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 更新用户
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, role } = req.body;
    
    // 检查当前用户是否是超级管理员或者是更新自己
    if (req.admin.role !== 'admin' && req.admin.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: '没有权限更新其他用户信息'
      });
    }
    
    // 只有超级管理员可以更改角色
    if (role && req.admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有超级管理员可以更改用户角色'
      });
    }
    
    const user = await Admin.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 检查是否为最后一个超级管理员
    if (user.role === 'admin' && role === 'user') {
      const adminCount = await Admin.count({ where: { role: 'admin' } });
      
      if (adminCount === 1) {
        return res.status(400).json({
          success: false,
          message: '不能降级最后一个超级管理员'
        });
      }
    }
    
    // 更新用户
    if (email) user.email = email;
    if (role) user.role = role;
    
    await user.save();
    
    res.json({
      success: true,
      message: '用户更新成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 删除用户
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 检查当前用户是否是超级管理员
    if (req.admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有超级管理员可以删除用户'
      });
    }
    
    // 不能删除自己
    if (req.admin.id === parseInt(userId)) {
      return res.status(400).json({
        success: false,
        message: '不能删除当前登录的用户'
      });
    }
    
    const user = await Admin.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 检查是否为最后一个超级管理员
    if (user.role === 'admin') {
      const adminCount = await Admin.count({ where: { role: 'admin' } });
      
      if (adminCount === 1) {
        return res.status(400).json({
          success: false,
          message: '不能删除最后一个超级管理员'
        });
      }
    }
    
    await user.destroy();
    
    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({
      success: false,
      message: '删除用户失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};