# expo-bbase

Expo SDK 54+ 脚手架 CLI 工具，支持交互式选择功能模块一键生成 React Native 项目。

## 快速开始

```bash
npx expo-bbase my-app
```

## 功能特性

- ✅ 交互式模块选择
- ✅ Expo SDK 54 + Expo Router v5
- ✅ NativeWind v4 (Tailwind CSS)
- ✅ TypeScript 开箱即用
- ✅ 20+ 可选功能模块

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
| Facebook 登录 | expo-facebook |
| Apple 登录 | expo-apple-authentication |
| WebView 容器 | react-native-webview + JS Bridge |
| 多语言 | i18next + react-i18next |
| 动画/手势 | Reanimated 3 + Gesture Handler |

### P2 扩展模块
| 模块 | 说明 |
|------|------|
| OTA 更新 | expo-updates |
| 应用内通知 | expo-notifications + 自定义组件 |
| 用户权限管理 | 权限请求/检查封装 |
| Bottom Sheet | @gorhom/bottom-sheet |
| FlashList | @shopify/flash-list |
| reactnative.reusables UI | 预置 UI 组件 |

## 使用示例

```bash
# 创建项目
npx expo-bbase my-awesome-app

# 进入项目目录
cd my-awesome-app

# 启动开发服务器
npx expo start
```

## CLI 选项

```bash
npx expo-bbase <project-name>    # 创建新项目
npx expo-bbase create <name>     # 等同于上面的命令
npx expo-bbase --version         # 显示版本号
npx expo-bbase --help            # 显示帮助信息
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build
```

## 项目结构（生成项目）

```
my-app/
├── app/                    # Expo Router 页面
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── explore.tsx
│   └── +not-found.tsx
├── src/
│   ├── api/               # 网络请求 (可选)
│   ├── stores/            # 状态管理 (可选)
│   ├── storage/           # 本地存储 (可选)
│   ├── modules/           # 功能模块 (可选)
│   ├── components/        # 公共组件
│   ├── hooks/             # 自定义 Hooks
│   ├── constants/         # 常量
│   └── types/             # 类型定义
├── assets/                # 静态资源
├── app.json               # Expo 配置
├── babel.config.js        # Babel 配置
├── metro.config.js        # Metro 配置
├── tailwind.config.js     # Tailwind 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖
```

## License

MIT
