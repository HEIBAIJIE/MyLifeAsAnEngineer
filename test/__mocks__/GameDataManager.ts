export class GameDataManager {
  getAllResources = jest.fn().mockReturnValue(new Map());
  getAllTemporaryEvents = jest.fn().mockReturnValue(new Map());
  getAllScheduledTasks = jest.fn().mockReturnValue(new Map());
  getResource = jest.fn().mockReturnValue(undefined);
  getEvent = jest.fn().mockReturnValue(undefined);
  getItem = jest.fn().mockReturnValue(undefined);
  getEntity = jest.fn().mockReturnValue(undefined);
  getTemporaryEvent = jest.fn().mockReturnValue(undefined);
  getScheduledTask = jest.fn().mockReturnValue(undefined);
  getLocation = jest.fn().mockReturnValue(undefined);
  getEnding = jest.fn().mockReturnValue(undefined);
  getGameText = jest.fn().mockReturnValue(undefined);
} 