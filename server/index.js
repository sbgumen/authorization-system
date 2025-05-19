// server/index.js
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { sequelize } = require('./models');
const { initDb } = require('./utils/dbInit');

// 导入路由
const authRoutes = require('./routes/auth');
const licenseRoutes = require('./routes/license');
const settingsRoutes = require('./routes/settings');
const usersRoutes = require('./routes/users');
const applicationRoutes = require('./routes/application');
const dashboardRoutes = require('./routes/dashboard');


// 初始化应用
const app = express();
const PORT = process.env.PORT || 5000;

// 安全中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 限流配置 - 防止暴力破解
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制100次请求
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '请求过多，请稍后再试' }
});

// 应用限流到所有API路由

app.use('/api', apiLimiter);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 注册路由
app.use('/api/auth', authRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/settings', settingsRoutes);  // 添加设置路由
app.use('/api/users', usersRoutes);       // 添加用户路由

// 提供前端静态文件 - 生产环境
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  
  // 记录请求体 (仅在开发环境)
  if (process.env.NODE_ENV === 'development' && req.body) {
    // 避免记录敏感信息如密码
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = '***';
    console.log('Request body:', JSON.stringify(safeBody));
  }
  
  next();
});

// 数据库同步并启动服务器
(async () => {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 首次运行时初始化数据库
    await initDb();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在端口: ${PORT}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
  }
})();