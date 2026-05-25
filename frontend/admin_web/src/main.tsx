import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { App, Button, Drawer, Form, Input, InputNumber, Layout, Popconfirm, Select, Space, Statistic, Table, Tabs, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { adminApi } from './services/api';
import type { Drama, Episode, EpisodeTimelineItem, Highlight, HighlightStats, Overview } from './types/api';
import './styles.css';

const sampleSubtitle = `1
00:00:02,000 --> 00:00:05,000
你竟敢羞辱她，今天我替她讨回公道。

2
00:00:08,000 --> 00:00:12,000
所有人都以为他输了，可真正的身份终于曝光。

3
00:00:16,000 --> 00:00:20,000
坏人终于被打脸，这一刻太爽了。`;

function AdminConsole() {
  const { message } = App.useApp();
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [timeline, setTimeline] = useState<EpisodeTimelineItem[]>([]);
  const [ranking, setRanking] = useState<HighlightStats[]>([]);
  const [selectedStats, setSelectedStats] = useState<HighlightStats | null>(null);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<number | null>(null);
  const [selectedHighlightIds, setSelectedHighlightIds] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [dramaForm] = Form.useForm();
  const [episodeForm] = Form.useForm();

  const selectedEpisode = useMemo(
    () => episodes.find((episode) => episode.id === selectedEpisodeId) ?? episodes[0],
    [episodes, selectedEpisodeId],
  );

  async function refresh() {
    const [nextDramas, nextEpisodes, nextOverview] = await Promise.all([
      adminApi.listDramas(),
      adminApi.listEpisodes(),
      adminApi.overview(),
    ]);
    setDramas(nextDramas);
    setEpisodes(nextEpisodes);
    setOverview(nextOverview);
    const episodeId = selectedEpisodeId ?? nextEpisodes[0]?.id ?? null;
    setSelectedEpisodeId(episodeId);
    setRanking(await adminApi.highlightRanking(20));
    if (episodeId) {
      const [nextHighlights, nextTimeline] = await Promise.all([
        adminApi.listHighlights(episodeId),
        adminApi.episodeTimeline(episodeId),
      ]);
      setHighlights(nextHighlights);
      setTimeline(nextTimeline);
    }
  }

  async function loadEpisodeReview(episodeId: number) {
    const [nextHighlights, nextTimeline] = await Promise.all([
      adminApi.listHighlights(episodeId),
      adminApi.episodeTimeline(episodeId),
    ]);
    setSelectedEpisodeId(episodeId);
    setSelectedHighlightIds([]);
    setHighlights(nextHighlights);
    setTimeline(nextTimeline);
  }

  async function bulkStatus(status: string) {
    if (!selectedEpisode) {
      return;
    }
    const ids = selectedHighlightIds.map(Number);
    if (ids.length === 0) {
      message.warning('请先选择高光');
      return;
    }
    await runStep(() => adminApi.bulkHighlightStatus(selectedEpisode.id, ids, status), `已更新 ${ids.length} 条高光`);
    setSelectedHighlightIds([]);
  }

  async function openStats(highlightId: number) {
    try {
      setSelectedStats(await adminApi.highlightStats(highlightId));
    } catch (error) {
      message.error(error instanceof Error ? error.message : '统计加载失败');
    }
  }

  async function runStep(action: () => Promise<unknown>, success: string) {
    setLoading(true);
    try {
      await action();
      message.success(success);
      await refresh();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '操作失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh().catch(() => message.warning('请先启动后端服务 http://localhost:8000'));
  }, []);

  const statusColor = (status: string) => {
    if (status === 'published') return 'green';
    if (status === 'rejected') return 'red';
    if (status === 'archived') return 'default';
    return 'gold';
  };

  const highlightColumns: ColumnsType<Highlight> = [
    { title: '时间', render: (_, item) => `${item.start_time.toFixed(1)}s - ${item.end_time.toFixed(1)}s`, width: 120 },
    { title: '类型', dataIndex: 'highlight_type', render: (value) => <Tag color="cyan">{value}</Tag>, width: 120 },
    { title: '按钮', dataIndex: 'button_text', width: 120 },
    { title: '状态', dataIndex: 'status', render: (value) => <Tag color={statusColor(value)}>{value}</Tag>, width: 120 },
    { title: '置信度', dataIndex: 'confidence', render: (value) => value.toFixed(2), width: 90 },
    { title: '原因', dataIndex: 'reason' },
    {
      title: '操作',
      width: 250,
      render: (_, item) => (
        <Space size={6}>
          <Button size="small" onClick={() => openStats(item.id)}>
            统计
          </Button>
          <Button
            size="small"
            onClick={() => runStep(() => adminApi.updateHighlight(item.id, { status: item.status === 'published' ? 'draft' : 'published' }), '状态已切换')}
          >
            切换
          </Button>
          <Popconfirm
            title="归档这条高光？"
            okText="归档"
            cancelText="取消"
            onConfirm={() => runStep(() => adminApi.archiveHighlight(item.id), '高光已归档')}
          >
            <Button size="small" danger>
              归档
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const timelineMax = Math.max(...timeline.map((item) => item.end_time), selectedEpisode?.duration ?? 1, 1);

  return (
    <Layout className="shell">
      <Layout.Sider width={260} className="sidebar">
        <div className="brand">IgniteNow</div>
        <Typography.Text className="muted">短剧高光互动运营台</Typography.Text>
        <Space direction="vertical" className="quick">
          <Button block type="primary" loading={loading} onClick={() => runStep(adminApi.seedDemo, '演示数据已准备')}>
            准备演示数据
          </Button>
          <Button block loading={loading} disabled={!selectedEpisode} onClick={() => selectedEpisode && runStep(() => adminApi.analyzeEpisode(selectedEpisode.id), 'AI 高光已生成')}>
            AI 识别当前剧集
          </Button>
          <Button block loading={loading} disabled={!selectedEpisode} onClick={() => selectedEpisode && runStep(() => adminApi.publishHighlights(selectedEpisode.id), '高光已发布')}>
            发布当前高光
          </Button>
        </Space>
      </Layout.Sider>
      <Layout.Content className="content">
        <header className="topbar">
          <div>
            <Typography.Title level={2}>MVP 闭环控制台</Typography.Title>
            <Typography.Text type="secondary">创建内容、生成高光、发布到播放端、查看互动回流。</Typography.Text>
          </div>
          <Button onClick={() => refresh()}>刷新</Button>
        </header>

        <section className="metrics">
          {[
            ['短剧', overview?.drama_count ?? 0],
            ['剧集', overview?.episode_count ?? 0],
            ['高光', overview?.highlight_count ?? 0],
            ['已发布', overview?.published_highlight_count ?? 0],
            ['互动', overview?.interaction_count ?? 0],
            ['点击率', `${Math.round((overview?.avg_click_rate ?? 0) * 100)}%`],
          ].map(([label, value]) => (
            <div className="metric" key={label}>
              <Statistic title={label} value={value} />
            </div>
          ))}
        </section>

        <Tabs
          items={[
            {
              key: 'content',
              label: '内容配置',
              children: (
                <div className="grid two">
                  <div className="panel">
                    <Typography.Title level={4}>短剧</Typography.Title>
                    <Form form={dramaForm} layout="vertical" onFinish={(values) => runStep(() => adminApi.createDrama(values), '短剧已创建')}>
                      <Form.Item name="title" label="标题" rules={[{ required: true }]}>
                        <Input placeholder="逆光归来" />
                      </Form.Item>
                      <Form.Item name="description" label="简介">
                        <Input.TextArea rows={3} />
                      </Form.Item>
                      <Form.Item name="cover_url" label="封面 URL">
                        <Input />
                      </Form.Item>
                      <Button htmlType="submit" type="primary" loading={loading}>
                        创建短剧
                      </Button>
                    </Form>
                    <Table rowKey="id" size="small" dataSource={dramas} columns={[{ title: 'ID', dataIndex: 'id' }, { title: '标题', dataIndex: 'title' }]} pagination={false} />
                  </div>
                  <div className="panel">
                    <Typography.Title level={4}>剧集</Typography.Title>
                    <Form
                      form={episodeForm}
                      layout="vertical"
                      initialValues={{ episode_no: 1, duration: 30, subtitle_content: sampleSubtitle, video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' }}
                      onFinish={(values) => runStep(() => adminApi.createEpisode({ ...values, subtitle_url: values.subtitle_url ?? '' }), '剧集已创建')}
                    >
                      <Form.Item name="drama_id" label="所属短剧" rules={[{ required: true }]}>
                        <Select options={dramas.map((item) => ({ label: item.title, value: item.id }))} />
                      </Form.Item>
                      <Form.Item name="episode_no" label="集数">
                        <InputNumber min={1} className="wide" />
                      </Form.Item>
                      <Form.Item name="title" label="标题" rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name="video_url" label="视频 URL" rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name="duration" label="时长（秒）">
                        <InputNumber min={1} className="wide" />
                      </Form.Item>
                      <Form.Item name="subtitle_content" label="字幕内容">
                        <Input.TextArea rows={6} />
                      </Form.Item>
                      <Button htmlType="submit" type="primary" loading={loading}>
                        创建剧集
                      </Button>
                    </Form>
                  </div>
                </div>
              ),
            },
            {
              key: 'review',
              label: '高光审核',
              children: (
                <div className="panel">
                  <Space className="toolbar" wrap>
                    <Select
                      value={selectedEpisode?.id}
                      className="episodeSelect"
                      onChange={loadEpisodeReview}
                      options={episodes.map((item) => ({ label: `${item.id} / ${item.title}`, value: item.id }))}
                    />
                    <Button loading={loading} onClick={() => selectedEpisode && runStep(() => adminApi.analyzeEpisode(selectedEpisode.id), 'AI 高光已生成')}>
                      重新识别
                    </Button>
                    <Button type="primary" loading={loading} onClick={() => selectedEpisode && runStep(() => adminApi.publishHighlights(selectedEpisode.id), '高光已发布')}>
                      发布 Draft
                    </Button>
                    <Button loading={loading} disabled={selectedHighlightIds.length === 0} onClick={() => bulkStatus('published')}>
                      批量发布
                    </Button>
                    <Button loading={loading} disabled={selectedHighlightIds.length === 0} onClick={() => bulkStatus('rejected')}>
                      批量驳回
                    </Button>
                    <Button danger loading={loading} disabled={selectedHighlightIds.length === 0} onClick={() => bulkStatus('archived')}>
                      批量归档
                    </Button>
                  </Space>
                  <div className="selectionHint">已选择 {selectedHighlightIds.length} 条，归档后不会下发到播放端。</div>
                  <Table
                    rowKey="id"
                    dataSource={highlights}
                    columns={highlightColumns}
                    pagination={false}
                    rowSelection={{
                      selectedRowKeys: selectedHighlightIds,
                      onChange: setSelectedHighlightIds,
                    }}
                  />
                </div>
              ),
            },
            {
              key: 'insight',
              label: '时间线看板',
              children: (
                <div className="grid insightGrid">
                  <div className="panel">
                    <div className="panelHeader">
                      <div>
                        <Typography.Title level={4}>单集高光时间线</Typography.Title>
                        <Typography.Text type="secondary">{selectedEpisode ? `${selectedEpisode.title} · ${timeline.length} 条高光` : '请选择剧集'}</Typography.Text>
                      </div>
                      <Select
                        value={selectedEpisode?.id}
                        className="episodeSelect compact"
                        onChange={loadEpisodeReview}
                        options={episodes.map((item) => ({ label: `${item.episode_no}. ${item.title}`, value: item.id }))}
                      />
                    </div>
                    <div className="timelineRail">
                      {timeline.map((item) => {
                        const left = Math.max(0, (item.start_time / timelineMax) * 100);
                        const width = Math.max(2, ((item.end_time - item.start_time) / timelineMax) * 100);
                        return (
                          <button
                            key={item.highlight_id}
                            className={`timelineBlock ${item.status}`}
                            style={{ left: `${left}%`, width: `${width}%` }}
                            onClick={() => openStats(item.highlight_id)}
                            title={`${item.start_time.toFixed(1)}s - ${item.end_time.toFixed(1)}s`}
                          >
                            {item.click_count}
                          </button>
                        );
                      })}
                    </div>
                    <div className="timelineList">
                      {timeline.map((item) => (
                        <button key={item.highlight_id} className="timelineRow" onClick={() => openStats(item.highlight_id)}>
                          <span>{item.start_time.toFixed(1)}s</span>
                          <Tag color={statusColor(item.status)}>{item.status}</Tag>
                          <strong>{item.button_text}</strong>
                          <span>曝光 {item.impression_count}</span>
                          <span>点击 {item.click_count}</span>
                          <span>{Math.round(item.click_rate * 100)}%</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="panel">
                    <Typography.Title level={4}>高光排行榜</Typography.Title>
                    <Table
                      rowKey="highlight_id"
                      size="small"
                      dataSource={ranking}
                      pagination={false}
                      columns={[
                        { title: 'ID', dataIndex: 'highlight_id', width: 70 },
                        { title: '按钮', dataIndex: 'button_text' },
                        { title: '曝光', dataIndex: 'impression_count', width: 80 },
                        { title: '点击', dataIndex: 'click_count', width: 80 },
                        { title: '点击率', dataIndex: 'click_rate', render: (value) => `${Math.round(value * 100)}%`, width: 90 },
                      ]}
                      onRow={(record) => ({
                        onClick: () => openStats(record.highlight_id),
                      })}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
        <Drawer
          title={selectedStats ? `高光 #${selectedStats.highlight_id} 统计` : '高光统计'}
          open={Boolean(selectedStats)}
          onClose={() => setSelectedStats(null)}
          width={420}
        >
          {selectedStats && (
            <div className="statsDrawer">
              <Tag color={statusColor(selectedStats.status)}>{selectedStats.status}</Tag>
              <Typography.Title level={3}>{selectedStats.button_text}</Typography.Title>
              <Typography.Text type="secondary">
                {selectedStats.start_time.toFixed(1)}s - {selectedStats.end_time.toFixed(1)}s · {selectedStats.highlight_type}
              </Typography.Text>
              <div className="statsGrid">
                <Statistic title="曝光" value={selectedStats.impression_count} />
                <Statistic title="点击" value={selectedStats.click_count} />
                <Statistic title="忽略" value={selectedStats.ignore_count} />
                <Statistic title="点击率" value={`${Math.round(selectedStats.click_rate * 100)}%`} />
              </div>
            </div>
          )}
        </Drawer>
      </Layout.Content>
    </Layout>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App>
      <AdminConsole />
    </App>
  </React.StrictMode>,
);
