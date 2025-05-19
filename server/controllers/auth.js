const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/auth');
const { Admin, Settings } = require('../models');



// 生成API令牌
const generateApiToken = async (req, res) => {
  try {
    const userId = req.admin.id;
    
    // 查找用户
    const admin = await Admin.findByPk(userId);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 生成特定的API令牌，有效期更长且标记为API使用
    const token = jwt.sign(
      { 
        id: admin.id, 
        username: admin.username, 
        role: admin.role,
        isApiToken: true // 标记为API令牌
      },
      config.jwtSecret,
      { expiresIn: '30d' } // API令牌有效期设为30天
    );
    
    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('生成API令牌错误:', error);
    res.status(500).json({
      success: false,
      message: '生成API令牌失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// 注册新管理员
const register = async (req, res) => {
    
  try {
      
      // 检查系统设置是否允许注册
    const settings = await Settings.findOne({ where: { id: 1 } });
    
    if (settings && !settings.allowRegistration) {
      return res.status(403).json({
        success: false,
        message: '系统当前不允许新用户注册'
      });
    }
    
    
    const { username, password, email } = req.body;
    
    // 检查用户名是否已存在
    const existingAdmin = await Admin.findOne({ where: { username } });
    
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: '用户名已被使用'
      });
    }
    
    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await Admin.findOne({ where: { email } });
      
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: '邮箱已被使用'
        });
      }
    }
    
    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 创建新管理员
    const admin = await Admin.create({
      username,
      password: hashedPassword,
      email,
      role: 'user' // 默认为普通用户角色
    });
    
    // 生成JWT令牌 - 包含role信息
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );
    
    res.status(201).json({
      success: true,
      message: '注册成功',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role // 确保返回角色信息
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册过程中发生错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 管理员登录
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找管理员
    const admin = await Admin.findOne({ where: { username } });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码不正确'
      });
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码不正确'
      });
    }
    
    // 生成JWT令牌 - 确保包含role信息
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );
    
    // 增加对admin.role的输出
    console.log(`用户 ${admin.username} 登录成功，角色: ${admin.role}`);
    
    res.json({
      success: true,
      message: '登录成功',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role // 确保返回角色信息
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录过程中发生错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取管理员个人信息
const getProfile = async (req, res) => {
  try {
    // req.admin已在认证中间件中设置
    res.json({
      success: true,
      admin: req.admin
    });
  } catch (error) {
    console.error('获取个人信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取个人信息过程中发生错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 修改密码
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;
    
    // 查找管理员
    const admin = await Admin.findByPk(adminId);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }
    
    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '当前密码不正确'
      });
    }
    
    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // 更新密码
    admin.password = hashedPassword;
    await admin.save();
    
    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '修改密码过程中发生错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  changePassword,
  generateApiToken
};