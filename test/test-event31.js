const { sendCommand } = require('../dist/index');

console.log('Testing event 31 execution...');

try {
  console.log('Executing event 31 via sendCommand...');
  const response = sendCommand('{"type":"execute_event","params":{"event_id":31}}');
  const result = JSON.parse(response);
  console.log('Event execution completed');

  console.log('Event execution result:');
  console.log(JSON.stringify(result, null, 2));

  // Check if game_text is present
  if (result.data && result.data.game_text) {
    console.log('\n✅ Game text found:');
    console.log(result.data.game_text);
  } else {
    console.log('\n❌ No game text found in result');
    console.log('Result structure:', Object.keys(result.data || {}));
  }
} catch (error) {
  console.error('Error occurred:', error);
  console.error('Stack trace:', error.stack);
} 