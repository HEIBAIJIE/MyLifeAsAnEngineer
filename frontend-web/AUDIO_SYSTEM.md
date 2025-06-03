# 按钮点击音效系统

## 功能特性

1. **自动缓存**: 音频文件在应用启动时预加载，确保快速播放
2. **独立音轨**: 每次播放都创建新的音频源节点，支持多重播放而不会相互中断
3. **即时播放**: 使用 Web Audio API 确保最低延迟
4. **工程集成**: 音频文件通过 Vite 构建系统自动打包到最终目录

## 实现原理

### 核心服务 (`AudioService.ts`)
- 使用 Web Audio API 进行高性能音频处理
- 预加载音频文件到内存缓存 (`AudioBuffer`)
- 每次播放时创建新的 `AudioBufferSourceNode`，实现独立音轨
- 支持音量控制和错误处理

### 全局监听器 (`buttonClickAudio.ts`)
- 使用事件委托在 `document` 级别监听所有点击事件
- 智能识别按钮类元素（包括 `button`、`input[type="button"]`、`.btn`、`a[href]` 等）
- 支持排除特定元素（通过 `excludeSelectors` 配置）
- 在用户首次交互时自动初始化音频上下文（解决浏览器自动播放限制）

## 使用方法

### 1. 自动全局音效（推荐）
在 `App.vue` 中已自动启用，所有按钮点击都会播放音效：

```typescript
import { useButtonClickAudio } from './utils/buttonClickAudio'

// 在组件中启用
useButtonClickAudio({
  volume: 0.3,           // 音量 (0-1)
  enabled: true,         // 是否启用
  excludeSelectors: [    // 排除的选择器
    '.silent-button'
  ]
})
```

### 2. 手动播放音效
```typescript
import { playManualButtonClick } from './utils/buttonClickAudio'

// 手动播放按钮音效
playManualButtonClick(0.5) // 可选参数：音量
```

### 3. 直接使用音频服务
```typescript
import { audioService, playButtonClickSound } from './services/AudioService'

// 播放预加载的音效
playButtonClickSound(0.3)

// 或直接使用服务
audioService.playAudio('mechKeyboard', 0.3)
```

## 配置和扩展

### 添加新音效
1. 将音频文件放入 `frontend-web/static/` 目录
2. 在 `AudioService.ts` 中的 `AUDIO_ASSETS` 添加配置：
```typescript
export const AUDIO_ASSETS = {
  BUTTON_CLICK: '/static/mech-keyboard.mp3',
  NEW_SOUND: '/static/your-sound.mp3'  // 新增
} as const
```
3. 在 `initializeAudioService` 中预加载：
```typescript
await audioService.preloadMultipleAudios({
  mechKeyboard: AUDIO_ASSETS.BUTTON_CLICK,
  newSound: AUDIO_ASSETS.NEW_SOUND  // 新增
})
```

### 自定义按钮选择器
修改 `buttonClickAudio.ts` 中的 `BUTTON_SELECTORS` 数组：
```typescript
const BUTTON_SELECTORS = [
  'button',
  'input[type="button"]',
  '.custom-button',  // 自定义选择器
  // ... 其他选择器
].join(', ')
```

### 禁用特定按钮的音效
给按钮添加 `silent-button` 类或其他排除的选择器：
```html
<button class="silent-button">静音按钮</button>
```

## 构建配置

音频文件通过 `vite.config.ts` 中的自定义插件自动复制到构建输出：
- 开发时：直接从 `/static/` 路径访问
- 构建后：复制到 `dist/static/` 目录
- 支持的格式：`.mp3`、`.wav`、`.ogg` 等 Web Audio API 支持的格式

## 浏览器兼容性

- Chrome: 完全支持
- Firefox: 完全支持  
- Safari: 完全支持
- Edge: 完全支持

注意：现代浏览器需要用户交互后才能播放音频，系统已自动处理此限制。

## 性能优化

1. **预加载**: 音频文件在应用启动时加载，避免运行时延迟
2. **内存缓存**: 使用 `Map` 缓存 `AudioBuffer`，避免重复解码
3. **独立节点**: 每次播放创建新节点，避免音频冲突
4. **音量控制**: 使用 `GainNode` 进行精确音量控制
5. **错误处理**: 完善的错误处理确保音频问题不影响应用稳定性 