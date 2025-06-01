import { ResourceManager } from '../../src/managers/ResourceManager';
import { GameDataManager } from '../../src/managers/GameDataManager';
import { Resource, GameState } from '../../src/types';

// Mock GameDataManager
jest.mock('../../src/managers/GameDataManager');

describe('ResourceManager', () => {
  let resourceManager: ResourceManager;
  let mockDataManager: jest.Mocked<GameDataManager>;

  const mockResources = new Map<number, Resource>([
    [1, {
      resource_id: 1,
      resource_name: '时间',
      resource_name_en: 'Time',
      resource_type: 'system',
      initial_value: 0,
      max_value: 9999,
      min_value: 0,
      description: '游戏时间'
    }],
    [2, {
      resource_id: 2,
      resource_name: '金钱',
      resource_name_en: 'Money',
      resource_type: 'basic',
      initial_value: 3000,
      max_value: 999999,
      min_value: 0,
      description: '玩家的金钱'
    }],
    [13, {
      resource_id: 13,
      resource_name: '健康',
      resource_name_en: 'Health',
      resource_type: 'basic',
      initial_value: 100,
      max_value: 100,
      min_value: 0,
      description: '玩家的健康值'
    }]
  ]);

  beforeEach(() => {
    mockDataManager = new GameDataManager() as jest.Mocked<GameDataManager>;
    
    // Mock the methods
    mockDataManager.getAllResources.mockReturnValue(mockResources);
    mockDataManager.getAllTemporaryEvents.mockReturnValue(new Map());
    mockDataManager.getAllScheduledTasks.mockReturnValue(new Map());
    mockDataManager.getResource.mockImplementation((id: number) => mockResources.get(id));

    resourceManager = new ResourceManager(mockDataManager);
  });

  describe('Initialization', () => {
    test('should initialize with correct resource values', () => {
      expect(resourceManager.getResourceValue(1)).toBe(0);   // Time
      expect(resourceManager.getResourceValue(2)).toBe(3000); // Money
      expect(resourceManager.getResourceValue(13)).toBe(100); // Health
    });

    test('should initialize game state correctly', () => {
      const gameState = resourceManager.getGameState();
      expect(gameState.game_over).toBe(false);
      expect(gameState.current_ending).toBeUndefined();
      expect(gameState.resources).toEqual({
        1: 0,
        2: 3000,
        13: 100
      });
    });
  });

  describe('Resource value operations', () => {
    test('should get resource values correctly', () => {
      expect(resourceManager.getResourceValue(2)).toBe(3000);
      expect(resourceManager.getResourceValue(999)).toBe(0); // Non-existent resource
    });

    test('should set resource values correctly', () => {
      resourceManager.setResourceValue(2, 5000);
      expect(resourceManager.getResourceValue(2)).toBe(5000);
    });

    test('should clamp resource values to min/max bounds', () => {
      // Test max bound
      resourceManager.setResourceValue(13, 150); // Health max is 100
      expect(resourceManager.getResourceValue(13)).toBe(100);

      // Test min bound
      resourceManager.setResourceValue(13, -50); // Health min is 0
      expect(resourceManager.getResourceValue(13)).toBe(0);
    });

    test('should change resource values and return actual change', () => {
      const initialValue = resourceManager.getResourceValue(2);
      const actualChange = resourceManager.changeResourceValue(2, 500);
      
      expect(actualChange).toBe(500);
      expect(resourceManager.getResourceValue(2)).toBe(initialValue + 500);
    });

    test('should handle resource changes that exceed bounds', () => {
      // Test exceeding max bound
      resourceManager.setResourceValue(13, 90);
      const actualChange = resourceManager.changeResourceValue(13, 20); // Would be 110, but max is 100
      
      expect(actualChange).toBe(10); // Only increased by 10 to reach max
      expect(resourceManager.getResourceValue(13)).toBe(100);

      // Test exceeding min bound
      resourceManager.setResourceValue(13, 10);
      const actualChange2 = resourceManager.changeResourceValue(13, -20); // Would be -10, but min is 0
      
      expect(actualChange2).toBe(-10); // Only decreased by 10 to reach min
      expect(resourceManager.getResourceValue(13)).toBe(0);
    });
  });

  describe('Game state operations', () => {
    test('should get and set game state', () => {
      const newState: GameState = {
        resources: { 1: 100, 2: 2000 },
        temporary_event_triggers: { 1: 5 },
        last_task_triggers: { 1: 1000 },
        game_over: true,
        current_ending: undefined
      };

      resourceManager.setGameState(newState);
      const retrievedState = resourceManager.getGameState();
      
      expect(retrievedState).toEqual(newState);
      expect(retrievedState).not.toBe(newState); // Should be a copy
    });

    test('should manage game over state', () => {
      expect(resourceManager.isGameOver()).toBe(false);
      
      resourceManager.setGameOver(true);
      expect(resourceManager.isGameOver()).toBe(true);
      
      resourceManager.setGameOver(false);
      expect(resourceManager.isGameOver()).toBe(false);
    });

    test('should manage current ending', () => {
      const mockEnding = { ending_id: 1, ending_name: 'Test Ending' };
      
      expect(resourceManager.getCurrentEnding()).toBeUndefined();
      
      resourceManager.setCurrentEnding(mockEnding);
      expect(resourceManager.getCurrentEnding()).toBe(mockEnding);
    });
  });

  describe('Temporary event triggers', () => {
    test('should track temporary event trigger counts', () => {
      expect(resourceManager.getTemporaryEventTriggerCount(1)).toBe(0);
      
      resourceManager.incrementTemporaryEventTrigger(1);
      expect(resourceManager.getTemporaryEventTriggerCount(1)).toBe(1);
      
      resourceManager.incrementTemporaryEventTrigger(1);
      expect(resourceManager.getTemporaryEventTriggerCount(1)).toBe(2);
    });

    test('should handle non-existent temporary events', () => {
      expect(resourceManager.getTemporaryEventTriggerCount(999)).toBe(0);
      
      resourceManager.incrementTemporaryEventTrigger(999);
      expect(resourceManager.getTemporaryEventTriggerCount(999)).toBe(1);
    });
  });

  describe('Scheduled task triggers', () => {
    test('should track last task trigger times', () => {
      expect(resourceManager.getLastTaskTriggerTime(1)).toBe(0);
      
      resourceManager.setLastTaskTriggerTime(1, 1500);
      expect(resourceManager.getLastTaskTriggerTime(1)).toBe(1500);
    });

    test('should handle non-existent tasks', () => {
      expect(resourceManager.getLastTaskTriggerTime(999)).toBe(0);
      
      resourceManager.setLastTaskTriggerTime(999, 2000);
      expect(resourceManager.getLastTaskTriggerTime(999)).toBe(2000);
    });
  });

  describe('Inventory operations', () => {
    test('should get inventory slot information', () => {
      // Set up some inventory data
      resourceManager.setResourceValue(3, 101); // Item ID in slot 1
      resourceManager.setResourceValue(4, 5);   // Quantity in slot 1
      
      const slot = resourceManager.getInventorySlot(1);
      expect(slot).toEqual({ itemId: 101, quantity: 5 });
    });

    test('should handle empty inventory slots', () => {
      const slot = resourceManager.getInventorySlot(1);
      expect(slot).toEqual({ itemId: 0, quantity: 0 });
    });

    test('should add items to inventory', () => {
      const success = resourceManager.addItemToInventory('food', 3);
      expect(success).toBe(true);
      
      // Check that the item was added to the first available slot
      const slot = resourceManager.getInventorySlot(1);
      expect(slot.quantity).toBe(3);
    });
  });

  describe('Utility methods', () => {
    test('should get all resource values', () => {
      resourceManager.setResourceValue(1, 100);
      resourceManager.setResourceValue(2, 2500);
      
      const allValues = resourceManager.getAllResourceValues();
      expect(allValues).toEqual({
        1: 100,
        2: 2500,
        13: 100
      });
      expect(allValues).not.toBe(resourceManager['gameState'].resources); // Should be a copy
    });

    test('should reset to initial state', () => {
      // Modify some values
      resourceManager.setResourceValue(2, 5000);
      resourceManager.setGameOver(true);
      resourceManager.incrementTemporaryEventTrigger(1);
      
      // Reset
      resourceManager.resetToInitialState();
      
      // Check that values are back to initial state
      expect(resourceManager.getResourceValue(2)).toBe(3000);
      expect(resourceManager.isGameOver()).toBe(false);
      expect(resourceManager.getTemporaryEventTriggerCount(1)).toBe(0);
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle resources without bounds gracefully', () => {
      // Mock a resource without proper bounds
      mockDataManager.getResource.mockReturnValue(undefined);
      
      resourceManager.setResourceValue(999, 100);
      expect(resourceManager.getResourceValue(999)).toBe(100); // Should not clamp
    });

    test('should handle negative resource IDs', () => {
      expect(resourceManager.getResourceValue(-1)).toBe(0);
      
      resourceManager.setResourceValue(-1, 100);
      expect(resourceManager.getResourceValue(-1)).toBe(100);
    });

    test('should handle very large numbers', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      resourceManager.setResourceValue(1, largeNumber);
      expect(resourceManager.getResourceValue(1)).toBe(9999); // Clamped to max
    });
  });
}); 