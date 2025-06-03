class AudioService {
  private audioCache: Map<string, AudioBuffer> = new Map()
  private audioContext: AudioContext | null = null
  private initialized = false

  // 初始化音频上下文
  private async initAudioContext(): Promise<void> {
    if (this.audioContext) return

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // 如果音频上下文处于暂停状态，需要恢复
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
    }
  }

  // 预加载音频文件
  async preloadAudio(url: string, key: string): Promise<void> {
    if (this.audioCache.has(key)) return

    try {
      await this.initAudioContext()
      if (!this.audioContext) throw new Error('Audio context not initialized')

      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      
      this.audioCache.set(key, audioBuffer)
      console.log(`Audio preloaded: ${key}`)
    } catch (error) {
      console.error(`Failed to preload audio ${key}:`, error)
    }
  }

  // 播放音频（独立音轨）
  async playAudio(key: string, volume: number = 1.0): Promise<void> {
    try {
      await this.initAudioContext()
      if (!this.audioContext) throw new Error('Audio context not initialized')

      // 如果音频上下文处于暂停状态，需要恢复
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      const audioBuffer = this.audioCache.get(key)
      if (!audioBuffer) {
        console.warn(`Audio not found in cache: ${key}`)
        return
      }

      // 创建新的音频源节点（独立音轨）
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = audioBuffer
      gainNode.gain.value = Math.max(0, Math.min(1, volume))

      // 连接音频节点
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // 播放音频
      source.start(0)
    } catch (error) {
      console.error(`Failed to play audio ${key}:`, error)
    }
  }

  // 批量预加载音频
  async preloadMultipleAudios(audioMap: Record<string, string>): Promise<void> {
    const promises = Object.entries(audioMap).map(([key, url]) =>
      this.preloadAudio(url, key)
    )
    await Promise.all(promises)
  }

  // 用户交互后初始化（解决浏览器自动播放限制）
  async initializeForUserInteraction(): Promise<void> {
    try {
      await this.initAudioContext()
      console.log('Audio service initialized for user interaction')
    } catch (error) {
      console.error('Failed to initialize audio service:', error)
    }
  }
}

// 创建单例实例
export const audioService = new AudioService()

// 音频资源配置
export const AUDIO_ASSETS = {
  BUTTON_CLICK: '/static/mech-keyboard.mp3'
} as const

// 初始化音频服务
export async function initializeAudioService(): Promise<void> {
  try {
    // 预加载音频文件
    await audioService.preloadMultipleAudios({
      mechKeyboard: AUDIO_ASSETS.BUTTON_CLICK
    })
    console.log('Audio service initialized successfully')
  } catch (error) {
    console.error('Failed to initialize audio service:', error)
  }
}

// 播放按钮点击音效
export function playButtonClickSound(volume: number = 0.3): void {
  audioService.playAudio('mechKeyboard', volume)
} 