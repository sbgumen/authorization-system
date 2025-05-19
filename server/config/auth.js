require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: '24h',
  encryptionKey: process.env.ENCRYPTION_KEY || '12345678901234567890123456789012', // 32字节
  encryptionIV: process.env.ENCRYPTION_IV || '1234567890123456', // 16字节
  licenseFormat: {
    prefix: 'LS-',
    segments: 4,
    segmentLength: 5,
    delimiter: '-'
  }
};