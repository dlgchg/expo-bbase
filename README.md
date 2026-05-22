# expo-bbase

Expo SDK 54+ 脚手架 CLI 工具，支持交互式选择功能模块和 UI 模板一键生成 React Native 项目。

## 快速开始

```bash
npx expo-bbase my-app
```

创建项目时，你将看到两步交互选择：

1. **UI 模板选择** — 选择项目初始页面结构
2. **功能模块选择** — 选择需要的功能模块

## UI 模板

### Login + Tabs（推荐）

开箱即用的完整 UI 结构，基于 [reactnative.reusables](https://reactnativereusables.com/) 组件：

- 🔐 **登录页** — SignInForm 组件（Card + Input + Label + Button + Separator）
- 🏠 **Home Tab** — Button 全变体展示（default/secondary/destructive/outline/ghost/link）+ AlertDialog 演示
- 📋 **List Tab** — Card 列表展示
- 👤 **Mine Tab** — 用户信息 Card + Sign Out 退出按钮

### Default

最基础的 Home + Explore 双 Tab 布局，适合从零开始自定义 UI。

## 可选模块

### P0 核心模块（默认选中）
| 模块 | 说明 |
|------|------|
| 网络请求 | TanStack Query 封装，统一拦截器、错误处理 |
| 状态管理 | Zustand stores 模板，persist 中间件 |
| 本地存储 | MMKV 封装，类型安全 API |

### P1 功能模块
| 模块 | 说明 |
|------|------|
| Apple/iOS 支付 | react-native-iap 封装 |
| 表单验证 | React Hook Form + Zod |
| 图片 | expo-image 封装 |
| 视频 | expo-av 封装 |
| Google 登录 | @react-native-google-signin/google-signin |
| Facebook 登录 | expo-auth-session 封装（SDK 54 不再支持 expo-facebook） |
| Apple 登录 | expo-apple-authentication |
| WebView 容器 | react-native-webview + JS Bridge |
| 多语言 | i18next + react-i18next |
| 动画/手势 | Reanimated 4 + Gesture Handler + Worklets |

### P2 扩展模块
| 模块 | 说明 |
|------|------|
| OTA 更新 | expo-updates |
| 应用内通知 | expo-notifications + 自定义组件 |
| 用户权限管理 | 权限请求/检查封装 |
| Bottom Sheet | @gorhom/bottom-sheet |
| FlashList | @shopify/flash-list |
| reactnative.reusables UI | 官方 rnr 组件（Button, Text, Input, Label, Card, Separator, AlertDialog） |

## CLI 命令

```bash
# 创建新项目（交互式选择 UI 模板 + 模块）
npx expo-bbase <project-name>
npx expo-bbase create <name>       # 同上

# 在已有项目中增量升级模块文件和依赖
npx expo-bbase upgrade [path]      # path 默认为当前目录

# 在已有项目中添加新模块
npx expo-bbase add [path]          # 交互式选择要添加的模块
npx expo-bbase add [path] -m network,state  # 指定模块 ID

npx expo-bbase --version           # 显示版本号
npx expo-bbase --help              # 显示帮助信息
```

## 使用示例

### 创建 Login + Tabs 项目

```bash
npx expo-bbase my-awesome-app
# → 选择 "Login + Tabs" 模板
# → 选择功能模块
# → cd my-awesome-app
# → npx expo start
# → App 启动后显示登录页，登录后进入 3 Tab 主页
```

### 创建默认项目

```bash
npx expo-bbase my-awesome-app
# → 选择 "Default" 模板
# → 选择功能模块
# → cd my-awesome-app
# → npx expo start
```

### 增量升级

```bash
# 在 expo-bbase 创建的项目目录下
cd my-awesome-app
npx expo-bbase upgrade
# → 自动读取 .expo-bbase.json，更新所有已安装模块的文件和依赖
```

### 添加新模块

```bash
cd my-awesome-app
npx expo-bbase add
# → 交互式选择要添加的模块（已安装的模块不会出现）

# 或直接指定模块
npx expo-bbase add . -m bottom-sheet,flashlist
```

## 技术栈

生成的项目默认包含：

- **Expo SDK 54** + New Architecture
- **Expo Router v5** — 文件路由
- **NativeWind v4** — Tailwind CSS for React Native
- **TypeScript** — 类型安全 + `@/*` 路径别名
- **react-native-svg** — SVG 支持
- **Reanimated 4 + Gesture Handler + Worklets** — 动画/手势（默认包含，不再需要单独选）
- **assets/** — 默认图标 + Nunito-Bold 字体

所有依赖版本与 Expo SDK 54 的 `bundledNativeModules.json` 对齐。

## 项目结构（Login + Tabs 模板）

```
my-app/
├── app/                          # Expo Router 页面
│   ├── _layout.tsx               # 根布局 (Stack)
│   ├── login.tsx                  # 登录页
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab 布局 (Home/List/Mine)
│   │   ├── home.tsx              # Button & AlertDialog 展示
│   │   ├── list.tsx              # Card 列表
│   │   └── mine.tsx              # 个人中心 + 退出
│   └── +not-found.tsx
├── api/                          # 网络请求 (可选)
├── stores/                       # 状态管理 (可选)
├── storage/                      # 本地存储 (可选)
├── components/
│   ├── ui/                       # rnr UI 组件
│   │   ├── button.tsx
│   │   ├── text.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── card.tsx
│   │   ├── separator.tsx
│   │   └── alert-dialog.tsx
│   ├── SignInForm.tsx            # 登录表单
│   ├── Themed.tsx                # 主题组件
│   └── HelloWave.tsx             # 示例组件
├── lib/
│   └── utils.ts                  # cn() 工具函数
├── modules/                      # 功能模块 (可选)
│   ├── animation/
│   ├── form/
│   ├── i18n/
│   ├── media/
│   ├── notification/
│   ├── payment/
│   ├── permission/
│   ├── webview/
│   └── auth/
│       ├── apple.ts
│       ├── facebook.ts
│       └── google.ts
├── hooks/                        # 自定义 Hooks
├── constants/                    # 常量
├── types/                        # 类型定义
├── global.css                    # NativeWind CSS 变量 (light/dark)
├── assets/                       # 静态资源
│   ├── icon.png                  # App 图标
│   ├── adaptive-icon.png         # Android 自适应图标
│   ├── splash-icon.png           # 启动画面
│   ├── favicon.png               # Web favicon
│   └── fonts/
│       └── Nunito-Bold.ttf       # 默认字体
├── app.json                      # Expo 配置
├── babel.config.js               # Babel 配置 (NativeWind + Reanimated)
├── metro.config.js               # Metro 配置 (withNativeWind)
├── tailwind.config.js            # Tailwind 配置 (rnr 色板变量)
├── tsconfig.json                 # TypeScript 配置
├── .expo-bbase.json              # CLI 状态文件
└── package.json                  # 项目依赖
```

## 配置文件

### `.expo-bbase.json`

每个由 expo-bbase 创建的项目根目录下会生成此文件，记录已安装的模块和 CLI 版本：

```json
{
  "projectName": "my-app",
  "selectedModules": ["network", "state", "ui-reusables"],
  "cliVersion": "1.3.4",
  "uiTemplate": "login-tabs"
}
```

`upgrade` 和 `add` 命令依赖此文件判断项目状态。

## 开发

```bash
# 克隆仓库
git clone https://github.com/dlgchg/expo-bbase.git
cd expo-bbase

# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build
```

## License

MIT

## 更新日志

### v1.4.0
- 🔧 **动画依赖默认包含**：`react-native-reanimated`、`react-native-worklets`、`react-native-gesture-handler` 加入基础依赖，不再需要用户单独选择，彻底解决 `Cannot find module 'react-native-worklets/plugin'` 报错
- 🖼️ **assets 目录内置**：自动生成 `assets/` 目录（icon.png、adaptive-icon.png、splash-icon.png、favicon.png、fonts/Nunito-Bold.ttf），app.json 恢复图标引用
- ⚙️ **tsconfig.json 升级**：继承 `expo/tsconfig.base`，`@/*` 路径别名开箱即用
- 🔧 **babel.config.js 简化**：移除 `reanimated: false, worklets: false` 禁用标志（因包已默认安装）

### v1.3.5
- 🔧 **修复 Facebook 登录模块**：移除已废弃的 `expo-facebook`（SDK 54 不再包含），改用 `expo-auth-session` + `expo-web-browser` 实现 Facebook OAuth 登录

### v1.3.4
- 🔧 **目录结构修复**：去除 `src/` 层，模块文件（`modules/`、`api/`、`stores/` 等）与 `app/` 平级
- 📝 修正 Facebook 登录模块描述（SDK 54 不再支持 `expo-facebook`，改用 `expo-auth-session`）

### v1.3.3
- 🔧 修复 `react-native-worklets` 版本前缀（`0.5.1` → `~0.5.1`）

### v1.3.2
- 🔧 修复 babel-preset-expo 自动检测 worklets/reanimated plugin 的问题
- 未选 animation 模块时显式禁用 `reanimated: false, worklets: false`

### v1.3.0
- ✨ 新增 UI 模板选择（Login + Tabs / Default）
- ✨ 集成 reactnative.reusables 官方组件
- ✨ 新增 `upgrade` 和 `add` 命令
