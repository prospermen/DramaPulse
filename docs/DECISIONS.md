# 技术决策记录

## 2026-05-24 P0 闭环实现

- 后端采用 FastAPI + SQLAlchemy，默认 `sqlite:///./ignitenow.db`，同时保留 MySQL `DATABASE_URL` 配置，方便本地快速演示和后续迁移。
- AI 高光识别 MVP 默认走本地关键词 fallback，不依赖 LLM Key；Prompt 模板和 JSON Schema 已保留给后续 LLM 接入。
- 管理后台接口以 `X-Admin-Token` 做 MVP 基础鉴权，完整登录权限放到 P2。
- 播放端接口只返回 `published` 高光，并隐藏 `reason`、`confidence`、`status` 等后台审核字段。
- 用户互动日志使用 `idempotency_key` 唯一约束，重复请求返回成功但不重复写入。
- Flutter 目录以当前仓库实际 `mobile/` 为准，不新建 `mobile_flutter/`。

## 2026-05-24 DeepSeek 接入

- AI 高光识别接入 DeepSeek Chat Completions，配置通过 `DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL`、`DEEPSEEK_MODEL`、`DEEPSEEK_THINKING`、`DEEPSEEK_TIMEOUT_SECONDS` 管理。
- 默认模型使用 `deepseek-v4-flash`，默认关闭 thinking，优先保证 JSON 结构稳定和演示响应速度。
- DeepSeek 调用必须输出符合 `docs/HIGHLIGHT_SCHEMA.json` 的 JSON；后端仍会进行枚举、时间范围、分数范围校验，不直接信任 LLM 输出。
- 无 key 或 DeepSeek 调用异常时自动回退到本地关键词规则，避免演示链路被外部服务阻塞。
- API Key 不进入仓库，只通过环境变量或本地未提交配置注入。

## 2026-05-24 播放端内容入口

- 移动端不直接复用后台 `GET /api/dramas` / `GET /api/episodes` 作为入口，新增 `GET /api/player/dramas` 和 `GET /api/player/dramas/{drama_id}/episodes`。
- 播放端入口接口只返回短剧和剧集展示所需字段，不下发字幕正文、AI 分析错误、审核状态等后台字段。
- Flutter 首页从数据库驱动的短剧/剧集列表进入播放页，保留 `GET /api/player/episodes/{episode_id}` 作为播放详情接口。

## 2026-05-24 本地视频播放代理

- 浏览器不能直接播放数据库中的 Windows 本地文件路径，例如 `D:\byte\upload\videos\E007.mp4`，会被 URL safety check 拒绝。
- 播放端详情接口在遇到服务端本机存在的本地视频文件时，返回 `/api/player/episodes/{episode_id}/video`，由 FastAPI 以 HTTP 方式代理 MP4 文件。
- 远程 `http(s)` 视频 URL 保持原样返回；不存在或格式不支持的路径仍由播放端显示错误提示。

## 2026-05-24 OCR 字幕导入

- 视频 OCR 输出统一先清洗为 SRT 格式再写入 `episode.subtitle_content`，避免 AI 分析服务直接依赖 OCR 原始块格式。
- OCR 导入按文件名中的 `E001`、`E002` 等编号匹配 `episode.episode_no`，当前主短剧使用 `drama_id=2`。
- 清洗策略只做保守处理：过滤明显噪声行、去掉同一时间块内重复行、跳过相邻重复块；不尝试自动修正剧情语义，避免误改字幕内容。
- OCR 字幕可能存在识别错误，因此批量 AI 分析结果默认保持 `draft` 状态，必须经管理后台审核后再发布到 Flutter 播放端。

## 2026-05-24 Flutter API 地址

- Flutter 播放端默认后端地址按运行平台区分：Web 使用 `http://localhost:8000`，Android 模拟器使用 `http://10.0.2.2:8000`。
- `API_BASE_URL` 仍作为最高优先级配置，可通过 `flutter run --dart-define=API_BASE_URL=...` 覆盖默认地址，方便真机或局域网演示。
