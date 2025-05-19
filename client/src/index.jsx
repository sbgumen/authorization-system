import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './assets/css/index.css';
import axios from 'axios';

// 创建React Query客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

const applyGlobalSettings = async () => {
  try {
    const response = await axios.get('/api/settings');
    if (response.data.success) {
      const settings = response.data.settings;
      
      // 应用系统标题
      document.title = settings.systemTitle || '授权码管理系统';
      
      // 应用主题颜色
      document.documentElement.style.setProperty('--color-primary', settings.primaryColor || '#3B82F6');
      document.documentElement.style.setProperty('--color-secondary', settings.secondaryColor || '#4F46E5');
      
      // 如果有Logo，可以在此处理
    }
  } catch (error) {
    console.error('加载全局设置失败:', error);
  }
};



applyGlobalSettings();