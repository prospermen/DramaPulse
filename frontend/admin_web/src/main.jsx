import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#141413',
          colorText: '#141413',
          colorBgBase: '#F3F0EE',
          borderRadius: 20,
          fontFamily:
            '"Sofia Sans", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);
