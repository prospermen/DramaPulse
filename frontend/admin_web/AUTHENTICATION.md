# IgniteNow Admin Web JWT 认证方案

本文只记录管理后台采用 JWT 的登录认证方案。固定 `X-Admin-Token`、Session Cookie 等其它方案不作为当前前端设计目标。

## 1. 目标

管理后台需要通过账号密码登录，登录成功后由后端签发 JWT。前端保存 JWT，并在后续后台 API 请求中携带该 token。后端在进入具体业务函数之前先校验 JWT，校验通过后再返回 JSON 数据给前端渲染。

完整链路：

```text
打开 /login
→ 输入账号和密码
→ POST /api/admin/auth/login
→ 后端校验账号和密码 hash
→ 后端签发 access_token
→ 前端保存 access_token
→ 跳转 /admin/dashboard
→ 后续请求携带 Authorization: Bearer <access_token>
→ 后端校验 JWT 签名、过期时间和用户状态
→ 通过后调用对应业务接口函数
→ 返回 JSON
→ 前端渲染页面
```

## 2. 前端路由

建议路由结构：

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

访问 `/admin/*` 时需要路由保护：

```text
有 access_token
→ 允许进入

无 access_token
→ 跳转 /login
```

如果后端返回 `401 Unauthorized`，前端应清除本地 token 并跳转 `/login`。

## 3. 登录接口

后端契约拉取前，以下为前端建议契约，最终以 `docs/API_CONTRACT.md` 为准。

```http
POST /api/admin/auth/login
Content-Type: application/json
```

请求体：

```json
{
  "username": "admin",
  "password": "password"
}
```

成功响应：

```json
{
  "access_token": "jwt.access.token",
  "token_type": "Bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

失败响应：

```json
{
  "detail": "Invalid username or password"
}
```

状态码建议：

```text
200 登录成功
400 请求体不合法
401 账号或密码错误
403 用户被禁用或无后台权限
500 服务端错误
```

## 4. 当前用户接口

用于刷新页面后恢复用户信息，或验证 token 是否仍然有效。

```http
GET /api/admin/auth/me
Authorization: Bearer <access_token>
```

成功响应：

```json
{
  "id": 1,
  "username": "admin",
  "role": "admin"
}
```

失败响应：

```text
401 Unauthorized
```

## 5. 登出接口

如果第一阶段只使用短期 access token，登出可以先由前端清除本地 token 完成。

如果后端支持 token 吊销或 refresh token，则建议提供：

```http
POST /api/admin/auth/logout
Authorization: Bearer <access_token>
```

第一阶段可选，最终以后端契约为准。

## 6. 请求头规范

所有后台 API 请求统一携带：

```http
Authorization: Bearer <access_token>
```

示例：

```http
GET /api/admin/dramas
Authorization: Bearer jwt.access.token
```

后端处理顺序：

```text
读取 Authorization
→ 确认 Bearer 格式
→ 解析 JWT
→ 校验签名
→ 校验 exp
→ 校验用户状态和角色
→ 通过后调用具体业务函数
```

## 7. JWT 内容

JWT payload 只放必要信息，避免放敏感数据。

建议字段：

```json
{
  "sub": "1",
  "username": "admin",
  "role": "admin",
  "iat": 1760000000,
  "exp": 1760001800
}
```

字段说明：

- `sub`: 用户 ID，建议字符串。
- `username`: 用户名，用于前端展示和日志。
- `role`: 用户角色。
- `iat`: 签发时间。
- `exp`: 过期时间。

## 8. Token 存储

第一阶段建议：

```text
access_token 存 localStorage
```

原因：

- 实现简单。
- 适合当前管理后台 MVP。
- 方便 Axios 拦截器统一读取。

风险：

- localStorage 可被 XSS 脚本读取。
- 后续需要加强 CSP、输入过滤和依赖安全。

后续成熟版本可以改为：

```text
access_token 放内存
refresh_token 放 HttpOnly Cookie
```

但该方案需要后端刷新接口、Cookie 跨域配置和 CSRF 策略配合，不作为当前第一阶段目标。

## 9. 前端模块建议

建议新增：

```text
src/pages/LoginPage.jsx
src/auth/tokenStorage.js
src/auth/ProtectedRoute.jsx
src/services/apiClient.js
```

职责：

```text
LoginPage.jsx
→ 渲染登录表单，调用登录接口

tokenStorage.js
→ getToken / setToken / clearToken

ProtectedRoute.jsx
→ 保护 /admin/* 路由

apiClient.js
→ Axios 实例，自动添加 Authorization
→ 响应 401 时清理 token 并跳转 /login
```

## 10. 后端模块建议

建议后端提供：

```text
admin_user 数据表
auth router
password hash 工具
JWT sign / verify 工具
admin auth dependency / middleware
```

后台接口依赖认证：

```text
/api/admin/*
→ require_admin_user
→ 校验 JWT
→ 注入 current_user
→ 调用业务 service
```

密码存储要求：

```text
禁止明文密码
使用 bcrypt 或 argon2
只保存 password_hash
```

## 11. 角色权限

第一阶段可以只支持：

```text
admin
```

后续可扩展：

```text
admin      全部权限
operator   内容管理和审核
viewer     只读看板
```

权限判断应在后端执行，前端只做展示控制，不能作为安全边界。

## 12. 当前前端状态

当前已建立 `/login` 页面入口、表单 UI 和前端路由保护闭环。由于后端 JWT 契约尚未拉取，登录提交暂不调用真实接口，后续接入时需要以 `docs/API_CONTRACT.md` 中的认证接口为准。

当前临时行为：

```text
点击入口页“进入工作台”
→ 跳转 /login
→ 提交登录表单
→ 写入开发占位 access token
→ 写入表单中的 username，用于工作台头像展示
→ 跳转 /admin/dashboard
```

直接访问 `/admin/*` 时，如果本地没有 access token，会重定向到 `/login`。工作台侧栏头像菜单中的“退出登录”会清除本地 access token 和 username，并返回 `/login`。后续接入后端 JWT 时，应删除开发占位 token，改为保存登录接口返回的真实 `access_token` 和用户信息。
