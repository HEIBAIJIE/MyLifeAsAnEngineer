# 《我的工程师生活》命令行前端

这是一个为《我的工程师生活》游戏后端设计的完整命令行前端界面，采用模块化架构，提供了丰富的游戏体验。

## 功能特性

### 🎮 游戏界面
- **美观的命令行界面**：使用Unicode字符绘制的表格和边框
- **实时状态显示**：清晰展示所有游戏属性和状态
- **智能事件分组**：按时间消耗将事件分为快速、中等、长时间行动
- **丰富的表情符号**：为不同属性配置了对应的emoji图标
- **多语言支持**：完整的中英文界面切换

### 🕹️ 操作方式
- **数字1+**：执行对应编号的事件
- **字母命令**：
  - `s` - 保存游戏
  - `l` - 读取游戏
  - `i` - 查看物品栏
  - `h` - 显示帮助
  - `q` - 退出游戏
  - `lang` - 切换语言

### 📊 状态显示
- **时间信息**：显示当前时间、星期、工作日/周末、白天/夜晚
- **基础属性**：金钱、健康、疲劳、饥饿、理性、感性、专注、心情等
- **职业属性**：专业技能、职级、项目进度、老板不满度
- **社交属性**：社交影响力、技术声誉、哲学感悟

### 🎯 事件执行
- **事件预览**：显示事件名称和预计消耗时间
- **确认机制**：执行重要事件前需要确认
- **详细反馈**：显示事件结果、属性变化、触发的临时事件等

## 安装和运行

### 前置要求
- Node.js (推荐 v16+)
- TypeScript
- ts-node

### 安装依赖
```bash
npm install
```

### 运行游戏
```bash
# 方式1：使用启动脚本（推荐）
npm start
# 或
npm run dev

# 方式2：直接运行前端
npm run frontend

# 方式3：使用ts-node
npx ts-node start-game.ts

# 方式4：如果已编译
node dist/start-game.js
```

## 架构设计

### 模块化结构
```
src/frontend/
├── controllers/
│   └── GameController.ts     # 主游戏控制器
├── components/
│   ├── GameStatusDisplay.ts  # 游戏状态显示组件
│   ├── ActionMenuDisplay.ts  # 操作菜单显示组件
│   └── EventResultDisplay.ts # 事件结果显示组件
├── services/
│   ├── GameService.ts        # 游戏服务层
│   └── LocalizationService.ts # 本地化服务
├── types.ts                  # 前端类型定义
└── index.ts                  # 前端入口点
```

### 核心组件

#### GameController
- 主游戏循环控制
- 用户输入处理
- 游戏状态管理
- 多语言支持

#### GameService
- 与后端通信的服务层
- 命令封装和响应处理
- 错误处理和重试机制

#### Display Components
- **GameStatusDisplay**: 游戏状态的格式化显示
- **ActionMenuDisplay**: 可用操作的菜单显示
- **EventResultDisplay**: 事件执行结果的展示

#### LocalizationService
- 多语言文本管理
- 动态语言切换
- 本地化资源加载

## 游戏机制说明

### 时间系统
- 每天分为48个时间单元，每个单元代表30分钟
- 游戏从周一早上7点开始
- 不同事件消耗不同的时间单元
- 周末和工作日有不同的可用事件

### 属性系统
- **理性/感性**：影响专注力消耗和事件效果
- **疲劳/饥饿**：需要通过休息和进食来恢复
- **专注力**：执行困难事件时消耗
- **职级**：影响可用的工作事件

### 场景系统
- **公司**：工作相关事件，与老板同事互动
- **商店**：购买各种物品和装备
- **家**：休息、学习、个人时间
- **公园**：锻炼、思考、放松
- **餐馆**：用餐、社交
- **医院**：治疗、健康检查

## 界面预览

```
╔══════════════════════════════════════════════════════════════╗
║                    My Life As An Engineer                    ║
║                      命令行游戏界面                          ║
╚══════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────┐
│                        游戏状态                            │
├─────────────────────────────────────────────────────────────┤
│ 时间: 07:00 周一 (工作日) (白天)                           │
│ 位置: 家                                                   │
├─────────────────────────────────────────────────────────────┤
│ 💰 金钱: 30000     ❤️  健康: 100/100     😴 疲劳: 0/100    │
│ 🍽️  饥饿: 0/100     🧠 理性: 50/100     💖 感性: 50/100   │
│ 🎯 专注: 100/100     😊 心情: 80/100    🔧 技能: 0/100     │
│ 👔 职级: 1/10     📊 项目: 0/100    😠 老板: 0/100         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      可用操作                              │
├─────────────────────────────────────────────────────────────┤
│ 快速行动 (≤1小时):                                         │
│ 1. 洗漱 (0.5小时)                                          │
│ 2. 简单早餐 (0.5小时)                                      │
├─────────────────────────────────────────────────────────────┤
│ 中等行动 (1-2.5小时):                                      │
│ 3. 阅读技术书籍 (2小时)                                    │
│ 4. 整理房间 (1.5小时)                                     │
├─────────────────────────────────────────────────────────────┤
│ 长时间行动 (>2.5小时):                                     │
│ 5. 深度学习新技术 (4小时)                                 │
├─────────────────────────────────────────────────────────────┤
│ 系统: s-保存 l-读取 i-物品 h-帮助 q-退出 lang-切换语言     │
└─────────────────────────────────────────────────────────────┘
```

## API 接口

### GameService 方法
```typescript
// 获取游戏状态
async getGameState(): Promise<GameState | null>

// 获取可用事件
async getAvailableEvents(): Promise<AvailableEvent[]>

// 执行事件
async executeEvent(eventId: number): Promise<EventResult>

// 保存游戏
async saveGame(): Promise<SaveResult | null>

// 读取游戏
async loadGame(saveData: string): Promise<boolean>

// 查看物品栏
async getInventory(): Promise<InventoryResult | null>

// 设置语言
setLanguage(language: 'zh' | 'en'): void
```

### 事件响应格式
```typescript
interface EventResult {
  success: boolean;
  game_text?: string;
  time_cost: number;
  resource_changes?: Array<{
    resource_id: number;
    resource_name: string;
    change: number;
  }>;
  temporary_events?: Array<{
    event_name: string;
    description: string;
  }>;
  scheduled_tasks?: Array<{
    task_name: string;
    description: string;
  }>;
}
```

## 开发说明

### 添加新功能
1. 在 `types.ts` 中定义新的接口
2. 在相应的 Service 中实现业务逻辑
3. 在 Component 中添加显示逻辑
4. 在 Controller 中添加用户交互处理

### 自定义显示组件
```typescript
export class CustomDisplay {
  private localization: LocalizationService;

  constructor() {
    this.localization = LocalizationService.getInstance();
  }

  displayCustomInfo(data: any): string {
    const texts = this.localization.getTexts();
    // 实现自定义显示逻辑
    return formattedOutput;
  }
}
```

### 扩展本地化
```typescript
// 在 LocalizationService 中添加新的文本
private texts = {
  zh: {
    newFeature: '新功能',
    // ...
  },
  en: {
    newFeature: 'New Feature',
    // ...
  }
};
```

## 测试

```bash
# 运行前端测试
npm run test:frontend

# 运行所有测试
npm test

# 测试覆盖率
npm run test:coverage
```

## 故障排除

### 常见问题
1. **游戏无法启动**：检查Node.js和TypeScript是否正确安装
2. **显示异常**：确保终端支持UTF-8编码和Unicode字符
3. **命令无响应**：检查后端服务是否正常运行
4. **语言切换失败**：确保本地化资源文件完整

### 调试模式
在开发时可以启用调试输出：
```typescript
// 在 GameController 中
private debug = process.env.NODE_ENV === 'development';

if (this.debug) {
  console.log('Debug: 当前游戏状态', gameState);
}
```

### 性能优化
- 使用异步操作避免阻塞
- 缓存频繁访问的数据
- 优化显示组件的渲染逻辑
- 减少不必要的状态刷新

## 贡献指南

欢迎提交Issue和Pull Request来改进这个前端界面！

### 开发建议
- 保持代码简洁和可读性
- 添加适当的注释和类型定义
- 遵循TypeScript最佳实践
- 测试新功能的兼容性
- 确保多语言支持的完整性

### 代码风格
- 使用TypeScript严格模式
- 遵循ESLint规则
- 使用async/await处理异步操作
- 保持组件的单一职责原则

---

享受你的工程师生活之旅！🚀

这个前端提供了完整的游戏体验，包括美观的界面、丰富的交互和完善的错误处理。通过模块化的架构设计，可以轻松扩展新功能和自定义界面元素。