import { Button, Form, Input, message } from 'antd';
import { LeftOutlined, LockOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveAdminAccessToken, saveAdminUserName } from '../auth.js';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = location.state?.from?.pathname ?? '/admin/dashboard';

  const handleSubmit = ({ username }) => {
    saveAdminAccessToken('dev-jwt-placeholder');
    saveAdminUserName(username);
    message.success('已进入工作台。JWT 接口接入后将替换为真实登录响应。');
    navigate(redirectTo, { replace: true });
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

            <Button className="login-submit" htmlType="submit" type="primary" block>
              登录
              <RightOutlined />
            </Button>
          </Form>
        </div>
      </section>
    </main>
  );
}
