export class ResourceManager {
  getResourceValue = jest.fn().mockReturnValue(100);
  setResourceValue = jest.fn();
  resetToInitialState = jest.fn();
  isGameOver = jest.fn().mockReturnValue(false);
  getCurrentEnding = jest.fn().mockReturnValue({
    ending_id: 1,
    ending_name: 'Test Ending'
  });
} 