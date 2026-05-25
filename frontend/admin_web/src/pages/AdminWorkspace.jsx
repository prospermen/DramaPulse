import { useMemo, useState } from 'react';
import {
  BarChartOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  PlaySquareOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Space, Table, Tag, Typography } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const adminModules = [
  {
    id: 'dramas',
    title: '短剧管理',
    eyebrow: 'DRAMAS',
    description: '创建短剧，作为后续剧集、字幕和高光审核的内容容器。',
    icon: <VideoCameraOutlined />,
    status: '待接 API',
  },
  {
    id: 'episodes',
    title: '剧集配置',
    eyebrow: 'EPISODES',
    description: '维护视频 URL、字幕 URL 或字幕正文，为 AI 分析提供输入。',
    icon: <PlaySquareOutlined />,
    status: '待接 API',
  },
  {
    id: 'analyze',
    title: 'AI 高光识别',
    eyebrow: 'ANALYZE',
    description: '触发后端分析任务，将字幕转化为 draft 高光事件。',
    icon: <ExperimentOutlined />,
    status: '待接 API',
  },
  {
    id: 'highlights',
    title: '高光审核发布',
    eyebrow: 'REVIEW',
    description: '查看、编辑、发布或驳回高光，守住播放端下发质量。',
    icon: <FileTextOutlined />,
    status: '待接 API',
  },
  {
    id: 'analytics',
    title: '基础数据看板',
    eyebrow: 'ANALYTICS',
    description: '追踪短剧、剧集、高光、曝光、点击和点击率 overview。',
    icon: <BarChartOutlined />,
    status: '待接 API',
  },
];

const demoRows = [
  {
    key: '1',
    item: '示例短剧',
    type: 'Drama',
    status: '页面待实现',
    owner: 'P0-WEB-03',
  },
  {
    key: '2',
    item: '第 1 集',
    type: 'Episode',
    status: '页面待实现',
    owner: 'P0-WEB-04',
  },
  {
    key: '3',
    item: '高光审核队列',
    type: 'Highlight',
    status: '页面待实现',
    owner: 'P0-WEB-06',
  },
];

export default function AdminWorkspace() {
  const [selectedKey, setSelectedKey] = useState('dramas');
  const currentModule =
    adminModules.find((module) => module.id === selectedKey) ?? adminModules[0];

  const menuItems = useMemo(
    () =>
      adminModules.map((module) => ({
        key: module.id,
        icon: module.icon,
        label: module.title,
      })),
    [],
  );

  const columns = [
    {
      title: '对象',
      dataIndex: 'item',
      key: 'item',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (value) => <Tag color="default">{value}</Tag>,
    },
    {
      title: '任务',
      dataIndex: 'owner',
      key: 'owner',
      width: 130,
    },
  ];

  return (
    <Layout className="workspace-shell">
      <Sider width={236} className="workspace-sider">
        <a className="workspace-brand" href="/">
          IgniteNow
          <span>Admin Console</span>
        </a>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>
      <Layout className="workspace-main">
        <Header className="workspace-header">
          <Space direction="vertical" size={0}>
            <Text type="secondary">后台工作台</Text>
            <Title level={3}>{currentModule.title}</Title>
          </Space>
          <a className="secondary-pill compact-pill" href="/">
            返回入口页
          </a>
        </Header>
        <Content className="workspace-content">
          <section className="workspace-summary">
            <div>
              <p className="eyebrow">
                <span />
                {currentModule.eyebrow}
              </p>
              <h1>{currentModule.title}</h1>
              <p>{currentModule.description}</p>
            </div>
            <Tag color="warning">{currentModule.status}</Tag>
          </section>

          <section className="workspace-grid">
            <div className="metric-tile">
              <span>短剧</span>
              <strong>0</strong>
            </div>
            <div className="metric-tile">
              <span>剧集</span>
              <strong>0</strong>
            </div>
            <div className="metric-tile">
              <span>高光</span>
              <strong>0</strong>
            </div>
            <div className="metric-tile">
              <span>互动</span>
              <strong>0</strong>
            </div>
          </section>

          <section className="workspace-table-panel">
            <div className="table-toolbar">
              <div>
                <h2>待接入列表区域</h2>
                <p>这里将承载表格、筛选、表单和审核动作。</p>
              </div>
              <Button type="primary" disabled>
                新建
              </Button>
            </div>
            <Table
              size="middle"
              columns={columns}
              dataSource={demoRows}
              pagination={false}
            />
          </section>
        </Content>
      </Layout>
    </Layout>
  );
}
