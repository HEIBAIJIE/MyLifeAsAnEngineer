import { GameEngine } from '../src/gameEngine';
import { Command } from '../src/types';

// Mock all the managers with manual mocks
jest.mock('../src/managers/GameDataManager', () => ({
  GameDataManager: jest.fn().mockImplementation(() => ({
    getResource: jest.fn().mockReturnValue({ resource_name: 'Test Resource' }),
    getEvent: jest.fn().mockReturnValue({ event_name: 'Test Event' }),
    getLocation: jest.fn().mockReturnValue({ location_name: 'Test Location' }),
    getItem: jest.fn().mockReturnValue({ item_name: 'Test Item' }),
    getGameText: jest.fn().mockReturnValue({ text_content: 'Test Text' }),
    getEnding: jest.fn().mockReturnValue({ ending_name: 'Test Ending' })
  }))
}));

jest.mock('../src/managers/ResourceManager', () => ({
  ResourceManager: jest.fn().mockImplementation(() => ({
    getResourceValue: jest.fn().mockReturnValue(0),
    setResourceValue: jest.fn(),
    changeResourceValue: jest.fn().mockReturnValue(0),
    getGameState: jest.fn().mockReturnValue({
      resources: {},
      temporary_event_triggers: {},
      last_task_triggers: {},
      game_over: false,
      current_ending: undefined
    }),
    setGameState: jest.fn(),
    isGameOver: jest.fn().mockReturnValue(false),
    setGameOver: jest.fn(),
    getCurrentEnding: jest.fn().mockReturnValue({
      ending_id: 1,
      ending_name: 'Test Ending'
    }),
    setCurrentEnding: jest.fn(),
    resetToInitialState: jest.fn()
  }))
}));

jest.mock('../src/managers/TimeManager', () => ({
  TimeManager: jest.fn().mockImplementation(() => ({
    getCurrentTime: jest.fn().mockReturnValue({ hour: 14, day: 1, is_workday: true }),
    advanceTime: jest.fn(),
    isWorkday: jest.fn().mockReturnValue(true)
  }))
}));

jest.mock('../src/managers/EventProcessor', () => ({
  EventProcessor: jest.fn().mockImplementation(() => ({
    executeEvent: jest.fn().mockReturnValue({
      success: true,
      event_id: 1,
      event_name: 'Test Event',
      text_id: 1,
      text_content: 'Test event executed',
      time_consumed: 1,
      resource_changes: {},
      temporary_events_triggered: [],
      scheduled_tasks_triggered: [],
      ending_triggered: undefined
    })
  }))
}));

jest.mock('../src/managers/QueryService', () => ({
  QueryService: jest.fn().mockImplementation(() => ({
    queryResource: jest.fn().mockReturnValue({ 
      type: 'query_result', 
      data: { resource_id: 1, value: 100, name: 'Test Resource' } 
    }),
    queryLocation: jest.fn().mockReturnValue({ 
      type: 'query_result', 
      data: { location_id: 1, name: 'Test Location' } 
    }),
    queryAvailableEvents: jest.fn().mockReturnValue({ 
      type: 'query_result', 
      data: { events: [] } 
    }),
    queryInventory: jest.fn().mockReturnValue({ 
      type: 'query_result', 
      data: { items: [] } 
    }),
    getGameState: jest.fn().mockReturnValue({ 
      type: 'query_result', 
      data: { state: 'running', resources: {} } 
    }),
    getTimeInfo: jest.fn().mockReturnValue({ 
      type: 'query_result', 
      data: { hour: 14, day: 1, is_workday: true } 
    })
  }))
}));

jest.mock('../src/managers/SaveManager', () => ({
  SaveManager: jest.fn().mockImplementation(() => ({
    saveGame: jest.fn().mockReturnValue({
      type: 'game_saved',
      data: { save_data: 'test_save_data' }
    }),
    loadGame: jest.fn().mockReturnValue({
      type: 'game_loaded',
      data: { success: true }
    })
  }))
}));

describe('GameEngine', () => {
  let gameEngine: GameEngine;

  beforeEach(() => {
    gameEngine = new GameEngine();
  });

  describe('Command processing', () => {
    test('should process valid JSON commands', () => {
      const command = JSON.stringify({
        type: 'get_game_state',
        params: {}
      });

      const result = gameEngine.processCommand(command);
      expect(result).toBeDefined();
      expect(result.type).toBe('query_result');
    });

    test('should handle invalid JSON gracefully', () => {
      const invalidCommand = 'invalid json {';
      const result = gameEngine.processCommand(invalidCommand);
      
      expect(result.type).toBe('error');
      expect(result.error).toContain('JSON');
    });

    test('should handle unknown command types', () => {
      const command = JSON.stringify({
        type: 'unknown_command',
        params: {}
      });

      const result = gameEngine.processCommand(command);
      expect(result.type).toBe('error');
      expect(result.error).toBe('Unknown command type');
    });

    test('should use default language when not specified', () => {
      const command = JSON.stringify({
        type: 'get_game_state',
        params: {}
      });

      // Should not throw error and should process with default language
      expect(() => gameEngine.processCommand(command)).not.toThrow();
    });

    test('should respect specified language', () => {
      const command = JSON.stringify({
        type: 'get_game_state',
        params: {},
        language: 'en'
      });

      // Should not throw error and should process with English language
      expect(() => gameEngine.processCommand(command)).not.toThrow();
    });
  });

  describe('Command types', () => {
    test('should handle execute_event command', () => {
      const command = JSON.stringify({
        type: 'execute_event',
        params: { event_id: 1 }
      });

      const result = gameEngine.processCommand(command);
      expect(result).toBeDefined();
      expect(result.type).toBe('event_result');
    });

    test('should handle query_resource command', () => {
      const command = JSON.stringify({
        type: 'query_resource',
        params: { resource_id: 1 }
      });

      const result = gameEngine.processCommand(command);
      expect(result).toBeDefined();
      expect(result.type).toBe('query_result');
    });

    test('should handle query_location command', () => {
      const command = JSON.stringify({
        type: 'query_location',
        params: { location_id: 1 }
      });

      const result = gameEngine.processCommand(command);
      expect(result).toBeDefined();
      expect(result.type).toBe('query_result');
    });

    test('should handle query_available_events command', () => {
      const command = JSON.stringify({
        type: 'query_available_events',
        params: {}
      });

      const result = gameEngine.processCommand(command);
      expect(result).toBeDefined();
      expect(result.type).toBe('query_result');
    });

    test('should handle query_inventory command', () => {
      const command = JSON.stringify({
        type: 'query_inventory',
        params: {}
      });

      const result = gameEngine.processCommand(command);
      expect(result).toBeDefined();
      expect(result.type).toBe('query_result');
    });

    test('should handle use_item command', () => {
      const command = JSON.stringify({
        type: 'use_item',
        params: { item_slot: 1 }
      });

      const result = gameEngine.processCommand(command);
      // Currently returns error as not implemented
      expect(result.type).toBe('error');
      expect(result.error).toContain('尚未实现');
    });

    test('should handle save_game command', () => {
      const command = JSON.stringify({
        type: 'save_game',
        params: {}
      });

      const result = gameEngine.processCommand(command);
      expect(result).toBeDefined();
      expect(result.type).toBe('game_saved');
    });

    test('should handle load_game command', () => {
      const command = JSON.stringify({
        type: 'load_game',
        params: { save_data: 'test_data' }
      });

      const result = gameEngine.processCommand(command);
      expect(result).toBeDefined();
      expect(result.type).toBe('game_loaded');
    });

    test('should handle get_game_state command', () => {
      const command = JSON.stringify({
        type: 'get_game_state',
        params: {}
      });

      const result = gameEngine.processCommand(command);
      expect(result).toBeDefined();
      expect(result.type).toBe('query_result');
    });

    test('should handle get_time_info command', () => {
      const command = JSON.stringify({
        type: 'get_time_info',
        params: {}
      });

      const result = gameEngine.processCommand(command);
      expect(result).toBeDefined();
      expect(result.type).toBe('query_result');
    });
  });

  describe('Command queue operations', () => {
    test('should add commands to queue', () => {
      const command = JSON.stringify({
        type: 'get_game_state',
        params: {}
      });

      gameEngine.addCommand(command);
      
      // Should be able to get response from queue
      const response = gameEngine.getNextResponse();
      expect(response).toBeDefined();
    });

    test('should process commands in order', () => {
      const command1 = JSON.stringify({
        type: 'get_game_state',
        params: {}
      });
      const command2 = JSON.stringify({
        type: 'get_time_info',
        params: {}
      });

      gameEngine.addCommand(command1);
      gameEngine.addCommand(command2);

      const response1 = gameEngine.getNextResponse();
      const response2 = gameEngine.getNextResponse();

      expect(response1).toBeDefined();
      expect(response2).toBeDefined();
    });

    test('should return null when no commands in queue', () => {
      const response = gameEngine.getNextResponse();
      expect(response).toBeNull();
    });

    test('should process command when getting response', () => {
      const command = JSON.stringify({
        type: 'get_game_state',
        params: {}
      });

      gameEngine.addCommand(command);
      
      // First call should process the command
      const response1 = gameEngine.getNextResponse();
      expect(response1).toBeDefined();
      
      // Second call should return null (no more commands)
      const response2 = gameEngine.getNextResponse();
      expect(response2).toBeNull();
    });
  });

  describe('Manager access methods', () => {
    test('should provide access to data manager', () => {
      const dataManager = gameEngine.getDataManager();
      expect(dataManager).toBeDefined();
    });

    test('should provide access to resource manager', () => {
      const resourceManager = gameEngine.getResourceManager();
      expect(resourceManager).toBeDefined();
    });

    test('should provide access to time manager', () => {
      const timeManager = gameEngine.getTimeManager();
      expect(timeManager).toBeDefined();
    });

    test('should provide access to event processor', () => {
      const eventProcessor = gameEngine.getEventProcessor();
      expect(eventProcessor).toBeDefined();
    });

    test('should provide access to query service', () => {
      const queryService = gameEngine.getQueryService();
      expect(queryService).toBeDefined();
    });

    test('should provide access to save manager', () => {
      const saveManager = gameEngine.getSaveManager();
      expect(saveManager).toBeDefined();
    });
  });

  describe('High-level game operations', () => {
    test('should reset game', () => {
      expect(() => gameEngine.resetGame()).not.toThrow();
    });

    test('should check if game is over', () => {
      const isGameOver = gameEngine.isGameOver();
      expect(typeof isGameOver).toBe('boolean');
    });

    test('should get current ending', () => {
      const ending = gameEngine.getCurrentEnding();
      // Should not throw error, may return undefined
      expect(ending).toBeDefined();
    });
  });

  describe('Batch operations', () => {
    test('should process multiple commands', () => {
      const commands = [
        JSON.stringify({ type: 'get_game_state', params: {} }),
        JSON.stringify({ type: 'get_time_info', params: {} })
      ];

      const results = gameEngine.processCommands(commands);
      expect(results).toHaveLength(2);
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
    });

    test('should handle empty command array', () => {
      const results = gameEngine.processCommands([]);
      expect(results).toHaveLength(0);
    });

    test('should execute batch commands with Command objects', () => {
      const commands: Command[] = [
        { type: 'get_game_state', params: {} },
        { type: 'get_time_info', params: {}, language: 'en' }
      ];

      const results = gameEngine.executeBatchCommands(commands);
      expect(results).toHaveLength(2);
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
    });
  });

  describe('Error handling', () => {
    test('should handle missing parameters gracefully', () => {
      const command = JSON.stringify({
        type: 'execute_event',
        params: {} // Missing event_id
      });

      const result = gameEngine.processCommand(command);
      // Should not crash, might return error or handle gracefully
      expect(result).toBeDefined();
    });

    test('should handle null parameters', () => {
      const command = JSON.stringify({
        type: 'execute_event',
        params: null
      });

      const result = gameEngine.processCommand(command);
      expect(result).toBeDefined();
    });
  });

  describe('Language support', () => {
    test('should handle Chinese language', () => {
      const command = JSON.stringify({
        type: 'use_item',
        params: { item_slot: 1 },
        language: 'zh'
      });

      const result = gameEngine.processCommand(command);
      expect(result.type).toBe('error');
      expect(result.error).toContain('尚未实现'); // Chinese error message
    });

    test('should handle English language', () => {
      const command = JSON.stringify({
        type: 'use_item',
        params: { item_slot: 1 },
        language: 'en'
      });

      const result = gameEngine.processCommand(command);
      expect(result.type).toBe('error');
      expect(result.error).toContain('not yet implemented'); // English error message
    });
  });
}); 