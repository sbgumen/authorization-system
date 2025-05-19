import axios from 'axios';

const API_URL = '/api/licenses';

// 生成授权码
export const generateLicenses = async (count = 1) => {
  try {
    const response = await axios.post(`${API_URL}/generate`, { count });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '生成授权码失败' };
  }
};


export const fetchApplications = async () => {
  try {
    const response = await axios.get('/api/applications');
    return response.data.applications;
  } catch (error) {
    throw error.response?.data || { message: '获取应用列表失败' };
  }
};

// 获取所有授权码

export const getAllLicenses = async (page = 1, limit = 10, status = '', search = '', applicationId = '') => {
  try {
    const response = await axios.get(`${API_URL}`, {
      params: { page, limit, status, search, applicationId }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '获取授权码列表失败' };
  }
};

// 获取授权码详情
export const getLicenseById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '获取授权码详情失败' };
  }
};

// 更新授权码
export const updateLicense = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '更新授权码失败' };
  }
};

// 删除授权码
export const deleteLicense = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '删除授权码失败' };
  }
};

// 验证授权码
export const verifyLicense = async (licenseKey) => {
  try {
    const response = await axios.post(`${API_URL}/verify`, { licenseKey });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '验证授权码失败' };
  }
};

// 申请授权码
export const applyLicense = async (licenseKey, userInfo) => {
  try {
    const response = await axios.post(`${API_URL}/apply`, { licenseKey, userInfo });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '申请授权码失败' };
  }
};

// 获取授权码统计信息
export const getLicenseStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: '获取统计信息失败' };
  }
};