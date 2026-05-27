import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button, Layout, Menu, Typography } from 'antd';
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { adminModules, getAdminModuleByPath } from '../adminModules.jsx';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function AdminWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const currentModule = getAdminModuleByPath(location.pathname);

  const menuItems = useMemo(
    () =>
      adminModules.map((module) => ({
        key: module.id,
        icon: module.icon,
        label: module.title,
      })),
    [],
  );

  return (
    <Layout className="workspace-shell">
      <Sider
        width={236}
        collapsedWidth={76}
        collapsed={collapsed}
        trigger={null}
        className="workspace-sider"
      >
        <div className="workspace-brand">
          IgniteNow
          <span>v0.1</span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentModule.id]}
          items={menuItems}
          onClick={({ key }) => {
            const targetModule = adminModules.find((module) => module.id === key);
            if (targetModule) {
              navigate(targetModule.path);
            }
          }}
        />
        <div className="workspace-sider-footer">
          <Button
            type="text"
            className="workspace-collapse-button"
            icon={collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
            onClick={() => setCollapsed((value) => !value)}
          >
            {!collapsed && '收起'}
          </Button>
        </div>
      </Sider>
      <Layout className="workspace-main">
        <Header className="workspace-header">
          <div className="workspace-title-block">
            <Title level={4}>{currentModule.title}</Title>
            <p>{currentModule.description}</p>
          </div>
        </Header>
        <Content className="workspace-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
