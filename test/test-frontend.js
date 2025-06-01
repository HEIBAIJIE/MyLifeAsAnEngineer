const { sendCommand } = require('../dist/index');

console.log('测试前端与后端连接...\n');

// 测试基本命令
const testCommands = [
  '{"type":"get_game_state"}',
  '{"type":"get_time_info"}',
  '{"type":"query_location"}',
  '{"type":"query_available_events"}',
  '{"type":"query_inventory"}'
];

for (const command of testCommands) {
  try {
    console.log(`发送命令: ${command}`);
    const response = sendCommand(command);
    const parsed = JSON.parse(response);
    console.log(`响应类型: ${parsed.type}`);
    
    if (parsed.type === 'error') {
      console.log(`错误: ${parsed.error}`);
    } else {
      console.log('✅ 命令执行成功');
    }
    console.log('---');
  } catch (error) {
    console.error(`❌ 命令执行失败: ${error}`);
    console.log('---');
  }
}

console.log('\n测试完成！如果所有命令都成功执行，说明前端可以正常连接后端。');
console.log('现在可以运行 "npx ts-node start-game.ts" 来启动游戏。'); 