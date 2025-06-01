const { sendCommand } = require('../dist/index');

console.log('Testing My Life As An Engineer Backend');
console.log('======================================\n');

// Test 1: Get initial game state
console.log('Test 1: Get Game State');
let response = JSON.parse(sendCommand('{"type":"get_game_state"}'));
console.log('Initial time:', response.data.time_info.current_time);
console.log('Initial money:', response.data.resources[2]);
console.log('Initial location:', response.data.resources[61]);
console.log();

// Test 2: Query available events
console.log('Test 2: Query Available Events');
response = JSON.parse(sendCommand('{"type":"query_available_events"}'));
console.log('Available events:', response.data.available_events.length);
if (response.data.available_events.length > 0) {
  console.log('First event:', response.data.available_events[0]);
}
console.log();

// Test 3: Execute an event
console.log('Test 3: Execute Event 31 (Ask about today\'s work)');
response = JSON.parse(sendCommand('{"type":"execute_event","params":{"event_id":31}}'));
console.log('Success:', response.data?.success);
console.log('Event name:', response.data?.event_name);
console.log('Time consumed:', response.data?.time_cost);
console.log('Resource changes:', response.data?.resource_changes);
console.log();

// Test 4: Check time progression
console.log('Test 4: Check Time Progression');
response = JSON.parse(sendCommand('{"type":"get_time_info"}'));
console.log('Current time:', response.data.current_time);
console.log('Hour:', response.data.hour);
console.log('Day:', response.data.day);
console.log('Day of week:', response.data.day_of_week);
console.log('Is weekend:', response.data.is_weekend);
console.log();

// Test 5: Save game
console.log('Test 5: Save Game');
response = JSON.parse(sendCommand('{"type":"save_game"}'));
console.log('Save successful:', response.type === 'game_saved');
const saveData = response.data.save_data;
console.log('Save data length:', saveData.length);
console.log();

// Test 6: Query resources
console.log('Test 6: Query Resources');
response = JSON.parse(sendCommand('{"type":"query_resource","params":{"resource_id":14}}'));
console.log('Fatigue:', response.data);
response = JSON.parse(sendCommand('{"type":"query_resource","params":{"resource_id":13}}'));
console.log('Health:', response.data);
console.log();

console.log('All tests completed!'); 