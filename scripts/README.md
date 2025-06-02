# CSV文件复制脚本说明

本目录包含用于在构建前端项目时自动复制CSV数据文件的跨平台脚本。

## 文件结构

```
scripts/
├── copy-csv.js                 # Node.js跨平台复制脚本
├── test-csv-integration.js     # 集成测试脚本
└── README.md                   # 本说明文件
```

## 功能说明

这些脚本的作用是将项目根目录的`csv/`文件夹中的所有CSV数据文件复制到前端可以访问的位置：

- **开发时**：复制到 `frontend-web/public/csv/`
- **构建时**：复制到 `frontend-web/dist/csv/`（通过Vite插件）

## 使用方法

### 通过npm scripts（推荐）

```bash
# 使用Node.js版本（跨平台兼容性最好）
npm run copy-csv

# 运行集成测试
npm run test:csv-integration
```

### 直接运行

```bash
# Node.js版本
node scripts/copy-csv.js

# 集成测试
node scripts/test-csv-integration.js
```

## 自动执行

这些脚本已经集成到项目的构建流程中：

- **开发环境**：`npm run dev:web-frontend` 和 `npm run dev:web` 会自动执行CSV复制
- **生产构建**：`npm run build:web-frontend` 和 `npm run build:web` 会自动执行CSV复制
- **Vite构建**：通过自定义Vite插件，在构建完成后自动复制CSV文件到输出目录

## 技术实现

### Node.js版本 (copy-csv.js)
- 使用Node.js的`fs`模块进行文件操作
- 递归复制整个目录结构
- 完美的跨平台兼容性（Windows、Linux、macOS）
- 提供详细的日志输出
- 包含完善的错误处理机制

### Vite插件集成
在`frontend-web/vite.config.ts`中集成了自定义插件：
- 在构建完成后自动复制CSV文件到`dist/csv/`
- 确保生产环境的部署包含最新的CSV数据

### 集成测试 (test-csv-integration.js)
- 验证所有构建场景下的CSV复制功能
- 包含文件完整性检查
- 自动化测试整个构建流程

## 路径说明

- **源路径**：`csv/`（项目根目录）
- **开发环境目标路径**：`frontend-web/public/csv/`
- **生产环境目标路径**：`frontend-web/dist/csv/`
- **前端加载路径**：`./csv/`（相对于前端应用根路径）

## 优势特性

### 跨平台兼容性
- ✅ Windows (所有终端环境)
- ✅ Linux (所有发行版)
- ✅ macOS (所有版本)
- ✅ CI/CD环境
- ✅ Docker容器

### 简单可靠
- ✅ 单一Node.js脚本，无需维护多个版本
- ✅ 使用Node.js标准库，无额外依赖
- ✅ 统一的错误处理和日志格式
- ✅ 自动创建目标目录

### 构建集成
- ✅ 开发环境自动同步
- ✅ 生产构建自动包含
- ✅ 详细的复制进度反馈
- ✅ 构建失败时的清晰错误信息

## 故障排除

### 常见问题

1. **找不到源目录**
   - 确保项目根目录存在`csv/`文件夹
   - 检查当前工作目录是否正确

2. **复制失败**
   - 检查目标目录的写入权限
   - 确保磁盘空间充足
   - 查看脚本输出的错误信息

3. **权限问题**
   - 确保Node.js有读写相应目录的权限
   - 在需要时使用管理员权限运行

### 调试模式

脚本提供详细的输出信息，包括：
- 源路径和目标路径
- 复制的文件列表
- 复制的文件总数
- 详细的错误信息和堆栈跟踪

如需更多调试信息，可以直接运行脚本文件查看完整输出。

## 为什么选择Node.js

1. **跨平台**：Node.js天然支持所有主要操作系统
2. **简单**：无需维护多个平台特定的脚本
3. **一致性**：所有环境下行为完全一致
4. **易维护**：单一代码库，减少维护成本
5. **集成友好**：与npm scripts和构建工具完美集成 