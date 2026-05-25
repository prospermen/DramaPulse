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

## 移动端上传认证 API

### `POST /api/auth/register`

注册上传账号，并返回 Bearer token。

```json
{
  "username": "uploader",
  "password": "secret123"
}
```

响应 `data`：

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user_id": 1,
  "username": "uploader",
  "role": "uploader"
}
```

### `POST /api/auth/login`

登录上传账号，并返回 Bearer token。请求体同注册接口。

### `POST /api/uploads/episodes`

移动端上传单集视频和字幕并入库。需要：

```http
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

表单字段：

- `drama_id`: 可选；传入时挂到已有短剧。
- `drama_title`: 可选；未传 `drama_id` 时必填，用于创建新短剧。
- `drama_description`: 可选。
- `episode_no`: 必填，整数。
- `episode_title`: 必填。
- `duration`: 可选，秒。
- `video_file`: 必填，仅支持 `.mp4`。
- `subtitle_file`: 可选，支持 `.srt`、`.vtt`、`.txt`。
- `subtitle_content`: 可选；无字幕文件时可直接传字幕文本。

响应 `data`：

```json
{
  "drama_id": 2,
  "episode_id": 10,
  "video_url": "http://localhost:8000/api/player/episodes/10/video",
  "has_subtitle": true
}
```

上传文件保存在服务端本地 `backend/uploads/`，数据库中的 `episode.video_url` 保存为服务端本地文件路径，播放端继续通过 `/api/player/episodes/{episode_id}/video` 代理播放。

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
  "llm_error": "",
  "invalid_count": 0
}
```

### `GET /api/episodes/{episode_id}/highlights`

返回后台审核用高光列表，包含 `reason`、`confidence`、`status`。

### `POST /api/episodes/{episode_id}/highlights`

手动新增高光点。需要 `X-Admin-Token`。

```json
{
  "start_time": 8,
  "end_time": 12,
  "highlight_type": "reversal",
  "emotion": "震惊",
  "intensity": 0.86,
  "confidence": 0.8,
  "trigger_score": 0.78,
  "reason": "剧情发生反转",
  "button_text": "反转了",
  "effect": "screen_flash",
  "status": "draft"
}
```

规则：时间必须合法，`highlight_type`、`effect`、`status` 必须符合枚举；新增 `published` 高光时不得与该集已发布高光时间段重叠。

### `PUT /api/highlights/{highlight_id}`

编辑高光点。需要 `X-Admin-Token`。

可编辑字段：`start_time`、`end_time`、`highlight_type`、`emotion`、`intensity`、`confidence`、`trigger_score`、`reason`、`button_text`、`effect`、`status`。

规则：编辑为 `published` 时不得与该集其他已发布高光时间段重叠。

### `DELETE /api/highlights/{highlight_id}`

归档高光点。需要 `X-Admin-Token`。该接口不物理删除数据，而是将 `status` 置为 `archived`，用于保留审核痕迹并避免播放端继续下发。

### `POST /api/episodes/{episode_id}/highlights/bulk-status`

批量更新该集高光状态。需要 `X-Admin-Token`。

```json
{
  "highlight_ids": [1, 2, 3],
  "status": "published"
}
```

`highlight_ids` 为 `null` 或缺省时更新该集全部高光。批量发布时会校验发布后时间段不重叠。

### `POST /api/episodes/{episode_id}/highlights/publish`

发布该集所有 `draft` 高光。需要 `X-Admin-Token`。

### `GET /api/analytics/overview`

基础看板。需要 `X-Admin-Token`。

返回字段：`drama_count`、`episode_count`、`highlight_count`、`published_highlight_count`、`interaction_count`、`click_count`、`ignore_count`、`avg_click_rate`。

### `GET /api/analytics/highlight-types`

高光类型分布。需要 `X-Admin-Token`。

### `GET /api/analytics/top-actions`

热门按钮点击排行。需要 `X-Admin-Token`。

### `GET /api/analytics/highlight-ranking?limit=20`

按点击数、曝光数和点击率返回已发布高光排行。需要 `X-Admin-Token`。

返回字段：`highlight_id`、`episode_id`、`start_time`、`end_time`、`highlight_type`、`button_text`、`status`、`impression_count`、`click_count`、`ignore_count`、`click_rate`。

### `GET /api/analytics/episodes/{episode_id}/timeline`

返回某集高光时间线及每条高光的曝光、点击、忽略和点击率。需要 `X-Admin-Token`。

### `GET /api/analytics/highlights/{highlight_id}`

返回单条高光的互动统计。需要 `X-Admin-Token`。

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
