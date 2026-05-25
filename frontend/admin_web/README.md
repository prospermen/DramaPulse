# IgniteNow Admin Web

`frontend/admin_web/` 是 IgniteNow 的管理后台前端模块。当前已完成 `P0-WEB-01` 的工程初始化，并根据仓库根目录 `DESIGN.md` 建立了入口页，同时拆出 `/admin` 作为后续承载真实功能的后台工作台骨架。

## 当前已完成

- 初始化 Vite + React 项目结构。
- 接入 Ant Design 和 `@ant-design/icons`。
- 根据 `DESIGN.md` 建立入口主页视觉：
  - Canvas Cream 暖色背景
  - 顶部浮动 pill 导航
  - 大圆角 hero 区域
  - 能力地图圆形入口和 satellite CTA
  - 黑色 pill CTA
  - 橙色轨迹线与 accent dot
  - warm black 底部区域
- 建立两层页面结构：
  - `/`：介绍型入口页，负责说明系统链路、能力地图和当前状态。
  - `/admin`：密集型后台工作台骨架，后续承载真实管理功能。
- 在 `/admin` 中加入 P0 后续功能导航：
  - 短剧管理
  - 剧集管理
  - AI 分析
  - 高光审核
  - 基础看板
- 配置基础工程文件：
  - `package.json`
  - `package-lock.json`
  - `vite.config.js`
  - `eslint.config.js`
  - `.gitignore`
  - `index.html`
- 新增前端源码：
  - `src/main.jsx`
  - `src/App.jsx`
  - `src/pages/LandingPage.jsx`
  - `src/pages/AdminWorkspace.jsx`
  - `src/styles/base.css`
  - `src/styles/landing.css`
  - `src/styles/workspace.css`

## 目录说明

```text
frontend/admin_web/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx      # 概览页
│   │   └── AdminWorkspace.jsx   # /admin 后台工作台骨架
│   ├── styles/
│   │   ├── base.css             # 全局基础样式
│   │   ├── landing.css          # 概览页样式与动效
│   │   └── workspace.css        # 后台工作台样式
│   ├── App.jsx                  # 根据路径选择入口页或 /admin
│   └── main.jsx                 # React 挂载入口、Ant Design ConfigProvider 与主题 token
├── index.html           # Vite HTML 入口
├── vite.config.js       # Vite 配置，默认端口 5173
├── eslint.config.js     # ESLint 配置
├── package.json         # npm scripts 与依赖声明
├── package-lock.json    # 依赖锁定文件
├── .gitignore           # 忽略 node_modules、dist、日志文件
└── README.md            # 本文档
```

## 本地启动

第一次启动前先安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

入口页：

```text
http://localhost:5173/
```

## 常用命令

```bash
npm run build
```

执行生产构建，输出到 `dist/`。

```bash
npm exec eslint .
```

执行当前前端目录的 ESLint 检查。

```bash
npm run preview
```

本地预览生产构建结果。

## 已验证结果

截至 2026-05-25，已完成以下验证：

- `npm install` 成功。
- `npm exec eslint .` 通过。
- `npm run build` 通过。
- `npm run dev -- --host 127.0.0.1` 启动后，`http://127.0.0.1:5173/` 返回 HTTP 200。
- `/admin` 已作为后台工作台骨架，可由入口页按钮进入。

当前构建产物中 JS 约 347 kB，未触发 500 kB chunk 警告。等页面和路由变多后，可再通过按需拆分页面、动态 import 或 manual chunks 优化。

## 接下来需要完善

后续工作应按 `docs/TASK_BREAKDOWN.md` 的 P0-WEB 顺序推进：

| ID | 内容 | 当前状态 |
|---|---|---|
| `P0-WEB-02` | API client 封装，统一 Axios service，并自动携带 `X-Admin-Token` | 未完成 |
| `P0-WEB-03` | 短剧列表/创建页 | 未完成 |
| `P0-WEB-04` | 剧集列表/创建页，支持视频 URL、字幕 URL/字幕内容 | 未完成 |
| `P0-WEB-05` | AI 分析触发按钮 | 未完成 |
| `P0-WEB-06` | 高光审核页，支持查看、编辑、发布、驳回 | 未完成 |
| `P0-WEB-07` | 基础看板页，展示 overview 指标 | 未完成 |

## 尚未完成

- 尚未接入后端 API。
- 尚未实现统一 Axios client。
- 尚未实现 `X-Admin-Token` 自动注入。
- 尚未配置环境变量，例如后端 API base URL 和 admin token。
- 当前 `/admin` 只是后台工作台骨架，不具备真实创建、编辑、发布或查询能力。
- 尚未引入前端路由库；当前通过 `window.location.pathname` 在 `/` 和 `/admin` 间做轻量切换。
- 尚未实现错误提示、加载态、空状态、表单校验和接口异常处理。
- 尚未实现端到端验收链路。

## 后续开发建议

下一步建议优先做 `P0-WEB-02`：

1. 新增 `.env.example` 或模块内环境变量说明，约定 `VITE_API_BASE_URL`、`VITE_ADMIN_TOKEN`。
2. 在 `src/` 下建立 `services/apiClient.js` 或相近命名。
3. 使用 Axios 创建统一实例。
4. 请求拦截器自动写入 `X-Admin-Token`。
5. 根据 `docs/API_CONTRACT.md` 中的后端契约再实现具体业务 API。

注意：修改 API 字段、请求体或响应体前，必须先同步 `docs/API_CONTRACT.md`；高光 JSON 结构以 `docs/HIGHLIGHT_SCHEMA.json` 为准。
