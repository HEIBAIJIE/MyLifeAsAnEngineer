import type { 
  GameState, 
  Location, 
  Entity, 
  EventResult, 
  Inventory, 
  BackendResponse 
} from '../types'

// 后端适配器类，用于与游戏引擎通信
export class BackendAdapter {
  private currentLanguage: string = 'zh'
  private gameEngine: any = null
  private isInitialized: boolean = false
  private gameEngineBackend: any = null

  // 初始化后端引擎
  async initialize(): Promise<void> {
    if (this.isInitialized) return
    
    try {
      console.log('Loading real backend engine...')
      
      // 加载编译后的游戏引擎
      await this.loadGameEngineScript()
      
      // 获取游戏引擎实例
      if ((window as any).GameEngineBackend) {
        this.gameEngineBackend = (window as any).GameEngineBackend
        this.gameEngine = this.gameEngineBackend.gameEngine
        
        // 初始化游戏引擎
        await this.gameEngine.initialize()
        
        this.isInitialized = true
        console.log('Real backend engine initialized successfully')
      } else {
        throw new Error('GameEngineBackend not found in global scope')
      }
    } catch (error) {
      console.error('Failed to initialize backend:', error)
      throw error
    }
  }

  // 动态加载游戏引擎脚本
  private async loadGameEngineScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 检查是否已经加载
      if ((window as any).GameEngineBackend) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = '/dist/game-engine.js'
      script.onload = () => {
        console.log('Game engine script loaded successfully')
        resolve()
      }
      script.onerror = (error) => {
        console.error('Failed to load game engine script:', error)
        reject(new Error('Failed to load game engine script'))
      }
      
      document.head.appendChild(script)
    })
  }

  // 发送命令到后端
  private sendCommand(command: any): any {
    if (!this.isInitialized || !this.gameEngineBackend) {
      throw new Error('Backend not initialized')
    }
    
    try {
      const commandStr = typeof command === 'string' ? command : JSON.stringify(command)
      
      // 使用真正的后端引擎处理命令
      const responseStr = this.gameEngineBackend.sendCommand(commandStr)
      const response = JSON.parse(responseStr)
      
      return response
    } catch (error) {
      console.error('Backend command error:', error)
      return {
        type: 'error',
        success: false,
        error: (error as Error).message || 'Unknown error'
      }
    }
  }

  // 设置语言
  setLanguage(language: string): void {
    this.currentLanguage = language
  }

  getCurrentLanguage(): string {
    return this.currentLanguage
  }

  // 获取游戏状态
  async getGameState(): Promise<GameState> {
    const response = this.sendCommand({
      type: 'get_game_state',
      language: this.currentLanguage
    })
    
    if (response.type === 'query_result' && response.data) {
      return response.data as GameState
    }
    throw new Error(response.error || 'Failed to get game state')
  }

  // 获取当前位置
  async getCurrentLocation(): Promise<Location> {
    const response = this.sendCommand({
      type: 'query_location',
      language: this.currentLanguage
    })
    
    if (response.type === 'query_result' && response.data) {
      return response.data as Location
    }
    throw new Error(response.error || 'Failed to get current location')
  }

  // 获取可用实体
  async getAvailableEntities(): Promise<Entity[]> {
    const response = this.sendCommand({
      type: 'query_available_entities',
      language: this.currentLanguage
    })
    
    if (response.type === 'query_result' && response.data) {
      return response.data.available_entities as Entity[]
    }
    throw new Error(response.error || 'Failed to get available entities')
  }

  // 查询实体事件
  async getEntityEvents(entityId: number): Promise<any> {
    const response = this.sendCommand({
      type: 'query_entity_events',
      params: { entity_id: entityId },
      language: this.currentLanguage
    })
    
    if (response.type === 'query_result' && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to get entity events')
  }

  // 执行事件
  async executeEvent(eventId: number): Promise<EventResult> {
    const response = this.sendCommand({
      type: 'execute_event',
      params: { event_id: eventId },
      language: this.currentLanguage
    })
    
    if (response.type === 'event_result' && response.data) {
      return { success: true, ...response.data } as EventResult
    }
    return { success: false, error: response.error } as any
  }

  // 获取库存
  async getInventory(): Promise<Inventory[]> {
    const response = this.sendCommand({
      type: 'query_inventory',
      language: this.currentLanguage
    })
    
    if (response.type === 'query_result' && response.data) {
      return response.data.inventory as Inventory[]
    }
    throw new Error(response.error || 'Failed to get inventory')
  }

  // 使用物品
  async useItem(itemSlot: number): Promise<EventResult> {
    const response = this.sendCommand({
      type: 'use_item',
      params: { item_slot: itemSlot },
      language: this.currentLanguage
    })
    
    if (response.type === 'event_result' && response.data) {
      return { success: true, ...response.data } as EventResult
    }
    return { success: false, error: response.error } as any
  }

  // 保存游戏
  async saveGame(): Promise<{ success: boolean; saveData?: string; error?: string }> {
    const response = this.sendCommand({
      type: 'save_game',
      language: this.currentLanguage
    })
    
    if (response.type === 'game_saved' && response.data) {
      return { success: true, saveData: response.data.save_data }
    }
    return { success: false, error: response.error }
  }

  // 加载游戏
  async loadGame(saveData: string): Promise<{ success: boolean; error?: string }> {
    const response = this.sendCommand({
      type: 'load_game',
      params: { save_data: saveData },
      language: this.currentLanguage
    })
    
    if (response.type === 'game_loaded') {
      return { success: true }
    }
    return { success: false, error: response.error }
  }

  // 重置游戏
  async resetGame(): Promise<void> {
    if (this.gameEngine && this.gameEngine.resetGame) {
      this.gameEngine.resetGame()
    }
  }

  // 检查游戏是否结束
  isGameOver(): boolean {
    if (this.gameEngine && this.gameEngine.isGameOver) {
      return this.gameEngine.isGameOver()
    }
    return false
  }

  // 检查是否已初始化
  get initialized(): boolean {
    return this.isInitialized
  }
} 