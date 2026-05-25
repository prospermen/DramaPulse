# IgniteNow 交付包

## 文件清单

| 文件 | 说明 |
|---|---|
| `ignitenow-admin-web-dist.zip` | 管理后台 Web 构建产物 |
| `ignitenow-mobile-web-demo.zip` | Flutter Web 播放端构建产物 |
| `ignitenow-demo-screenshots.zip` | 演示截图素材 |
| `ignitenow-app-release.apk` | Android release APK |

## 运行方式

一键启动：

```powershell
powershell -ExecutionPolicy Bypass -File artifacts/delivery/start_demo.ps1
```

访问：

- 后端健康检查：`http://127.0.0.1:8000/health`
- 管理后台：`http://127.0.0.1:5173`
- 播放端：`http://127.0.0.1:62880`

停止：

```powershell
powershell -ExecutionPolicy Bypass -File artifacts/delivery/stop_demo.ps1
```

## 验收命令

```powershell
python backend/scripts/verify_demo_chain.py
```

APK 已包含在交付包内。重新构建命令：

```powershell
cd mobile
flutter build apk --release --dart-define=API_BASE_URL=http://10.0.2.2:8000
```
