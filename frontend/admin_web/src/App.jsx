import { useMemo, useState } from 'react';
import {
  BarChartOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  MenuOutlined,
  PlaySquareOutlined,
  RightOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Space, Table, Tag, Typography } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const landingNavItems = [
  { label: '产品价值', href: '#产品价值' },
  { label: '项目亮点', href: '#项目亮点' },
  { label: '核心闭环', href: '#核心闭环' },
  { label: '应用场景', href: '#应用场景' },
];

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

const pipelineSteps = [
  {
    title: '捕捉情绪火花',
    status: '候选',
    description: '识别反转、冲突、心动、爽点等剧情情绪峰值。',
  },
  {
    title: '提炼剧情爆点',
    status: '已提炼',
    description: '将字幕和时间轴片段转化为可运营的高光建议。',
  },
  {
    title: '审核互动内容',
    status: '待审核',
    description: '在进入播放端前完成编辑、确认、发布或驳回。',
  },
  {
    title: '下发点燃策略',
    status: '已下发',
    description: '把按钮、触发时间和展示策略下发到播放端。',
  },
  {
    title: '触发即时回应',
    status: '触发中',
    description: '在用户情绪最强的瞬间出现低门槛互动入口。',
  },
  {
    title: '回流互动数据',
    status: '已回流',
    description: '将曝光、点击和忽略行为沉淀为策略优化依据。',
  },
];

const highlightCards = [
  {
    id: 'content-understanding',
    title: '内容理解',
    eyebrow: 'UNDERSTAND',
    description: '从短剧字幕和剧情节奏中识别关键情绪节点，找到适合触发互动的高光时刻。',
    icon: <ExperimentOutlined />,
  },
  {
    id: 'strategy-orchestration',
    title: '策略编排',
    eyebrow: 'ORCHESTRATE',
    description: '将高光片段转化为可发布的互动按钮、触发时间和播放策略。',
    icon: <PlaySquareOutlined />,
  },
  {
    id: 'client-interaction',
    title: '端上互动',
    eyebrow: 'ENGAGE',
    description: '在观看不中断的前提下，以轻量互动承接用户情绪，让表达更即时、更低门槛。',
    icon: <FileTextOutlined />,
  },
  {
    id: 'data-feedback',
    title: '数据反馈',
    eyebrow: 'FEEDBACK',
    description: '追踪曝光、点击和忽略行为，帮助团队判断哪些时刻真正打动观众。',
    icon: <BarChartOutlined />,
  },
];

const audienceScenes = [
  {
    title: '短剧平台',
    description: '在反转和冲突高峰触发轻量互动，提升观看参与感。',
    type: 'player',
  },
  {
    title: '内容运营',
    description: '通过高光点与回应数据判断哪些剧情更能引发情绪。',
    type: 'ops',
  },
  {
    title: '互动增长',
    description: '用低门槛按钮替代高成本输入，让更多用户完成第一次回应。',
    type: 'overlay',
  },
  {
    title: '数据分析',
    description: '把回应率、点击率和高光分布回流到后台，形成策略优化依据。',
    type: 'chart',
  },
];

function MiniScene({ type }) {
  if (type === 'player') {
    return (
      <div className="mini-ui mini-player">
        <div className="mini-video" />
        <div className="mini-timeline">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  if (type === 'ops') {
    return (
      <div className="mini-ui mini-ops">
        <div />
        <div />
        <div />
      </div>
    );
  }

  if (type === 'overlay') {
    return (
      <div className="mini-ui mini-overlay">
        <div className="mini-video" />
        <button>太反转了</button>
        <button>爽到了</button>
      </div>
    );
  }

  return (
    <div className="mini-ui mini-chart">
      <span style={{ height: '42%' }} />
      <span style={{ height: '76%' }} />
      <span style={{ height: '58%' }} />
      <span style={{ height: '88%' }} />
    </div>
  );
}

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

function LandingPage() {
  return (
    <main className="landing-page">
      <header className="floating-nav" aria-label="IgniteNow admin navigation">
        <a className="logo-lockup" href="#top" aria-label="IgniteNow Admin">
          <span className="logo-text">IgniteNow</span>
        </a>

        <nav className="nav-links" aria-label="入口页分区">
          {landingNavItems.map((item) => (
            <a href={item.href} key={item.label}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <a className="nav-admin-button" href="/admin">
            进入工作台
          </a>
          <Button
            shape="circle"
            className="icon-button mobile-only"
            icon={<MenuOutlined />}
            aria-label="打开菜单"
          />
        </div>
      </header>

      <section className="hero-section" id="top">
        <div className="hero-copy reveal-block">
          <p className="eyebrow">
            <span />
            INTERACTION ENGINE
          </p>
          <h1>点燃剧情高光</h1>
          <h1>让回应发生在此刻</h1>
          <p className="hero-lede">
            IgniteNow 识别短剧内容中的关键情绪节点，并将它们转化为生动的互动体验。
          </p>
          <div className="hero-actions">
            <a className="primary-pill" href="/admin">
              进入工作台
              <RightOutlined />
            </a>
            <a className="secondary-pill" href="#项目亮点">
              了解项目亮点
            </a>
          </div>
        </div>

        <div className="hero-engine-panel reveal-block" aria-label="短剧互动引擎预览">
          <div className="engine-video">
            <div className="engine-video-top">
              <span>EP.01</span>
              <span>LIVE MOMENTS</span>
            </div>
            <div className="engine-caption">她终于发现真相</div>
            <div className="engine-reaction">
              <button>太反转了</button>
              <button>爽到了</button>
            </div>
          </div>
          <div className="engine-timeline">
            <div className="timeline-track" />
            {['反转', '冲突', '心动', '爽点'].map((node, index) => (
              <div className={`emotion-node emotion-node-${index + 1}`} key={node}>
                <span />
                <strong>{node}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="value-section reveal-block" id="产品价值">
        <p className="watermark">Value</p>
        <div className="value-copy">
          <p className="eyebrow">
            <span />
            PRODUCT VALUE
          </p>
          <h2>把转瞬即逝的情绪，变成可触发的互动时刻。</h2>
          <p>
            短剧的反转、冲突、撒糖和打脸瞬间最容易激发回应，但传统评论输入太慢，弹幕又容易淹没在内容流里。
          </p>
          <p>
            IgniteNow 将剧情高光识别、互动策略和端上触发连接起来，让用户在最有情绪的瞬间完成低门槛回应。
          </p>
        </div>
        <div className="before-after-panel">
          <article className="comparison-card before-card">
            <span>Before</span>
            <div className="comparison-screen">
              <div className="plain-video" />
              <div className="comment-entry">评论入口</div>
            </div>
            <p>一般的弹幕和评论，使得用户互动门槛较高。</p>
          </article>
          <article className="comparison-card after-card">
            <span>After</span>
            <div className="comparison-screen">
              <div className="plain-video active-video" />
              <div className="comparison-timeline">
                <i />
                <i />
                <i />
              </div>
              <div className="floating-actions">
                <button>爽到了</button>
                <button>有反转</button>
                <button>磕到了</button>
              </div>
            </div>
            <p>到达高光节点后，屏幕展现精彩的互动，回应发生在此时此刻。</p>
          </article>
        </div>
      </section>

      <section className="feature-section reveal-block" id="项目亮点">
        <div className="section-heading feature-heading">
          <p className="eyebrow">
            <span />
            HIGHLIGHTS
          </p>
          <h2>项目亮点</h2>
        </div>

        <div className="light-trail feature-trail" aria-hidden="true" />
        <div className="bento-grid">
          {highlightCards.map((feature) => (
            <article className="bento-card" id={feature.id} key={feature.title}>
              <div className="bento-icon">
                <span className="feature-icon">{feature.icon}</span>
              </div>
              <p className="feature-eyebrow">
                <span />
                {feature.eyebrow}
              </p>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pipeline-section reveal-block" id="核心闭环">
        <p className="watermark">Flow</p>
        <div className="section-heading">
          <p className="eyebrow">
            <span />
            CORE LOOP
          </p>
          <h2>核心闭环</h2>
        </div>
        <div className="loop-engine">
          <div className="loop-curve" />
          {pipelineSteps.map((step, index) => (
            <article className="loop-node" key={step.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step.title}</strong>
              <em>{step.status}</em>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="audience-section reveal-block" id="应用场景">
        <div>
          <p className="eyebrow">
            <span />
            AUDIENCE SCENES
          </p>
          <h2>应用场景</h2>
        </div>
        <div className="audience-grid">
          {audienceScenes.map((scene) => (
            <article className="audience-card" key={scene.title}>
              <MiniScene type={scene.type} />
              <h3>{scene.title}</h3>
              <p>{scene.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function AdminWorkspace() {
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

function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  return isAdminRoute ? <AdminWorkspace /> : <LandingPage />;
}

export default App;
