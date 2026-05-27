# IgniteNow Admin Web 登录认证说明

本文记录管理后台登录认证的基本原理、前后端联动方式，以及 IgniteNow 当前阶段建议采用的实现路径。

## 1. 登录认证解决什么问题

登录认证主要回答两个问题：

- 用户是谁。
- 后端如何确认后续请求仍然来自这个已认证用户。

对 IgniteNow 管理后台来说，典型链路是：

```text
进入 /admin
→ 前端检查是否已有登录态
→ 未登录则跳转 /login
→ 用户输入凭证
→ 前端调用后端登录接口
→ 后端校验凭证
→ 后端发放登录凭证
→ 前端保存凭证
→ 后续后台 API 请求自动携带凭证
→ 后端每次校验凭证
```

## 2. 当前 MVP 建议方案

当前项目文档已经约定管理后台写接口需要校验 `X-Admin-Token`。因此 MVP 阶段建议先做轻量登录页：

```text
/login 输入 Admin Token
→ 保存到 localStorage
→ 进入 /admin/dashboard
→ Axios 请求拦截器自动携带 X-Admin-Token
→ 后端对管理接口统一校验 token
```

请求示例：

```http
GET /api/dramas
X-Admin-Token: your-admin-token
```

后端可以先使用环境变量中的 `ADMIN_TOKEN` 做比对：

```text
请求头 X-Admin-Token 存在且等于 ADMIN_TOKEN
→ 放行

否则
→ 返回 401 Unauthorized
```

该方案适合当前 MVP 演示阶段，优点是简单、稳定、容易串通完整链路。缺点是没有真实用户体系、角色权限、过期时间和刷新机制。

## 3. 前端需要做什么

MVP 登录页需要这些模块：

- `/login` 页面：输入管理 token。
- 登录态存储：例如 `localStorage` 保存 `admin_token`。
- 路由保护：访问 `/admin/*` 时检查是否有 token，没有则跳转 `/login`。
- API client：统一 Axios 实例，请求拦截器自动写入 `X-Admin-Token`。
- 401 处理：后端返回 401 时清除本地 token，并跳转 `/login`。
- 退出登录：清除 token，回到 `/login` 或入口页。

推荐前端流程：

```text
打开 /admin
→ ProtectedRoute 检查 admin_token
→ 没有 token：Navigate 到 /login
→ 输入 token 并提交
→ 保存 token
→ 跳转 /admin/dashboard
```

## 4. 后端需要做什么

MVP 阶段后端可以不做账号密码登录，只提供统一 token 校验能力：

```text
读取请求头 X-Admin-Token
→ 与环境变量 ADMIN_TOKEN 对比
→ 通过则继续处理请求
→ 失败则返回 401
```

后续如果要验证 token 是否有效，也可以提供一个轻量接口：

```http
GET /api/admin/auth/me
X-Admin-Token: your-admin-token
```

返回示例：

```json
{
  "role": "admin",
  "authenticated": true
}
```

注意：如果新增该接口，需要同步更新 `docs/API_CONTRACT.md`。

## 5. 成熟系统常见做法

### 5.1 JWT Token

成熟的前后端分离系统常使用 JWT：

```text
用户提交账号密码
→ 后端校验密码 hash
→ 后端签发 access token
→ 前端保存 token
→ 后续请求携带 Authorization: Bearer <token>
→ 后端验证签名、过期时间和权限
```

常见请求头：

```http
Authorization: Bearer access_token
```

优点：

- 后端不需要保存 session。
- 适合前后端分离和多端访问。

缺点：

- token 泄露后，在过期前可能被继续使用。
- 需要设计刷新、吊销和过期处理。

### 5.2 Session + HttpOnly Cookie

另一种成熟方案是 Session + Cookie：

```text
用户提交账号密码
→ 后端创建 session
→ 浏览器保存 HttpOnly Cookie
→ 后续请求自动携带 Cookie
→ 后端根据 session id 查用户
```

优点：

- HttpOnly Cookie 不能被前端 JS 直接读取，安全性更好。
- 服务端可主动销毁 session。

缺点：

- 后端需要维护 session 状态。
- 跨域、SameSite、CSRF 等配置更复杂。

## 6. 成熟后台通常还需要什么

完整后台登录认证一般包括：

- 用户表。
- 密码 hash 存储，禁止明文密码。
- 登录接口。
- 登出接口。
- 当前用户接口 `/me`。
- access token 短有效期。
- refresh token 长有效期。
- token 刷新和吊销。
- 后端认证中间件。
- 角色和权限控制。
- 前端路由守卫。
- API 请求和响应拦截器。
- 401 自动跳转登录页。

角色示例：

```text
admin      可管理全部模块
operator   可管理内容和审核
viewer     只能查看数据
```

## 7. IgniteNow 推荐演进路径

建议分两步推进。

第一阶段：MVP Token 登录。

```text
/login 输入 Admin Token
→ localStorage 保存 token
→ /admin/* 路由保护
→ Axios 自动携带 X-Admin-Token
→ 后端统一校验 ADMIN_TOKEN
```

第二阶段：正式账号体系。

```text
账号密码登录
→ JWT 或 HttpOnly Cookie
→ /me 当前用户接口
→ 角色权限
→ token 过期和刷新
→ 登出和吊销
```

当前阶段建议先完成第一阶段，避免在业务链路还未跑通前过早引入复杂认证系统。

## 8. 后续实现提醒

实现登录页时，需要同步关注以下文件：

- `src/App.jsx`：新增 `/login` 路由和 `/admin/*` 保护。
- `src/services/apiClient.js`：封装 Axios 并自动携带 `X-Admin-Token`。
- `src/auth/` 或相近目录：封装 token 读写和登录状态判断。
- `docs/API_CONTRACT.md`：如果新增登录、登出、`/me` 等后端接口，必须同步记录。
- `docs/PROGRESS.md`：记录实际完成内容、验证方式和遗留问题。
