const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/license');
const { authenticate } = require('../middlewares/auth');
const {
  generateLicenseValidator,
  verifyLicenseValidator,
  applyLicenseValidator,
  updateLicenseValidator
} = require('../middlewares/validators');

// 管理员路由 - 需要认证
router.post('/generate', authenticate, generateLicenseValidator, licenseController.generateLicenses);
router.get('/', authenticate, licenseController.getAllLicenses);
router.get('/stats', authenticate, licenseController.getLicenseStats);
router.get('/:id', authenticate, licenseController.getLicenseById);
router.put('/:id', authenticate, updateLicenseValidator, licenseController.updateLicense);
router.delete('/:id', authenticate, licenseController.deleteLicense);
router.get('/applications/pending', authenticate, licenseController.getPendingApplications);
router.post('/applications/process', authenticate, licenseController.processApplication);

// 公开路由 - 不需要认证
router.post('/verify', verifyLicenseValidator, licenseController.verifyLicense);
router.post('/apply', applyLicenseValidator, licenseController.applyLicense);
router.get('/pending/:appId', licenseController.getPendingLicensesByAppId);

module.exports = router;