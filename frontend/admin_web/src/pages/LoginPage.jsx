import { Button, Form, Input, message } from 'antd';
import { LeftOutlined, LockOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearAdminSession, saveAdminSession } from '../auth.js';
import { apiErrorMessage } from '../services/apiClient.js';
import { loginAdmin } from '../services/authApi.js';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const redirectTo = location.state?.from?.pathname ?? '/admin/dashboard';

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const session = await loginAdmin(values);
      if (session.role !== 'admin') {
        clearAdminSession();
        message.error('当前账号不是管理员，无法进入后台。');
        return;
      }
      saveAdminSession(session);
      message.success('已进入工作台');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      clearAdminSession();
      message.error(apiErrorMessage(error, '登录失败'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <a className="login-brand" href="/">
        <LeftOutlined />
        返回入口页
      </a>

      <section className="login-shell">
        <div className="login-panel reveal-block">
          <div className="login-panel-head">
            <span>SIGN IN</span>
            <strong>工作台登录</strong>
          </div>

          <Form layout="vertical" requiredMark={false} onFinish={handleSubmit}>
            <Form.Item
              label="账号"
              name="username"
              rules={[{ required: true, message: '请输入账号' }]}
            >
              <Input
                autoComplete="username"
                prefix={<UserOutlined />}
                placeholder="请输入账号"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                autoComplete="current-password"
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                size="large"
              />
            </Form.Item>

            <Button className="login-submit" htmlType="submit" type="primary" block loading={submitting}>
              登录
              <RightOutlined />
            </Button>
          </Form>
        </div>
      </section>
    </main>
  );
}
