# IgniteNow API 契约

基础地址：`http://localhost:8000`

管理后台写接口和管理统计接口必须携带：

```http
X-Admin-Token: demo-admin-token
```

统一响应：

```json
{
  "success": true,
  "message": "ok",
  "data": {}
}
```

## 状态与枚举

- `episode.analyze_status`: `pending`、`processing`、`success`、`failed`
- `highlight_event.status`: `draft`、`published`、`rejected`、`archived`
- `highlight_type`: `conflict`、`reversal`、`sweet`、`satisfying`、`suspense`
- `action_type`: `impression`、`click`、`ignore`
- 时间单位：秒，字段类型为 number/float

## 管理后台 API

### `GET /api/dramas`

返回短剧列表。

### `POST /api/dramas`

创建短剧。需要 `X-Admin-Token`。

请求体：

```json
{
  "title": "逆光归来",
  "description": "演示短剧",
  "cover_url": ""
}
```

### `GET /api/episodes?drama_id=1`

返回剧集列表。`drama_id` 可选。

### `POST /api/episodes`

创建剧集。需要 `X-Admin-Token`。

```json
{
  "drama_id": 1,
  "episode_no": 1,
  "title": "第 1 集",
  "video_url": "https://example.com/demo.mp4",
  "subtitle_url": "",
  "subtitle_content": "1\n00:00:02,000 --> 00:00:05,000\n真相终于曝光。",
  "duration": 30
}
```

### `POST /api/episodes/{episode_id}/analyze`

触发 AI 高光识别。需要 `X-Admin-Token`。

```json
{
  "force_reanalyze": false
}
```

规则：`processing` 时拒绝重复分析；`success` 且 `force_reanalyze=false` 时返回已有数量；`force_reanalyze=true` 时重建高光。

AI 高光识别默认逻辑：存在 `DEEPSEEK_API_KEY` 时优先调用 DeepSeek；未配置或调用失败时使用本地关键词 fallback，保证演示链路可恢复。

响应 `data`：

```json
{
  "highlight_count": 3,
  "provider": "deepseek",
  "llm_error": ""
}
```

### `GET /api/episodes/{episode_id}/highlights`

返回后台审核用高光列表，包含 `reason`、`confidence`、`status`。

### `PUT /api/highlights/{highlight_id}`

编辑高光点。需要 `X-Admin-Token`。

可编辑字段：`start_time`、`end_time`、`highlight_type`、`emotion`、`intensity`、`confidence`、`trigger_score`、`reason`、`button_text`、`effect`、`status`。

### `POST /api/episodes/{episode_id}/highlights/publish`

发布该集所有 `draft` 高光。需要 `X-Admin-Token`。

### `GET /api/analytics/overview`

基础看板。需要 `X-Admin-Token`。

返回字段：`drama_count`、`episode_count`、`highlight_count`、`published_highlight_count`、`interaction_count`、`click_count`、`ignore_count`、`avg_click_rate`。

### `GET /api/analytics/highlight-types`

高光类型分布。需要 `X-Admin-Token`。

### `GET /api/analytics/top-actions`

热门按钮点击排行。需要 `X-Admin-Token`。

### `POST /api/demo/seed`

写入演示短剧、剧集和互动模板。需要 `X-Admin-Token`。

## Flutter 播放端 API

### `GET /api/player/dramas`

返回播放端可展示的短剧列表，只包含移动端入口页必要字段。

```json
{
  "success": true,
  "data": [
    {
      "drama_id": 1,
      "title": "逆光归来",
      "description": "演示短剧",
      "cover_url": ""
    }
  ]
}
```

### `GET /api/player/dramas/{drama_id}/episodes`

返回某部短剧下的剧集入口列表，不暴露字幕内容、AI 分析错误、后台审核字段。

```json
{
  "success": true,
  "data": [
    {
      "episode_id": 1,
      "drama_id": 1,
      "episode_no": 1,
      "title": "第 1 集 真相浮出水面",
      "duration": 30,
      "published_highlight_count": 3
    }
  ]
}
```

### `GET /api/player/episodes/{episode_id}`

播放端只返回已发布高光，不暴露 `reason`、`confidence`、`status`。

如果后台保存的 `episode.video_url` 是 `http(s)` 地址，则原样返回；如果是服务端本机存在的本地 MP4 路径，例如 `D:\byte\upload\videos\E007.mp4`，后端会转换为 `GET /api/player/episodes/{episode_id}/video`，避免浏览器直接加载本地路径被安全策略拒绝。

```json
{
  "success": true,
  "data": {
    "episode_id": 1,
    "title": "第 1 集",
    "video_url": "https://example.com/demo.mp4",
    "duration": 30,
    "highlights": [
      {
        "highlight_id": 1,
        "start_time": 8,
        "end_time": 12,
        "highlight_type": "reversal",
        "emotion": "震惊",
        "intensity": 0.86,
        "trigger_score": 0.78,
        "button_text": "反转了",
        "effect": "screen_flash"
      }
    ]
  }
}
```

### `GET /api/player/episodes/{episode_id}/video`

播放端本地视频代理接口。当 `episode.video_url` 指向服务端本机存在的 MP4 文件时，此接口以 `video/mp4` 返回文件内容。该接口不暴露原始本地文件路径。

### `POST /api/interactions`

记录播放端互动行为。重复 `idempotency_key` 直接返回成功，不重复写入。

```json
{
  "user_id": "anonymous_550e8400",
  "episode_id": 1,
  "highlight_id": 1,
  "action_type": "click",
  "action_value": "反转了",
  "watch_time": 9.5,
  "idempotency_key": "anonymous_550e8400_1_click_202605241230"
}
```
