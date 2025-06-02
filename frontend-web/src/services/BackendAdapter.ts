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
      script.src = '/dist/dist/game-engine.js'
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
      // 创建位置到事件ID的映射表
      const travelEventMap: { [key: string]: number } = {
        // 从公司(1)出发
        '1_2': 2,   // 前往商店
        '1_3': 3,   // 前往家
        '1_4': 4,   // 前往公园
        '1_5': 5,   // 前往餐馆
        '1_6': 6,   // 前往医院
        
        // 从商店(2)出发
        '2_1': 1,   // 前往公司
        '2_3': 9,   // 前往家
        '2_4': 10,  // 前往公园
        '2_5': 11,  // 前往餐馆
        '2_6': 12,  // 前往医院
        
        // 从家(3)出发
        '3_1': 7,   // 前往公司
        '3_2': 8,   // 前往商店
        '3_4': 16,  // 前往公园
        '3_5': 17,  // 前往餐馆
        '3_6': 18,  // 前往医院
        
        // 从公园(4)出发
        '4_1': 13,  // 前往公司
        '4_2': 14,  // 前往商店
        '4_3': 15,  // 前往家
        '4_5': 23,  // 前往餐馆 (location_requirement=4)
        '4_6': 24,  // 前往医院
        
        // 从餐馆(5)出发
        '5_1': 19,  // 前往公司
        '5_2': 20,  // 前往商店
        '5_3': 21,  // 前往家
        '5_4': 22,  // 前往公园 (location_requirement=5)
        '5_6': 30,  // 前往医院 (location_requirement=5)
        
        // 从医院(6)出发
        '6_1': 25,  // 前往公司
        '6_2': 26,  // 前往商店
        '6_3': 27,  // 前往家
        '6_4': 28,  // 前往公园
        '6_5': 29,  // 前往餐馆
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
      
      // 调试：检查游戏引擎是否有这个事件
      if (this.gameEngine) {
        const dataManager = this.gameEngine.getDataManager()
        const event = dataManager.getEvent(eventId)
        console.log('Event lookup result:', event)
        
        // 获取所有事件来调试
        const allEvents = dataManager.getAllEvents()
        console.log('Total events loaded:', allEvents.size)
        const eventIds = Array.from(allEvents.keys()) as number[]
        console.log('Events 1-10:', eventIds.filter(id => id >= 1 && id <= 10).sort())
      }

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