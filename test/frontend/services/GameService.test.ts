import { GameService } from '../../../src/frontend/services/GameService';
import { sendCommand } from '../../../src/index';

// Mock the sendCommand function
jest.mock('../../../src/index', () => ({
  sendCommand: jest.fn()
}));

const mockSendCommand = sendCommand as jest.MockedFunction<typeof sendCommand>;

describe('GameService', () => {
  let gameService: GameService;

  beforeEach(() => {
    gameService = new GameService();
    jest.clearAllMocks();
  });

  describe('Language Management', () => {
    test('should set and get language correctly', () => {
      expect(gameService.getCurrentLanguage()).toBe('zh');
      
      gameService.setLanguage('en');
      expect(gameService.getCurrentLanguage()).toBe('en');
      
      gameService.setLanguage('zh');
      expect(gameService.getCurrentLanguage()).toBe('zh');
    });
  });

  describe('getGameState', () => {
    test('should return game state when successful', async () => {
      const mockGameState = {
        resources: [0, 0, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 100, 100],
        game_over: false,
        current_ending: null,
        time_info: {
          current_time: 14,
          day_of_week: 1,
          is_weekend: false,
          is_night: false,
          time_display: '07:00'
        }
      };

      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'query_result',
        data: mockGameState
      }));

      const result = await gameService.getGameState();
      
      expect(result).toEqual(mockGameState);
      expect(mockSendCommand).toHaveBeenCalledWith(JSON.stringify({
        type: 'get_game_state',
        language: 'zh'
      }));
    });

    test('should return null when response type is not query_result', async () => {
      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'error',
        error: 'Failed to get game state'
      }));

      const result = await gameService.getGameState();
      
      expect(result).toBeNull();
    });

    test('should return null when sendCommand throws error', async () => {
      mockSendCommand.mockImplementation(() => {
        throw new Error('Network error');
      });

      const result = await gameService.getGameState();
      
      expect(result).toBeNull();
    });
  });

  describe('getAvailableEvents', () => {
    test('should return available events when successful', async () => {
      const mockEvents = [
        { event_id: 31, event_name: '工作', time_cost: 8 },
        { event_id: 32, event_name: '休息', time_cost: 2 }
      ];

      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'query_result',
        data: { available_events: mockEvents }
      }));

      const result = await gameService.getAvailableEvents();
      
      expect(result).toEqual(mockEvents);
      expect(mockSendCommand).toHaveBeenCalledWith(JSON.stringify({
        type: 'query_available_events',
        language: 'zh'
      }));
    });

    test('should return empty array when no events available', async () => {
      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'query_result',
        data: {}
      }));

      const result = await gameService.getAvailableEvents();
      
      expect(result).toEqual([]);
    });

    test('should return empty array when response type is not query_result', async () => {
      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'error',
        error: 'Failed to get events'
      }));

      const result = await gameService.getAvailableEvents();
      
      expect(result).toEqual([]);
    });
  });

  describe('getCurrentLocation', () => {
    test('should return location info when successful', async () => {
      const mockLocation = {
        location_name: '公司',
        location_id: 1
      };

      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'query_result',
        data: mockLocation
      }));

      const result = await gameService.getCurrentLocation();
      
      expect(result).toEqual(mockLocation);
      expect(mockSendCommand).toHaveBeenCalledWith(JSON.stringify({
        type: 'query_location',
        language: 'zh'
      }));
    });

    test('should fallback to default location names when query fails', async () => {
      // First call fails, second call (getGameState) succeeds
      mockSendCommand
        .mockReturnValueOnce(JSON.stringify({
          type: 'error',
          error: 'Location query failed'
        }))
        .mockReturnValueOnce(JSON.stringify({
          type: 'query_result',
          data: {
            resources: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2] // location_id = 2
          }
        }));

      const result = await gameService.getCurrentLocation();
      
      expect(result).toEqual({
        location_name: '商店',
        location_id: 2
      });
    });

    test('should return null when both query and fallback fail', async () => {
      // Both calls fail
      mockSendCommand
        .mockReturnValueOnce(JSON.stringify({
          type: 'error',
          error: 'Location query failed'
        }))
        .mockReturnValueOnce(JSON.stringify({
          type: 'error',
          error: 'Failed'
        }));

      const result = await gameService.getCurrentLocation();
      
      expect(result).toBeNull();
    });
  });

  describe('executeEvent', () => {
    test('should execute event successfully', async () => {
      (sendCommand as jest.Mock).mockReturnValue(JSON.stringify({
        type: 'event_result',
        data: {
          game_text: '你成功完成了工作',
          time_cost: 4,
          resource_changes: [
            { resource_id: 2, resource_name: '金钱', change: 100 }
          ]
        }
      }));

      const result = await gameService.executeEvent(31);

      expect(result.success).toBe(true);
      expect(result.game_text).toBe('你成功完成了工作');
      expect(result.time_cost).toBe(4);
      expect(result.resource_changes).toHaveLength(1);
    });

    test('should handle event execution failure', async () => {
      (sendCommand as jest.Mock).mockReturnValue(JSON.stringify({
        type: 'error',
        error: '事件执行失败'
      }));

      const result = await gameService.executeEvent(999);

      expect(result.success).toBe(false);
      expect(result.game_text).toBe('事件执行失败');
      expect(result.time_cost).toBe(0);
    });
  });

  describe('saveGame', () => {
    test('should return success result when save succeeds', async () => {
      const mockSaveData = {
        save_data: 'encoded_save_data_string'
      };

      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'game_saved',
        data: mockSaveData
      }));

      const result = await gameService.saveGame();
      
      expect(result.success).toBe(true);
      expect(result.saveData).toBe('encoded_save_data_string');
      expect(result.error).toBeUndefined();
      expect(mockSendCommand).toHaveBeenCalledWith(JSON.stringify({
        type: 'save_game',
        language: 'zh'
      }));
    });

    test('should return error result when save fails', async () => {
      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'error',
        error: 'Failed to save game: disk full'
      }));

      const result = await gameService.saveGame();
      
      expect(result.success).toBe(false);
      expect(result.saveData).toBeUndefined();
      expect(result.error).toBe('Failed to save game: disk full');
    });

    test('should return error result when response type is unknown', async () => {
      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'unknown_type',
        data: {}
      }));

      const result = await gameService.saveGame();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('未知错误');
    });
  });

  describe('loadGame', () => {
    test('should return success result when load succeeds', async () => {
      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'game_loaded',
        data: { success: true }
      }));

      const result = await gameService.loadGame('test_save_data');
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockSendCommand).toHaveBeenCalledWith(JSON.stringify({
        type: 'load_game',
        params: { save_data: 'test_save_data' },
        language: 'zh'
      }));
    });

    test('should return error result when load fails', async () => {
      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'error',
        error: 'Failed to load game: Invalid save data format'
      }));

      const result = await gameService.loadGame('invalid_data');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to load game: Invalid save data format');
    });

    test('should return error result when response type is unknown', async () => {
      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'unknown_type',
        data: {}
      }));

      const result = await gameService.loadGame('test_data');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('未知错误');
    });
  });

  describe('getInventory', () => {
    test('should return inventory items when successful', async () => {
      const mockInventory = [
        { slot: 1, item_name: '咖啡', quantity: 2 },
        { slot: 2, item_name: '书籍', quantity: 1 }
      ];

      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'query_result',
        data: { inventory: mockInventory }
      }));

      const result = await gameService.getInventory();
      
      expect(result).toEqual(mockInventory);
      expect(mockSendCommand).toHaveBeenCalledWith(JSON.stringify({
        type: 'query_inventory',
        language: 'zh'
      }));
    });

    test('should return empty array when no inventory', async () => {
      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'query_result',
        data: {}
      }));

      const result = await gameService.getInventory();
      
      expect(result).toEqual([]);
    });
  });

  describe('useItem', () => {
    test('should return successful result when item use succeeds', async () => {
      const mockResult = {
        game_text: '你喝了咖啡，感觉精神了一些',
        time_cost: 1,
        resource_changes: [
          { resource_id: 14, resource_name: '疲劳', change: -10 }
        ]
      };

      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'event_result',
        data: mockResult
      }));

      const result = await gameService.useItem(1);
      
      expect(result.success).toBe(true);
      expect(result.game_text).toBe('你喝了咖啡，感觉精神了一些');
      expect(result.time_cost).toBe(1);
      
      expect(mockSendCommand).toHaveBeenCalledWith(JSON.stringify({
        type: 'use_item',
        params: { item_id: 1 },
        language: 'zh'
      }));
    });

    test('should return failure result when item use fails', async () => {
      mockSendCommand.mockReturnValue(JSON.stringify({
        type: 'error',
        error: '物品不存在'
      }));

      const result = await gameService.useItem(999);
      
      expect(result.success).toBe(false);
      expect(result.time_cost).toBe(0);
      expect(result.game_text).toBe('物品不存在');
    });
  });
}); 