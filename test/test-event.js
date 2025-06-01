const { sendCommand } = require('../dist/index');

console.log('测试事件执行...');

// 执行一个事件
const response = sendCommand('{"type":"execute_event","params":{"event_id":31}}');
const parsed = JSON.parse(response);

console.log('响应类型:', parsed.type);
console.log('响应数据:', JSON.stringify(parsed, null, 2));

if (parsed.type === 'event_result' && parsed.data.game_text) {
  console.log('✅ 游戏文本显示正常:', parsed.data.game_text);
} else {
  console.log('❌ 游戏文本未显示');
} 