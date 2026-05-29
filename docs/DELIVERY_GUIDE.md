# IgniteNow 交付物准备指南

## 推荐交付形态

当前阶段优先交付 Web 演示包：

- 后端使用当前仓库 `backend/ignitenow.db` 中已发布的 `那年冬至` E001-E007 演示数据。
- 管理后台使用 `frontend/admin_web/dist` 产物。
- 播放端使用 `mobile/build/web` 产物，默认请求 `http://localhost:8000`。
- APK 已完成构建，产物位于 `artifacts/delivery/ignitenow-app-release.apk`。

## 本地演示启动

### 1. 后端

```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

验证：

```powershell
python backend/scripts/verify_demo_chain.py
```

### 2. 管理后台 Web 包

```powershell
cd frontend/admin_web
npm install
npm run build
python -m http.server 5173 -d dist
```

访问：

```text
http://localhost:5173
```

### 3. Flutter Web 播放端包

```powershell
cd mobile
flutter pub get
flutter build web --dart-define=API_BASE_URL=http://localhost:8000
python -m http.server 62880 -d build/web
```

访问：

```text
http://localhost:62880
```

也可以在仓库根目录使用交付目录中的一键启动脚本：

```powershell
powershell -ExecutionPolicy Bypass -File artifacts/delivery/start_demo.ps1
```

停止：

```powershell
powershell -ExecutionPolicy Bypass -File artifacts/delivery/stop_demo.ps1
```

## 已打包交付物

交付物统一放在 `artifacts/delivery/`：

| 文件 | 用途 |
|---|---|
| `ignitenow-admin-web-dist.zip` | 管理后台生产构建产物 |
| `ignitenow-mobile-web-demo.zip` | Flutter Web 播放端生产构建产物 |
| `ignitenow-demo-screenshots.zip` | 演示截图素材包 |
| `ignitenow-app-release.apk` | Android release APK，默认请求 `http://10.0.2.2:8000` |
| `start_demo.ps1` / `stop_demo.ps1` | 一键启动 / 停止本地 Web 演示服务 |
| `README.md` | 交付包运行说明和清单 |

## APK 打包

目标命令：

```powershell
cd mobile
flutter build apk --release --dart-define=API_BASE_URL=http://10.0.2.2:8000
```

当前机器验证结果：

- `flutter --version` 正常，版本为 Flutter 3.44.0。
- Android SDK 已配置，路径为 `C:\Users\PC\AppData\Local\Android\sdk`。
- Gradle 8.12 已从本地 `E:\gradle-8.12-all\gradle-8.12` 写入 wrapper 缓存。
- 为降低 Maven 访问超时风险，Android Gradle 配置已增加阿里云 `google` / `central` / `gradle-plugin` 镜像源，并保留官方源兜底。
- `flutter build apk --release --dart-define=API_BASE_URL=http://10.0.2.2:8000` 已产出 APK。

真机演示时建议改为局域网地址：

```powershell
flutter build apk --release --dart-define=API_BASE_URL=http://<电脑局域网IP>:8000
```

## 截图与录屏脚本

建议录屏顺序控制在 60-90 秒：

1. 打开管理后台，看 dashboard 指标和已发布高光数量。
2. 切到高光审核页，展示高光时间点、类型、按钮文案和 published 状态。
3. 打开 Flutter Web 播放端，选择 `那年冬至` 的 E001 或 E002。
4. 播放跳到首个高光时间点，展示互动浮层。
5. 点击互动按钮，展示反馈动效。
6. 回到管理后台刷新，展示互动数或点击率变化。

截图至少保留：

- 管理后台 dashboard。
- 高光审核列表。
- 播放端剧集入口页。
- 播放页视频加载状态。
- 高光互动浮层触发前后。

## 交付前验收

每次重新打包前至少运行：

```powershell
python backend/scripts/verify_demo_chain.py
python -m compileall backend ai_service
cd frontend/admin_web; npm run build
cd ../../mobile; flutter analyze
flutter build web --dart-define=API_BASE_URL=http://localhost:8000
```

如果本地视频文件不在当前机器上，可临时跳过 Range 检查：

```powershell
python backend/scripts/verify_demo_chain.py --skip-video-range
```
