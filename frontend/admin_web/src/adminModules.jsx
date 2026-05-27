import {
  BarChartOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  PlaySquareOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

export const adminModules = [
  {
    id: 'dashboard',
    path: '/admin/dashboard',
    title: '仪表盘',
    eyebrow: 'DASHBOARD',
    description: '汇总短剧、剧集、高光和互动数据，快速查看系统核心指标。',
    icon: <BarChartOutlined />,
    status: '待接 API',
  },
  {
    id: 'dramas',
    path: '/admin/dramas',
    title: '短剧管理',
    eyebrow: 'DRAMAS',
    description: '创建短剧，作为后续剧集、字幕和高光审核的内容容器。',
    icon: <VideoCameraOutlined />,
    status: '待接 API',
  },
  {
    id: 'episodes',
    path: '/admin/episodes',
    title: '剧集配置',
    eyebrow: 'EPISODES',
    description: '维护视频 URL、字幕 URL 或字幕正文，为 AI 分析提供输入。',
    icon: <PlaySquareOutlined />,
    status: '待接 API',
  },
  {
    id: 'analyze',
    path: '/admin/analyze',
    title: 'AI 高光识别',
    eyebrow: 'ANALYZE',
    description: '触发后端分析任务，将字幕转化为 draft 高光事件。',
    icon: <ExperimentOutlined />,
    status: '待接 API',
  },
  {
    id: 'highlights',
    path: '/admin/highlights',
    title: '高光审核发布',
    eyebrow: 'REVIEW',
    description: '查看、编辑、发布或驳回高光，守住播放端下发质量。',
    icon: <FileTextOutlined />,
    status: '待接 API',
  }
];

export function getAdminModuleById(id) {
  return adminModules.find((module) => module.id === id) ?? adminModules[0];
}

export function getAdminModuleByPath(pathname) {
  return (
    adminModules.find((module) => pathname.startsWith(module.path)) ??
    adminModules[0]
  );
}
