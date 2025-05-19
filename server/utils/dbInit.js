const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // 添加导入
const { Admin, Settings, sequelize } = require('../models');

// 数据库初始化函数
const initDb = async () => {
  try {
    // 同步数据库模型（创建表）
    await sequelize.sync();
    
    // 检查是否已有管理员账户
    const adminCount = await Admin.count();
    
    if (adminCount === 0) {
      console.log('创建默认管理员账户...');
      
      // 生成密码哈希
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // 创建默认管理员
      await Admin.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        role: 'admin' // 明确设置为admin角色
      });
      
      console.log('默认管理员账户创建成功');
      console.log('用户名: admin');
      console.log('密码: admin123');
      console.log('角色: admin');
      console.log('请登录后立即修改默认密码');
    }
    
    // 检查并创建系统设置
    const settingsCount = await Settings.count();
    
    if (settingsCount === 0) {
      console.log('创建默认系统设置...');
      
      // 生成唯一应用ID
      const appId = crypto.randomBytes(16).toString('hex');
      
      // 创建默认设置
      await Settings.create({
        allowRegistration: true,
        licensePrefix: 'LS-',
        licenseSegments: 4,
        licenseSegmentLength: 5,
        licenseDelimiter: '-',
        appId
      });
      
      console.log('默认系统设置创建成功');
      console.log(`应用ID: ${appId}`);
    }
    
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

module.exports = { initDb };