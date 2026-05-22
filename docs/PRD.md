# expo-bbase 产品需求文档（PRD）

## 1. 项目信息

| 字段 | 内容 |
|------|------|
| Language | 中文 |
| Programming Language | TypeScript + Expo SDK 54 |
| Project Name | expo-bbase |
| 原始需求 | 开发一个 Expo 脚手架 CLI 工具，支持 `npx expo-bbase [project-name]` 一键生成包含常用功能模块的 React Native 项目，用户可交互式选择所需模块 |

---

## 2. 产品定义

### 2.1 产品目标

1. **降低启动成本**：将 React Native + Expo 项目初始化到可开发状态的时间从数小时压缩到数分钟，消除重复的依赖安装、配置和模板编写工作
2. **模块化按需集成**：提供可交互选择的模块化功能清单，开发者只引入所需模块，避免臃肿的全量模板，保持生成项目的精简与可维护性
3. **标准化最佳实践**：每个模块内置社区验证的架构模式与封装方案（统一拦截器、错误处理、类型安全等），确保生成项目从第一天起就具备生产级代码质量

### 2.2 用户故事

1. **As a** 独立开发者，**I want to** 通过一条命令生成带有登录（Google/Facebook/Apple）和支付模块的 Expo 项目，**so that** 我可以在 5 分钟内开始业务逻辑开发而不是花两天配置基础设施

2. **As a** 初创团队技术负责人，**I want to** 在 CLI 中交互式选择团队需要的模块（如多语言、OTA 更新、网络请求封装），**so that** 生成项目不包含无用依赖，保持包体积精简

3. **As a** React Native 新手，**I want to** 脚手架生成的代码包含完整的 TypeScript 类型和示例用法，**so that** 我可以参照模板快速理解每个模块的集成方式而无需翻阅大量文档

4. **As a** 全栈工程师，**I want to** 脚手架生成的 WebView 容器已内置 JS Bridge 封装，**so that** 我可以直接复用现有 H5 页面而不必从零实现原生与 Web 的通信桥接

5. **As a** 已有 Expo 项目的开发者，**I want to** 脚手架支持选择性集成单个模块到现有项目，**so that** 我无需重建项目就能引入新功能模块

---

## 3. 技术规范

### 3.1 需求池

#### P0 — Must Have（首次发布必须包含）

| 编号 | 需求 | 说明 |
|------|------|------|
| P0-1 | CLI 核心框架 | 支持 `npx expo-bbase <project-name>` 交互式创建项目，包含项目名输入、模块选择、确认生成流程 |
| P0-2 | Expo SDK 54 + TypeScript 基础模板 | 生成符合最新 Expo 规范的 TypeScript 项目骨架，含 tsconfig、eslint、prettier 配置 |
| P0-3 | Expo Router 文件路由 | 集成 Expo Router，提供 app/ 目录结构模板（含 tabs/stack 示例布局） |
| P0-4 | NativeWind (Tailwind CSS) | 集成 NativeWind v4，含 tailwind.config 和全局样式配置 |
| P0-5 | 网络请求封装 | 基于 TanStack Query 的统一请求层，含拦截器、错误处理、请求/响应类型定义、loading 状态管理 |
| P0-6 | 状态管理模板 | Zustand stores 模板，含 persist 中间件示例、slice 模式拆分结构 |
| P0-7 | 本地存储封装 | MMKV 封装层，提供类型安全的 get/set/delete API 和加密存储选项 |
| P0-8 | 模块交互选择器 | CLI 中使用 checkbox/multiselect 让用户按需选择功能模块，未选模块不写入生成代码 |

#### P1 — Should Have（首次发布应包含）

| 编号 | 需求 | 说明 |
|------|------|------|
| P1-1 | Apple/iOS 支付集成 | react-native-iap 封装，含商品查询、购买流程、收据验证、订阅管理 |
| P1-2 | 表单验证模板 | React Hook Form + Zod schemas，含表单组件封装、统一错误提示、字段级验证示例 |
| P1-3 | 图片模块 | expo-image 封装，含缓存策略、占位图、渐进加载、错误兜底 |
| P1-4 | 视频播放模块 | expo-av 视频播放器封装，含控制栏、全屏切换、加载状态 |
| P1-5 | 登录模块（Google/Facebook/Apple） | 三方登录统一封装，含 OAuth 流程、token 管理、用户信息获取 |
| P1-6 | WebView 容器 | react-native-webview 封装，含 JS Bridge 双向通信、导航控制、加载状态 |
| P1-7 | 多语言支持 | i18next + react-i18next 集成，含语言检测、翻译文件结构、运行时切换 |
| P1-8 | 动画/手势模块 | Reanimated 3 + Gesture Handler 集成，含常用动画工具函数和手势示例 |

#### P2 — Nice to Have（后续版本迭代）

| 编号 | 需求 | 说明 |
|------|------|------|
| P2-1 | OTA 更新 | expo-updates 集成，含更新检查、下载、提示重启流程 |
| P2-2 | 应用内通知 | 本地推送通知 + in-app notification 组件 |
| P2-3 | 用户权限管理 | 权限请求/检查统一封装，含权限引导流程 |
| P2-4 | Bottom Sheet 组件 | @gorhom/bottom-screen 集成模板 |
| P2-5 | FlashList 高性能列表 | FlashList 封装，含下拉刷新、无限滚动、空状态模板 |
| P2-6 | reactnative.reusables UI 组件库 | 预置常用 UI 组件（Button、Card、Input 等） |
| P2-7 | 现有项目增量集成 | 支持向已有 Expo 项目中单独添加某个模块，无需重建整个项目 |
| P2-8 | 生成项目文档 | 自动生成 README，包含已选模块的使用说明和开发指南 |

---

### 3.2 UI/交互设计要点

#### CLI 交互流程

```
$ npx expo-bbase my-app

🚀 Welcome to expo-bbase!

? Project name: my-app
? Choose modules: (Press space to select)
  ◯ Apple/iOS Payment
  ◯ Network Request (TanStack Query)      ← 默认选中
  ● State Management (Zustand)             ← 默认选中
  ● Local Storage (MMKV)                  ← 默认选中
  ◯ Image (expo-image)
  ◯ Video Player (expo-av)
  ◯ Google Login
  ◯ Facebook Login
  ◯ Apple Login
  ◯ Form Validation (RHF + Zod)
  ◯ WebView Container
  ◯ i18n (Multi-language)
  ◯ Animation (Reanimated + Gesture)
  ◯ OTA Updates
  ◯ In-App Notifications
  ◯ Permission Management
  ◯ Bottom Sheet
  ◯ FlashList
  ◯ reactnative.reusables UI

? Generating project... ✅ Done!

Next steps:
  cd my-app
  npx expo start
```

#### 生成项目目录结构

```
my-app/
├── app/                          # Expo Router 文件路由
│   ├── _layout.tsx               # 根布局
│   ├── (tabs)/                   # Tab 导航
│   └── +not-found.tsx            # 404 页面
├── src/
│   ├── api/                     # 网络请求封装
│   │   ├── client.ts             # 请求客户端
│   │   ├── interceptors.ts       # 拦截器
│   │   └── types.ts              # 请求/响应类型
│   ├── stores/                   # Zustand 状态管理
│   │   ├── index.ts
│   │   └── slices/               # Store slices
│   ├── storage/                  # MMKV 存储封装
│   │   └── index.ts
│   ├── modules/                  # 可选功能模块
│   │   ├── auth/                 # 登录模块
│   │   ├── payment/              # 支付模块
│   │   ├── webview/              # WebView 容器
│   │   ├── i18n/                 # 多语言
│   │   ├── media/                # 图片/视频
│   │   └── animation/           # 动画/手势
│   ├── components/               # 通用组件
│   ├── hooks/                    # 自定义 Hooks
│   ├── utils/                    # 工具函数
│   └── types/                    # 全局类型定义
├── assets/                       # 静态资源
├── app.json                      # Expo 配置
├── tailwind.config.js            # NativeWind 配置
├── tsconfig.json
├── package.json
└── README.md
```

#### CLI 设计原则

- **默认选项**：网络请求、状态管理、本地存储默认选中（P0 核心模块）
- **即时反馈**：每一步操作有 spinner/进度提示
- **错误友好**：项目名冲突、网络异常等情况提供清晰提示和恢复建议
- **可跳过安装**：提供 `--skip-install` 参数跳过 npm install，适配离线/CI 场景

---

### 3.3 待确认问题

| 编号 | 问题 | 影响范围 | 建议默认值 |
|------|------|----------|-----------|
| Q1 | 登录模块是否需要支持同时集成多个第三方登录（如 Google + Apple），还是只选一个？ | 登录模块架构 | 默认支持多登录并存 |
| Q2 | 支付模块是否需要同时支持 iOS 和 Android（如 Google Play Billing）？ | 支付模块范围 | 首版仅支持 iOS，Android 支付后续迭代 |
| Q3 | CLI 工具是否需要支持模板版本管理（如指定 Expo SDK 版本）？ | CLI 设计 | 首版固定 SDK 54，后续通过 `--sdk-version` 参数支持 |
| Q4 | 生成项目是否需要包含 E2E 测试框架（如 Maestro/Detox）？ | 测试基础设施 | P2 考虑，首版不含 |
| Q5 | reactnative.reusables 组件库是否作为独立模块还是内置于基础模板？ | 包体积和依赖管理 | 独立可选模块 |
| Q6 | WebView JS Bridge 是否需要预定义通信协议，还是仅提供底层封装？ | WebView 模块复杂度 | 提供底层封装 + 一个示例协议 |
| Q7 | 是否需要支持 monorepo（Turborepo）项目结构？ | 项目结构模板 | P2 考虑，首版为标准单仓结构 |
| Q8 | 多语言模块默认支持哪些语言？翻译文件采用什么格式？ | i18n 模块 | 默认中文+英文，JSON 格式 |

---

*文档版本：v1.0 | 创建时间：2025-07-09 | 作者：Alice (Product Manager)*
