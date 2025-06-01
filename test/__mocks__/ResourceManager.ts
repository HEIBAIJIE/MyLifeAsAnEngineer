export class ResourceManager {
  getResourceValue = jest.fn().mockReturnValue(0);
  setResourceValue = jest.fn();
  changeResourceValue = jest.fn().mockReturnValue(0);
  getGameState = jest.fn().mockReturnValue({
    resources: {},
    temporary_event_triggers: {},
    last_task_triggers: {},
    game_over: false,
    current_ending: undefined
  });
  setGameState = jest.fn();
  isGameOver = jest.fn().mockReturnValue(false);
  setGameOver = jest.fn();
  getCurrentEnding = jest.fn().mockReturnValue({
    ending_id: 1,
    ending_name: 'Test Ending'
  });
  setCurrentEnding = jest.fn();
  resetToInitialState = jest.fn();
} 