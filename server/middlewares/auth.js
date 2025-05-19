const jwt = require('jsonwebtoken');
const config = require('../config/auth');
const { Admin } = require('../models');

// 验证JWT令牌中间件
const authenticate = async (req, res, next) => {
  try {
    // 获取请求头中的令牌
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // 验证令牌
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // 查找管理员
    const admin = await Admin.findByPk(decoded.id);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '管理员账户不存在或已被禁用'
      });
    }
    
    // 将管理员信息添加到请求
    req.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      isApiToken: decoded.isApiToken || false
    };
    
    // 如果是API令牌并尝试访问管理接口，则限制权限
    if (decoded.isApiToken && req.originalUrl.match(/\/(users|settings)/)) {
      // 只有管理员的API令牌可以访问管理接口
      if (admin.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'API令牌无权访问管理接口'
        });
      }
    }
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '无效的令牌或令牌已过期'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: '认证过程中发生错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
module.exports = { authenticate };
