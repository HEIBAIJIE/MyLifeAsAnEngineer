import type { 
  GameState, 
  Location, 
  Entity, 
  EventResult, 
  Inventory
} from '../types'

// 进度回调函数类型
export type ProgressCallback = (progress: number, message: string) => void

// 后端适配器类，用于与游戏引擎通信
export class BackendAdapter {
  private currentLanguage: string = 'zh'
  private gameEngine: any = null
  private isInitialized: boolean = false
  private gameEngineBackend: any = null
  private progressCallback: ProgressCallback | null = null

  // 设置进度回调
  setProgressCallback(callback: ProgressCallback | null): void {
    this.progressCallback = callback
  }

  // 报告进度
  private reportProgress(progress: number, message: string): void {
    if (this.progressCallback) {
      this.progressCallback(progress, message)
    }
  }

  // 初始化后端引擎
  async initialize(): Promise<void> {
    if (this.isInitialized) return
    
    try {
      console.log('Loading real backend engine...')
      this.reportProgress(0, 'loading_script')
      
      // 加载编译后的游戏引擎
      await this.loadGameEngineScript()
      this.reportProgress(25, 'script_loaded')
      
      // 等待一小段时间让进度显示
      await new Promise(resolve => setTimeout(resolve, 300))
      this.reportProgress(40, 'init_adapter')
      
      // 获取游戏引擎实例
      if ((window as any).GameEngineBackend) {
        this.gameEngineBackend = (window as any).GameEngineBackend
        this.gameEngine = this.gameEngineBackend.gameEngine
        
        this.reportProgress(60, 'connecting')
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // 初始化游戏引擎
        this.reportProgress(75, 'init_engine')
        await this.gameEngine.initialize()
        
        this.reportProgress(90, 'loading_data')
        await new Promise(resolve => setTimeout(resolve, 200))
        
        this.isInitialized = true
        this.reportProgress(100, 'complete')
        console.log('Real backend engine initialized successfully')
      } else {
        throw new Error('GameEngineBackend not found in global scope')
      }
    } catch (error) {
      console.error('Failed to initialize backend:', error)
      this.reportProgress(0, 'error: ' + (error as Error).message)
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
    
    console.log('Backend getGameState response:', response)
    
    if (response.type === 'query_result' && response.data) {
      console.log('Game state resources:', response.data.resources)
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
    console.log('BackendAdapter loadGame called with saveData length:', saveData.length);
    console.log('BackendAdapter loadGame saveData preview:', saveData.substring(0, 100) + '...');
    
    const response = this.sendCommand({
      type: 'load_game',
      params: { save_data: saveData },
      language: this.currentLanguage
    })
    
    console.log('BackendAdapter loadGame response:', response);
    
    if (response.type === 'game_loaded') {
      return { success: true }
    }
    return { success: false, error: response.error }
  }

  // 重置游戏
  async resetGame(): Promise<void> {
    console.log('BackendAdapter: Resetting game...')
    this.reportProgress(85, 'reset_game')
    
    if (this.gameEngine && this.gameEngine.resetGame) {
      this.gameEngine.resetGame()
      console.log('BackendAdapter: Game reset method called')
      
      // 等待一小段时间确保重置操作完成
      await new Promise(resolve => setTimeout(resolve, 100))
      this.reportProgress(95, 'reset_complete')
      console.log('BackendAdapter: Game reset completed')
    } else {
      console.warn('BackendAdapter: Game engine or resetGame method not available')
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

  // 位置切换 - 通过执行对应的移动事件
  async travelToLocation(locationId: number): Promise<{ success: boolean; error?: string }> {
    try {
      // 首先获取当前位置
      const gameState = await this.getGameState()
      const currentLocationId = gameState.resources[61] || 3
      
      console.log('Travel debug info:', {
        currentLocationId,
        targetLocationId: locationId,
        gameStateResources: gameState.resources
      })
      
      // 如果已经在目标位置，不需要移动
      if (currentLocationId === locationId) {
        return { success: true }
      }

      // 根据events.csv中的实际映射确定移动事件ID
      // 移动事件映射表：[当前位置][目标位置] = 事件ID
      const travelEventMap: { [key: string]: number } = {
        // 从公司(1)出发
        '1_2': 1,   // 前往商店
        '1_3': 2,   // 前往家
        '1_4': 3,   // 前往公园
        '1_5': 4,   // 前往餐馆
        '1_6': 5,   // 前往医院
        
        // 从商店(2)出发
        '2_1': 6,   // 前往公司
        '2_3': 7,   // 前往家
        '2_4': 8,   // 前往公园
        '2_5': 9,   // 前往餐馆
        '2_6': 10,  // 前往医院
        
        // 从家(3)出发
        '3_1': 11,  // 前往公司
        '3_2': 12,  // 前往商店
        '3_4': 13,  // 前往公园
        '3_5': 14,  // 前往餐馆
        '3_6': 15,  // 前往医院
        
        // 从公园(4)出发
        '4_1': 16,  // 前往公司
        '4_2': 17,  // 前往商店
        '4_3': 18,  // 前往家
        '4_5': 19,  // 前往餐馆
        '4_6': 20,  // 前往医院
        
        // 从餐馆(5)出发
        '5_1': 21,  // 前往公司
        '5_2': 22,  // 前往商店
        '5_3': 23,  // 前往家
        '5_4': 24,  // 前往公园
        '5_6': 25,  // 前往医院
        
        // 从医院(6)出发
        '6_1': 26,  // 前往公司
        '6_2': 27,  // 前往商店
        '6_3': 28,  // 前往家
        '6_4': 29,  // 前往公园
        '6_5': 30,  // 前往餐馆
      }
      
      const travelKey = `${currentLocationId}_${locationId}`
      const eventId = travelEventMap[travelKey]
      
      console.log('Travel mapping:', {
        travelKey,
        eventId,
        availableKeys: Object.keys(travelEventMap)
      })
      
      if (!eventId) {
        console.error(`No travel event found for ${currentLocationId} -> ${locationId}`)
        return { success: false, error: `无法从位置${currentLocationId}移动到位置${locationId}` }
      }
      
      console.log(`Traveling from location ${currentLocationId} to ${locationId}, using event ${eventId}`)

      // 执行移动事件
      const command = {
        type: 'execute_event',
        params: { event_id: eventId },
        language: this.currentLanguage
      }
      
      console.log('Sending travel command:', command)
      
      const response = this.sendCommand(command)
      
      console.log('Travel response:', response)

      if (response.type === 'event_result') {
        console.log(`Successfully traveled to location ${locationId}`)
        return { success: true }
      } else {
        console.error('Travel failed:', {
          responseType: response.type,
          responseError: response.error,
          fullResponse: response
        })
        return { success: false, error: response.error || '移动事件执行失败' }
      }
    } catch (error) {
      console.error('Travel error:', error)
      return { success: false, error: (error as Error).message }
    }
  }

  // 获取时间信息
  async getTimeInfo(): Promise<any> {
    const response = this.sendCommand({
      type: 'get_time_info',
      language: this.currentLanguage
    })
    
    if (response.type === 'query_result' && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to get time info')
  }
} 