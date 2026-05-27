# IgniteNow Admin Web JWT 认证方案

本文记录管理后台当前采用的 JWT 登录方案。第一版不做 refresh token，access token 存在 `localStorage`，后台业务接口统一携带 `Authorization: Bearer <access_token>`。

## 1. 目标

完整链路：

```text
打开 /login
→ 输入账号和密码
→ POST /api/auth/login
→ 后端校验账号和密码 hash
→ 后端签发 access_token
→ 前端校验 user.role === "admin"
→ 前端保存 access_token 和用户信息
→ 跳转 /admin/dashboard
→ 后续请求携带 Authorization: Bearer <access_token>
→ 后端校验 JWT 签名、过期时间和角色
→ 通过后调用对应业务接口函数
```

## 2. 路由

```text
/                 产品入口页
/login            后台登录页
/admin            后台工作台，默认跳转 /admin/dashboard
/admin/dashboard  仪表盘
/admin/dramas     短剧管理
/admin/episodes   剧集配置
/admin/analyze    AI 高光识别
/admin/highlights 高光审核发布
```

访问 `/admin/*` 时需要路由保护：本地有 access token 才允许进入，否则跳转 `/login`。后端返回 `401/403` 时，前端清除本地 token 并跳转 `/login`。

## 3. 登录接口

最终契约以 `docs/API_CONTRACT.md` 为准。

```http
POST /api/auth/login
Content-Type: application/json
```

请求体：

```json
{
  "username": "admin",
  "password": "password"
}
```

成功响应 `data`：

```json
{
  "access_token": "jwt.access.token",
  "token_type": "Bearer",
  "expires_in": 7200,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  },
  "user_id": 1,
  "username": "admin",
  "role": "admin"
}
```

前端优先读取 `data.user`。`user_id`、`username`、`role` 是后端为了兼容当前移动端上传代码保留的扁平字段。

状态码：

```text
200 登录成功
400 请求体不合法
401 账号或密码错误 / token 非法或过期
403 已登录但角色无后台权限
500 服务端错误
```

## 4. 当前用户接口

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

成功响应结构与登录接口一致，会返回一个新的 access token。

## 5. 登出接口

第一版没有 refresh token 和服务端 token 黑名单，因此登出接口只用于流程对齐，真正的退出动作由前端清除本地 token 完成。

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

响应 `data`：

```json
{
  "revoked": false
}
```

## 6. 前端模块

当前已实现：

```text
src/pages/LoginPage.jsx       登录表单，调用 /api/auth/login
src/auth.js                   localStorage 登录态读写
src/services/apiClient.js     Axios 实例，自动注入 Bearer token
src/services/authApi.js       login/logout API 封装
src/App.jsx                   /admin/* 路由保护
```

`apiClient.js` 行为：

```text
请求前：读取本地 access token，写入 Authorization
响应后：遇到 401/403，清理本地登录态并跳转 /login
```

## 7. 后端模块

当前后端已经提供：

```text
user_account 数据表
/api/auth/login
/api/auth/me
/api/auth/logout
/api/auth/admin/users
password hash 工具
JWT sign / verify 工具
require_admin 依赖
```

后台 API 安全边界在后端：只有 `role=admin` 的 Bearer token 或合法 `X-Admin-Token` 能通过 `require_admin`。

## 8. 当前状态

当前 `/login` 已接入真实后端 JWT 登录，不再写入开发占位 token。`/admin/*` 已有工作台布局和路由守卫，但各业务页面仍是占位页，后续需要继续接入短剧、剧集、AI 分析、高光审核和看板接口。
