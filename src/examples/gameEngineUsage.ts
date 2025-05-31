import { GameEngine } from '../gameEngine';
import { Command } from '../types';

// 使用示例：展示重构后的GameEngine架构
export function demonstrateGameEngineUsage() {
  // 创建游戏引擎实例
  const gameEngine = new GameEngine();
  
  console.log('=== 游戏引擎重构后的使用示例 ===');
  
  // 1. 直接访问各个管理器
  const dataManager = gameEngine.getDataManager();
  const resourceManager = gameEngine.getResourceManager();
  const timeManager = gameEngine.getTimeManager();
  const queryService = gameEngine.getQueryService();
  const saveManager = gameEngine.getSaveManager();
  
  // 2. 查询游戏状态
  console.log('\n--- 查询游戏状态 ---');
  const gameState = queryService.getGameState();
  console.log('当前游戏状态:', gameState);
  
  // 3. 查询时间信息
  const timeInfo = timeManager.getTimeInfo();
  console.log('当前时间信息:', timeInfo);
  
  // 4. 查询资源
  const moneyInfo = queryService.queryResource(2); // 查询金钱
  console.log('金钱资源信息:', moneyInfo);
  
  // 5. 查询可用事件
  const availableEvents = queryService.queryAvailableEvents();
  console.log('可用事件:', availableEvents);
  
  // 6. 执行事件（通过命令）
  console.log('\n--- 执行事件 ---');
  const eventCommand = JSON.stringify({
    type: 'execute_event',
    params: { event_id: 1 }
  });
  const eventResult = gameEngine.processCommand(eventCommand);
  console.log('事件执行结果:', eventResult);
  
  // 7. 批量处理命令
  console.log('\n--- 批量处理命令 ---');
  const commands: Command[] = [
    { type: 'query_resource', params: { resource_id: 1 } },
    { type: 'query_resource', params: { resource_id: 2 } },
    { type: 'get_time_info', params: {} }
  ];
  const batchResults = gameEngine.executeBatchCommands(commands);
  console.log('批量命令结果:', batchResults);
  
  // 8. 存档和读档
  console.log('\n--- 存档系统 ---');
  const saveResult = saveManager.saveGame();
  console.log('存档结果:', saveResult);
  
  // 创建检查点
  const checkpoint = saveManager.createCheckpoint('测试检查点', '重构后的第一个检查点');
  console.log('检查点创建:', checkpoint.checkpoint.name);
  
  // 9. 高级查询功能
  console.log('\n--- 高级查询功能 ---');
  const basicResources = queryService.queryResourcesByType('basic');
  console.log('基础资源:', basicResources);
  
  const endingConditions = queryService.queryEndingConditions();
  console.log('结局条件:', endingConditions);
  
  // 10. 时间管理
  console.log('\n--- 时间管理 ---');
  console.log('当前时间:', timeManager.getCurrentTime());
  console.log('是否夜晚:', timeManager.isNightTime());
  console.log('是否周末:', timeManager.isWeekend());
  
  // 推进时间
  timeManager.advanceTime(5);
  console.log('推进5个时间单位后:', timeManager.getCurrentTime());
  
  return {
    gameEngine,
    managers: {
      dataManager,
      resourceManager,
      timeManager,
      queryService,
      saveManager
    }
  };
}

// 展示架构优势
export function demonstrateArchitectureBenefits() {
  console.log('\n=== 重构后的架构优势 ===');
  
  const gameEngine = new GameEngine();
  
  // 1. 职责分离
  console.log('\n1. 职责分离:');
  console.log('- GameDataManager: 负责数据加载和管理');
  console.log('- ResourceManager: 负责资源状态管理');
  console.log('- TimeManager: 负责时间系统');
  console.log('- EventProcessor: 负责事件执行逻辑');
  console.log('- QueryService: 负责查询操作');
  console.log('- SaveManager: 负责存档系统');
  console.log('- GameEngine: 作为主控制器协调各组件');
  
  // 2. 可测试性
  console.log('\n2. 可测试性提升:');
  console.log('- 每个管理器都可以独立测试');
  console.log('- 依赖注入使得模拟测试更容易');
  
  // 3. 可扩展性
  console.log('\n3. 可扩展性:');
  console.log('- 新功能可以通过添加新的管理器实现');
  console.log('- 现有功能的修改不会影响其他模块');
  
  // 4. 可维护性
  console.log('\n4. 可维护性:');
  console.log('- 代码结构清晰，易于理解');
  console.log('- 修改某个功能时影响范围有限');
  
  // 5. 性能优化
  console.log('\n5. 性能优化潜力:');
  console.log('- 可以针对特定管理器进行优化');
  console.log('- 支持懒加载和缓存策略');
  
  return gameEngine;
}

// 如果直接运行此文件，执行示例
if (require.main === module) {
  try {
    demonstrateGameEngineUsage();
    demonstrateArchitectureBenefits();
  } catch (error) {
    console.error('示例执行出错:', error);
  }
} 