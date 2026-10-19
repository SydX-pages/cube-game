# Cube Game

一个基于 **Tauri + React + Three.js** 的 3D 魔方小游戏，支持鼠标/键盘操作，并可通过 **MediaPipe** 摄像头手势识别来控制魔方。

## 功能

- 任意阶魔方（默认 2\~5 阶预设，也可自定义 2\~10 阶）
- 3D 视角：拖拽旋转、滚轮缩放
- 观察（view）/ 旋转（rotate）双模式
- 层高亮与选中提示
- 可开关的坐标轴辅助
- 手势识别：用摄像头比手势即可切换模式、旋转层
- 界面字号可调（小 / 中 / 大）

## 操作

### 键盘

| 按键                     | 作用                               |
| ------------------------ | ---------------------------------- |
| `R`                      | 进入 rotate 旋转模式               |
| `V` / `Esc`              | 返回 view 观察模式                 |
| 方向键 / `W` `A` `S` `D` | view：选择层；rotate：旋转选中的层 |
| 鼠标拖拽                 | 旋转视角                           |
| 滚轮                     | 缩放                               |

### 手势

| 手势                | 作用                                    |
| ------------------- | --------------------------------------- |
| 比「1」（食指朝上） | 切换到观察模式                          |
| 比「2」（剪刀手）   | 切换到旋转模式                          |
| 拇指向上            | 正向操作（view 下选层 / rotate 下旋转） |
| 拇指向下            | 反向操作                                |

手势操作限流为约每 1 秒最多触发一次（见 `src/Gesture.jsx` 的 `TRIGGER_INTERVAL`）。

## 技术栈

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Three.js](https://threejs.org/) — 3D 渲染
- [MediaPipe Tasks Vision](https://developers.google.com/mediapipe) — 手势识别
- [Tauri](https://tauri.app/) — 桌面打包（底层 WebKitGTK / WebView2）

## 环境要求

- **Node.js ≥ 20.12**（Vite 8 需要，建议 22/24）
- [Rust](https://www.rust-lang.org/tools/install) 工具链
- 各平台 Tauri 系统依赖：<https://tauri.app/start/prerequisites/>

### Linux 额外依赖（摄像头手势识别）

手势识别依赖 GStreamer，WebKitGTK 通过它枚举摄像头，务必安装：

```bash
# Arch
sudo pacman -S gst-plugins-base gst-plugins-good

# Debian / Ubuntu
sudo apt install libgstreamer1.0-0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good
```

验证能否看到摄像头：

```bash
gst-device-monitor-1.0 Video | grep -i source
```

## 开发

```bash
npm install

# 仅前端（浏览器，地址 http://127.0.0.1:1420）
npm run dev

# 桌面端
npm run tauri dev
```

## 打包

```bash
# 当前平台
npm run tauri build

```

产物位于 `src-tauri/target/release/bundle/`：

- Linux：`appimage/`、`deb/`、`rpm/`
- Windows：`nsis/`、`msi/`

> Windows 需在 Windows 机器上打包（Tauri 无法从 Linux 交叉编译）。

## 项目结构

```
src/
  App.jsx      界面、控制面板与状态管理
  App.css      样式
  Cube.js      魔方 3D 逻辑（Three.js）
  Gesture.jsx  MediaPipe 手势识别
  main.jsx     入口
src-tauri/
  src/lib.rs          Tauri 入口，注册 Linux 媒体权限
  src/linux_media.rs  启用 WebKitGTK 的 getUserMedia
  src/main.rs         平台环境变量（X11 / GStreamer 插件路径）
```

## 说明

- 手势识别默认在 CPU 上运行，并限流到约 10 FPS，以尽量减少对 3D 渲染的影响。
- 首次启动手势识别会有一次模型预热卡顿，属正常现象。
