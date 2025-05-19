const { validationResult, check } = require('express-validator');
const { validateLicenseKeyFormat } = require('../utils/crypto');

// 验证结果处理
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

// 管理员注册验证规则
const registerValidator = [
  check('username')
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 2, max: 50 }).withMessage('用户名长度必须在2-50个字符之间'),
  
  check('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 5 }).withMessage('密码长度必须至少为5个字符'),
  
  check('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage('邮箱格式不正确'),
  
  handleValidationErrors
];

// 管理员登录验证规则
const loginValidator = [
  check('username')
    .notEmpty().withMessage('用户名不能为空'),
  
  check('password')
    .notEmpty().withMessage('密码不能为空'),
  
  handleValidationErrors
];

// 修改密码验证规则
const passwordValidator = [
  check('currentPassword')
    .notEmpty().withMessage('当前密码不能为空'),
  
  check('newPassword')
    .notEmpty().withMessage('新密码不能为空')
    .isLength({ min: 6 }).withMessage('新密码长度必须至少为6个字符')
    .matches(/\d/).withMessage('新密码必须包含至少一个数字')
    .matches(/[a-zA-Z]/).withMessage('新密码必须包含至少一个字母'),
  
  handleValidationErrors
];

// 生成授权码验证规则
const generateLicenseValidator = [
  check('count')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('生成数量必须是1-100之间的整数'),
  
  handleValidationErrors
];

// 验证授权码验证规则
const verifyLicenseValidator = [
  check('licenseKey')
    .notEmpty().withMessage('授权码不能为空')
    .custom((value) => {
      //if (!validateLicenseKeyFormat(value)) {
        //throw new Error('授权码格式不正确');
      //}
      return true;
    }),
  
  handleValidationErrors
];

// 申请授权码验证规则
const applyLicenseValidator = [
  check('licenseKey')
    .notEmpty().withMessage('授权码不能为空')
    .custom((value) => {
      // 简单的格式验证，不使用validateLicenseKeyFormat以避免依赖问题
      if (typeof value !== 'string' || value.length < 5) {
        throw new Error('授权码格式不正确');
      }
      return true;
    }),
  
  check('appId')
    .notEmpty().withMessage('应用ID不能为空'),
  
  check('userInfo')
    .notEmpty().withMessage('用户信息不能为空')
    .isObject().withMessage('用户信息必须是对象格式'),
  
  handleValidationErrors
];

// 更新授权码验证规则
const updateLicenseValidator = [
  check('status')
    .optional()
    .isIn(['pending', 'active', 'expired', 'revoked']).withMessage('状态值不正确'),
  
  check('expiresAt')
    .optional()
    .isISO8601().withMessage('过期时间格式不正确'),
  
  handleValidationErrors
];

module.exports = {
  registerValidator,
  loginValidator,
  passwordValidator,
  generateLicenseValidator,
  verifyLicenseValidator,
  applyLicenseValidator,
  updateLicenseValidator
};