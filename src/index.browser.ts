import { GameEngine } from './gameEngine';

// 浏览器版本的GameEngine，使用浏览器兼容的CSVLoader
class BrowserGameEngine extends GameEngine {
  constructor() {
    super();
  }

  // 重写初始化方法以使用浏览器兼容的数据加载
  async initialize() {
    try {
      console.log('Initializing Browser GameEngine...');
      
      // 首先调用父类的初始化方法来初始化ResourceManager
      await super.initialize();
      
      // 数据管理器在构造函数中已经初始化了数据
      const dataManager = this.getDataManager();
      
      // 资源管理器在构造函数中已经初始化了资源
      const resourceManager = this.getResourceManager();
      
      console.log('Browser GameEngine initialized successfully');
      console.log('Available resources:', resourceManager.getAllResourceValues());
      console.log('Available entities:', dataManager.getAllEntities().size);
      console.log('Available events:', dataManager.getAllEvents().size);
      
      // 详细调试信息：显示事件ID范围
      const allEvents = dataManager.getAllEvents();
      const eventIds = Array.from(allEvents.keys()).sort((a, b) => a - b);
      console.log('Event IDs loaded:', eventIds);
      console.log('Events 1-10:', eventIds.filter(id => id >= 1 && id <= 10));
      console.log('Events 11-30:', eventIds.filter(id => id >= 11 && id <= 30));
      
      // 检查特定的事件ID 7
      const event7 = dataManager.getEvent(7);
      console.log('Event 7 details:', event7);
      
      // 检查所有旅行事件（1-30）
      for (let i = 1; i <= 30; i++) {
        const event = dataManager.getEvent(i);
        if (event) {
          console.log(`Event ${i}: ${event.event_name_cn} (location_requirement: ${event.location_requirement})`);
        } else {
          console.log(`Event ${i}: NOT FOUND`);
        }
      }
    } catch (error) {
      console.error('Failed to initialize Browser GameEngine:', error);
      throw error;
    }
  }
}

// 创建全局游戏引擎实例
const gameEngine = new BrowserGameEngine();

// 命令接口，供外部通信使用
export function sendCommand(commandStr: string): string {
  try {
    const response = gameEngine.processCommand(commandStr);
    return JSON.stringify(response);
  } catch (error: any) {
    return JSON.stringify({
      type: 'error',
      error: error.message || 'Unknown error'
    });
  }
}

// 替代的队列式接口
export function addCommandToQueue(commandStr: string): void {
  gameEngine.addCommand(commandStr);
}

export function getNextResponse(): string | null {
  const response = gameEngine.getNextResponse();
  return response ? JSON.stringify(response) : null;
}

// 导出类和实例
export { GameEngine, BrowserGameEngine, gameEngine };

// 全局暴露接口（用于在浏览器中直接调用）
declare const window: any;
if (typeof window !== 'undefined') {
  window.GameEngineBackend = {
    sendCommand,
    addCommandToQueue,
    getNextResponse,
    GameEngine,
    BrowserGameEngine,
    gameEngine
  };
} 