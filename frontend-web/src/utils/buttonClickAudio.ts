import { onMounted, onUnmounted } from 'vue'
import { playButtonClickSound, audioService } from '../services/AudioService'

// 按钮选择器配置
const BUTTON_SELECTORS = [
  'button',
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="reset"]',
  '.btn',
  '.button',
  '[role="button"]',
  'a[href]' // 也包括链接
].join(', ')

// 全局按钮点击音效处理
export function useButtonClickAudio(options: {
  volume?: number
  enabled?: boolean
  excludeSelectors?: string[]
} = {}) {
  const {
    volume = 0.3,
    enabled = true,
    excludeSelectors = []
  } = options

  let clickHandler: ((event: Event) => void) | null = null

  const initializeClickHandler = () => {
    if (!enabled) return

    clickHandler = (event: Event) => {
      const target = event.target as HTMLElement
      
      // 检查是否是按钮类元素
      if (target.matches(BUTTON_SELECTORS)) {
        // 检查是否被排除
        const isExcluded = excludeSelectors.some(selector => 
          target.matches(selector)
        )
        
        if (!isExcluded) {
          playButtonClickSound(volume)
        }
      }
    }

    // 使用事件委托在document上监听
    document.addEventListener('click', clickHandler, true)
  }

  const cleanup = () => {
    if (clickHandler) {
      document.removeEventListener('click', clickHandler, true)
      clickHandler = null
    }
  }

  onMounted(() => {
    // 初始化音频服务（用户交互时）
    document.addEventListener('click', () => {
      audioService.initializeForUserInteraction()
    }, { once: true })

    initializeClickHandler()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    enable: () => {
      if (!clickHandler) initializeClickHandler()
    },
    disable: cleanup,
    playSound: () => playButtonClickSound(volume)
  }
}

// 手动播放按钮音效的工具函数
export function playManualButtonClick(volume?: number): void {
  playButtonClickSound(volume)
} 