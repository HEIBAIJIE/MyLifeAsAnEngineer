const { sendCommand } = require('../dist/index');

console.log('Testing frontend with event 31...');

try {
  const response = sendCommand('{"type":"execute_event","params":{"event_id":31}}');
  console.log('Response received:');
  console.log(response);
  
  const parsed = JSON.parse(response);
  if (parsed.data && parsed.data.game_text) {
    console.log('\n✅ Frontend successfully returned game text:');
    console.log(parsed.data.game_text);
  } else {
    console.log('\n❌ Frontend did not return game text');
  }
} catch (error) {
  console.error('Error:', error);
} 