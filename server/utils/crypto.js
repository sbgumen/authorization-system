const crypto = require('crypto');
const config = require('../config/auth');

// 获取加密密钥和初始化向量
const key = Buffer.from(config.encryptionKey, 'utf8');
const iv = Buffer.from(config.encryptionIV, 'utf8');

// AES-256-CBC 加密
const encrypt = (text) => {
  if (key.length !== 32) throw new Error('密钥长度必须为32字节');
  if (iv.length !== 16) throw new Error('IV长度必须为16字节');

  try {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } catch (error) {
    console.error('加密错误:', error);
    throw new Error('加密失败');
  }
};

// AES-256-CBC 解密
const decrypt = (encryptedText) => {
  if (key.length !== 32) throw new Error('密钥长度必须为32字节');
  if (iv.length !== 16) throw new Error('IV长度必须为16字节');

  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('解密错误:', error);
    throw new Error('解密失败');
  }
};

// 生成随机字符串
const generateRandomString = (length) => {
  // 只使用大写字母和数字，避免混淆的字符
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  const randomValues = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % chars.length;
    result += chars.charAt(randomIndex);
  }
  
  return result;
};

// 生成校验位
const generateCheckDigit = (code) => {
  // 简单的校验算法，将字符串转换为数字并求和
  let sum = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charAt(i);
    // 使用字符的ASCII码
    sum += char.charCodeAt(0);
  }
  // 取余数作为校验位 (0-9)
  return sum % 10;
};

// 生成授权码
const generateLicenseKey = () => {
  const { prefix, segments, segmentLength, delimiter } = config.licenseFormat;
  
  let licenseKey = prefix;
  
  // 生成指定数量的段
  for (let i = 0; i < segments - 1; i++) {
    licenseKey += generateRandomString(segmentLength);
    if (i < segments - 2) {
      licenseKey += delimiter;
    }
  }
  
  // 添加校验位
  const checkDigit = generateCheckDigit(licenseKey);
  licenseKey += delimiter + checkDigit;
  
  return licenseKey;
};

// 验证授权码格式
const validateLicenseKeyFormat = (licenseKey) => {
  const { prefix, segments, segmentLength, delimiter } = config.licenseFormat;
  
  // 检查前缀
  if (!licenseKey.startsWith(prefix)) {
    return false;
  }
  
  // 分割授权码
  const parts = licenseKey.split(delimiter);
  
  // 检查段数
  if (parts.length !== segments) {
    return false;
  }
  
  // 检查每段长度（除了第一段包含前缀和最后一段是校验位）
  for (let i = 1; i < parts.length - 1; i++) {
    if (parts[i].length !== segmentLength) {
      return false;
    }
  }
  
  // 检查校验位
  const codeWithoutCheck = parts.slice(0, -1).join(delimiter);
  const expectedCheckDigit = generateCheckDigit(codeWithoutCheck);
  const actualCheckDigit = parseInt(parts[parts.length - 1], 10);
  
  return expectedCheckDigit === actualCheckDigit;
};

module.exports = {
  encrypt,
  decrypt,
  generateLicenseKey,
  validateLicenseKeyFormat
};