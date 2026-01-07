# AIGC Media Hub 桌面应用打包说明

## 📦 打包方案概述

本项目使用 Electron + Next.js 实现桌面应用打包，支持生成 Windows 绿色版可执行文件（无需安装，直接运行）。

## 🔧 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Windows 10/11 (用于打包 Windows 应用)

## 📋 打包步骤

### 1. 安装依赖

首次打包前，确保已安装所有依赖：

```bash
npm install
```

### 2. 开发模式测试

在打包前，建议先在 Electron 开发模式下测试应用：

```bash
# 启动 Next.js 开发服务器和 Electron
npm run electron:dev
```

这将同时启动 Next.js 开发服务器和 Electron 窗口，可以实时查看应用效果。

### 3. 执行打包

运行打包命令：

```bash
npm run electron:pack
```

打包过程包括：

1. 清理旧的构建文件
2. 构建 Next.js 应用（`.next` 目录）
3. 复制必要的资源文件（数据库、插件等）
4. 使用 Electron Builder 打包为绿色版 exe

> **注意**：打包后的应用会在运行时启动一个本地 Next.js 服务器（端口 3000），以保留所有 API 路由功能。

### 4. 获取打包结果

打包完成后，在 `dist` 目录下找到生成的文件：

```
dist/
  └── AIGCMediaHub1.0_x64.exe  (绿色版可执行文件)
```

## 🎯 绿色版特性

### 便携性

- **无需安装**：双击 exe 文件即可运行
- **数据独立**：用户数据存储在 exe 同级的 `user_data` 目录
- **完全便携**：可以将整个应用文件夹复制到任何位置或 U 盘

### 数据存储结构

```
AIGCMediaHub1.0_x64.exe
user_data/
  ├── user_data.db          (用户数据库)
  ├── .cache/               (缩略图缓存)
  └── plugins/              (AI 插件)
```

## 🔍 应用图标

默认情况下，应用使用 Electron 默认图标。如需自定义图标：

1. 准备一个 256x256 或更高分辨率的 PNG 图片
2. 使用在线工具转换为 ICO 格式（推荐：https://convertio.co/png-ico/）
3. 将生成的 `icon.ico` 文件放置在 `build/` 目录下
4. 重新执行打包命令

## 🐛 常见问题

### Q: 打包失败，提示找不到模块

A: 确保已运行 `npm install` 安装所有依赖

### Q: 打包后的 exe 文件无法运行

A: 检查是否有杀毒软件拦截，尝试添加信任

### Q: 应用启动后界面空白

A: 检查 `out` 目录是否正确生成了静态文件

### Q: 数据库文件在哪里？

A: 绿色版模式下，数据库位于 exe 同级的 `user_data/user_data.db`

### Q: 如何更新应用？

A: 直接替换 exe 文件即可，用户数据会保留在 `user_data` 目录中

## 📝 开发说明

### 项目结构

```
AIGC-Media-HUB/
├── electron/              # Electron 主进程和预加载脚本
│   ├── main.js           # 主进程入口
│   └── preload.js        # 预加载脚本
├── scripts/              # 构建脚本
│   └── build-electron.js # 自动化打包脚本
├── build/                # 构建资源
│   └── icon.ico          # 应用图标（可选）
├── src/                  # Next.js 源代码
├── .next/                # Next.js 构建输出（构建时生成）
├── dist/                 # Electron 打包输出（构建时生成）
├── electron-builder.json # Electron Builder 配置
├── next.config.mjs       # Next.js 配置
└── package.json          # 项目配置
```

### 关键配置

#### next.config.mjs

- `reactCompiler: true`：启用 React 编译器优化
- `reactStrictMode: false`：禁用严格模式以兼容某些库

#### electron-builder.json

- `target: "portable"`：生成绿色版 exe
- `artifactName`：自定义输出文件名
- `files`：包含 `.next` 目录和所有必要文件

### 脚本说明

- `npm run dev`：启动 Next.js 开发服务器
- `npm run electron:dev`：启动 Electron 开发模式
- `npm run electron:build`：仅构建 Next.js 静态文件
- `npm run electron:pack`：完整打包流程

## 🚀 发布流程

1. 更新 `package.json` 中的版本号
2. 执行打包命令：`npm run electron:pack`
3. 测试生成的 exe 文件
4. 将 `dist/AIGCMediaHub1.0_x64.exe` 分发给用户

## 📄 许可证

本项目遵循项目根目录的许可证协议。
