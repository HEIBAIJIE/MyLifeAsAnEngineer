const { sendCommand } = require('../dist/index');

console.log('测试CSV解析和游戏文本加载...');

try {
  // 测试获取事件31的详细信息
  const gameEngine = require('../dist/gameEngine').GameEngine;
  console.log('GameEngine loaded successfully');
  
  const engine = new gameEngine();
  console.log('GameEngine instance created successfully');

  // 获取事件31
  const event = engine.getDataManager().getEvent(31);
  console.log('事件31信息:', {
    event_id: event?.event_id,
    event_name: event?.event_name,
    text_id: event?.text_id
  });

  // 获取文本1
  const text = engine.getDataManager().getGameText(1);
  console.log('文本1信息:', {
    text_id: text?.text_id,
    text_content: text?.text_content?.substring(0, 50) + '...'
  });

  // 测试事件执行
  const response = sendCommand('{"type":"execute_event","params":{"event_id":31}}');
  const parsed = JSON.parse(response);
  console.log('事件执行结果:', {
    type: parsed.type,
    text_id: parsed.data?.text_id,
    game_text: parsed.data?.game_text?.substring(0, 50) + '...'
  });
} catch (error) {
  console.error('Error occurred:', error);
  console.error('Stack trace:', error.stack);
} 