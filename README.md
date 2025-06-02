# MyLifeAsAnEngineer

一个工程师人生模拟游戏，支持CLI和Web两种游戏方式。

## 快速开始

### 安装依赖
```bash
npm run install:all
```

### 运行游戏

**CLI版本（命令行）：**
```bash
npm run start:cli
```

**Web版本（浏览器）：**
```bash
npm run start:web
```

### 开发模式

**CLI开发：**
```bash
npm run dev:cli
```

**Web开发：**
```bash
npm run dev:web
```

## 构建说明

详细的构建和编译说明请参考：[BUILD.md](BUILD.md)

项目提供4种清晰的编译行为：
- `npm run build:backend` - 编译后端
- `npm run build:cli` - 编译CLI前端  
- `npm run build:web-frontend` - 编译Web前端
- `npm run build:web` - **编译Web完整版本（推荐）**