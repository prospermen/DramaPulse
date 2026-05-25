# 技术决策记录

## 2026-05-25

- 管理后台采用 Vite + React + Ant Design，目录固定为 `frontend/admin_web/`。
- 当前阶段先提供按 `DESIGN.md` 实现的品牌化入口主页，入口内容不绑定真实 API；API client 与业务页面在后续 P0-WEB-02 到 P0-WEB-07 中逐步实现。
- 入口页顶部导航使用介绍型分区命名，具体后台功能导航放到 `/admin` 工作台中，避免入口页和密集管理界面职责混杂。
- 页面职责调整为两层：`/` 是介绍型入口页，`/admin` 是密集型后台工作台骨架；真实 CRUD、审核、分析和看板功能后续都落在 `/admin` 体系中。
- `frontend/admin_web/README.md` 作为管理后台模块级交接文档，记录本模块启动、验证、当前范围和后续待办；跨端 API 字段仍以 `docs/API_CONTRACT.md` 为准。
