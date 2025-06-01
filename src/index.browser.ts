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
      
      // 数据管理器在构造函数中已经初始化了数据
      const dataManager = this.getDataManager();
      
      // 资源管理器在构造函数中已经初始化了资源
      const resourceManager = this.getResourceManager();
      
      console.log('Browser GameEngine initialized successfully');
      console.log('Available resources:', resourceManager.getAllResourceValues());
      console.log('Available entities:', dataManager.getAllEntities().size);
      console.log('Available events:', dataManager.getAllEvents().size);
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