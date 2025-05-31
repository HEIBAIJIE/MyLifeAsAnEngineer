import { GameEngine } from './gameEngine';

// Create a global game engine instance
const gameEngine = new GameEngine();

// Command interface for external communication
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

// Alternative queue-based interface
export function addCommandToQueue(commandStr: string): void {
  gameEngine.addCommand(commandStr);
}

export function getNextResponse(): string | null {
  const response = gameEngine.getNextResponse();
  return response ? JSON.stringify(response) : null;
}

// CLI interface for testing
if (require.main === module) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('My Life As An Engineer - Backend CLI');
  console.log('====================================');
  console.log('Available commands:');
  console.log('- {"type":"execute_event","params":{"event_id":31}}');
  console.log('- {"type":"query_resource","params":{"resource_id":1}}');
  console.log('- {"type":"query_location"}');
  console.log('- {"type":"query_available_events"}');
  console.log('- {"type":"query_inventory"}');
  console.log('- {"type":"save_game"}');
  console.log('- {"type":"load_game","params":{"save_data":"..."}}');
  console.log('- {"type":"get_game_state"}');
  console.log('- {"type":"get_time_info"}');
  console.log('Type "exit" to quit\n');

  const askCommand = () => {
    rl.question('Enter command: ', (input: string) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        process.exit(0);
      }

      try {
        const response = sendCommand(input);
        console.log('Response:', response);
        console.log();
      } catch (error) {
        console.error('Error:', error);
        console.log();
      }

      askCommand();
    });
  };

  askCommand();
} 