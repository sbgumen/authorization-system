# 阿泽授权码管理系统

一个功能完整的授权码管理系统，支持多应用授权管理和用户权限控制。管理员可以创建多个应用，为每个应用生成独立的授权码，用户可以通过API验证授权码。

![授权系统截图](https://lzx1.top/res/ghithub-img/authorization-system.png)

## 功能特点

- **多应用管理**：每个用户可以创建和管理多个应用
- **用户权限控制**：管理员可以管理用户和系统设置
- **安全加密**：使用AES-256-CBC加密存储授权码和用户信息
- **API接口**：提供完整的授权验证和申请API
- **炫酷界面**：现代化的界面设计，流畅的动画效果

## 技术栈

### 前端
- React
- React Router
- React Query
- Framer Motion (动画)
- Tailwind CSS
- Axios
- React Icons
- React Hot Toast

### 后端
- Node.js
- Express
- Sequelize (ORM)
- MySQL
- JSON Web Token (JWT)
- bcryptjs (密码哈希)
- express-validator
- express-rate-limit

## 安装和配置

### 系统要求
- Node.js 14.x 或更高版本
- MySQL 5.7 或更高版本
- npm 或 yarn

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/sbgumen/authorization-system.git
cd authorization-system
```

2. 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装客户端依赖
cd client
npm install
cd ..

# 安装服务器依赖
cd server
npm install
cd ..
```

3. 配置环境变量

创建 `.env` 文件，参考 `.env.example`：
```bash
# 服务器配置
PORT=5000
NODE_ENV=development

# JWT配置
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# 数据库配置
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=license_system

# 加密配置
ENCRYPTION_KEY=12345678901234567890123456789012
ENCRYPTION_IV=1234567890123456

# 跨域设置
CORS_ORIGIN=http://localhost:3000
```
```bash
客户端端口可以在/client/.env中修改PORT

修改服务的端口时需要同时修改/client/package.json中的proxy的端口
```


5. 启动开发服务器
```bash
npm run dev
```

应用将在 http://localhost:3000 运行，API服务器在 http://localhost:5000 运行。

## 使用指南

### 管理员账户
首次运行时系统会自动创建一个默认管理员账户：
- 用户名: admin
- 密码: admin123

请登录后立即修改默认密码。

### 创建应用
1. 登录系统后，点击"创建应用"按钮
2. 填写应用名称和描述
3. 自定义授权码格式（可选）
4. 提交表单创建应用

### 生成授权码
1. 进入应用详情页或授权码管理页
2. 点击"生成授权码"按钮
3. 选择要生成的数量
4. 提交表单生成授权码

### 管理授权码
1. 在授权码管理页可以查看所有授权码
2. 可以按应用、状态筛选授权码
3. 点击授权码详情可以激活、撤销或删除授权码

### API接口
系统提供两个主要API接口：
1. **验证授权码**: `/api/licenses/verify`
2. **申请授权**: `/api/licenses/apply`

详细API文档可在系统中的API文档页面查看。


## 许可证

MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

