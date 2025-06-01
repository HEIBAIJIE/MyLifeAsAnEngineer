import { SaveManager } from '../../src/managers/SaveManager';
import { ResourceManager } from '../../src/managers/ResourceManager';
import { TestDataProvider } from '../test-helpers/TestDataProvider';
import { GameState } from '../../src/types';

describe('SaveManager', () => {
  let saveManager: SaveManager;
  let mockResourceManager: jest.Mocked<ResourceManager>;

  beforeEach(() => {
    // Create mock ResourceManager
    mockResourceManager = {
      getGameState: jest.fn(),
      setGameState: jest.fn()
    } as any;

    saveManager = new SaveManager(mockResourceManager);

    // Setup default mock returns
    const defaultGameState = TestDataProvider.getBasicGameState();
    mockResourceManager.getGameState.mockReturnValue(defaultGameState);
  });

  describe('saveGame', () => {
    it('should successfully save game state', () => {
      // Arrange
      const gameState = TestDataProvider.getBasicGameState();
      mockResourceManager.getGameState.mockReturnValue(gameState);

      // Act
      const result = saveManager.saveGame();

      // Assert
      expect(result.type).toBe('game_saved');
      expect(result.data).toBeDefined();
      expect(result.data!.save_data).toBeDefined();
      expect(typeof result.data!.save_data).toBe('string');
      expect(result.data!.save_data.length).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();
    });

    it('should handle save errors gracefully', () => {
      // Arrange
      mockResourceManager.getGameState.mockImplementation(() => {
        throw new Error('Failed to get game state');
      });

      // Act
      const result = saveManager.saveGame();

      // Assert
      expect(result.type).toBe('error');
      expect(result.error).toContain('Failed to save game');
      expect(result.data).toBeUndefined();
    });

    it('should produce consistent save data for same state', () => {
      // Arrange
      const gameState = TestDataProvider.getBasicGameState();
      mockResourceManager.getGameState.mockReturnValue(gameState);

      // Act
      const result1 = saveManager.saveGame();
      const result2 = saveManager.saveGame();

      // Assert
      expect(result1.data!.save_data).toBe(result2.data!.save_data);
    });
  });

  describe('loadGame', () => {
    it('should successfully load valid save data', () => {
      // Arrange
      const originalState = TestDataProvider.getBasicGameState();
      mockResourceManager.getGameState.mockReturnValue(originalState);
      
      const saveResult = saveManager.saveGame();
      const saveData = saveResult.data!.save_data;

      // Act
      const loadResult = saveManager.loadGame(saveData);

      // Assert
      expect(loadResult.type).toBe('game_loaded');
      expect(loadResult.data).toBeDefined();
      expect(loadResult.data!.success).toBe(true);
      expect(loadResult.error).toBeUndefined();
      expect(mockResourceManager.setGameState).toHaveBeenCalledWith(originalState);
    });

    it('should reject invalid save data format', () => {
      // Arrange
      const invalidSaveData = 'invalid_base64_data';

      // Act
      const result = saveManager.loadGame(invalidSaveData);

      // Assert
      expect(result.type).toBe('error');
      expect(result.error).toContain('Failed to load game');
      expect(result.data).toBeUndefined();
      expect(mockResourceManager.setGameState).not.toHaveBeenCalled();
    });

    it('should reject malformed JSON data', () => {
      // Arrange
      const invalidJson = btoa('invalid json data'); // Valid base64 but invalid JSON

      // Act
      const result = saveManager.loadGame(invalidJson);

      // Assert
      expect(result.type).toBe('error');
      expect(result.error).toContain('Failed to load game');
      expect(mockResourceManager.setGameState).not.toHaveBeenCalled();
    });

    it('should reject invalid game state structure', () => {
      // Arrange
      const invalidGameState = { invalid: 'structure' };
      const invalidSaveData = btoa(JSON.stringify(invalidGameState));

      // Act
      const result = saveManager.loadGame(invalidSaveData);

      // Assert
      expect(result.type).toBe('error');
      expect(result.error).toBe('Invalid save data format');
      expect(mockResourceManager.setGameState).not.toHaveBeenCalled();
    });

    it('should handle ResourceManager errors during load', () => {
      // Arrange
      const validState = TestDataProvider.getBasicGameState();
      const validSaveData = btoa(JSON.stringify(validState));
      
      mockResourceManager.setGameState.mockImplementation(() => {
        throw new Error('Failed to set game state');
      });

      // Act
      const result = saveManager.loadGame(validSaveData);

      // Assert
      expect(result.type).toBe('error');
      expect(result.error).toContain('Failed to load game');
    });
  });

  describe('createQuickSave and loadQuickSave', () => {
    it('should successfully create and load quick save', () => {
      // Arrange
      const gameState = TestDataProvider.createMockGameState({
        time: 600,
        money: 2000,
        skill: 50
      });
      mockResourceManager.getGameState.mockReturnValue(gameState);

      // Act
      const quickSaveData = saveManager.createQuickSave();
      const loadSuccess = saveManager.loadQuickSave(quickSaveData);

      // Assert
      expect(typeof quickSaveData).toBe('string');
      expect(quickSaveData.length).toBeGreaterThan(0);
      expect(loadSuccess).toBe(true);
      expect(mockResourceManager.setGameState).toHaveBeenCalledWith(gameState);
    });

    it('should return false for invalid quick save data', () => {
      // Arrange
      const invalidQuickSave = 'invalid_data';

      // Act
      const result = saveManager.loadQuickSave(invalidQuickSave);

      // Assert
      expect(result).toBe(false);
      expect(mockResourceManager.setGameState).not.toHaveBeenCalled();
    });

    it('should handle quick save errors gracefully', () => {
      // Arrange
      const invalidGameState = { malformed: true };
      const invalidQuickSave = btoa(JSON.stringify(invalidGameState));

      // Act
      const result = saveManager.loadQuickSave(invalidQuickSave);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('exportGameState and importGameState', () => {
    it('should export game state as readable JSON', () => {
      // Arrange
      const gameState = TestDataProvider.getBasicGameState();
      mockResourceManager.getGameState.mockReturnValue(gameState);

      // Act
      const exportedJson = saveManager.exportGameState();
      const parsedState = JSON.parse(exportedJson);

      // Assert
      expect(typeof exportedJson).toBe('string');
      expect(parsedState).toEqual(gameState);
      expect(exportedJson).toContain('\n'); // Should be formatted
    });

    it('should successfully import valid JSON game state', () => {
      // Arrange
      const gameState = TestDataProvider.createMockGameState({
        time: 720,
        health: 80,
        fatigue: 20
      });
      const jsonState = JSON.stringify(gameState);

      // Act
      const result = saveManager.importGameState(jsonState);

      // Assert
      expect(result).toBe(true);
      expect(mockResourceManager.setGameState).toHaveBeenCalledWith(gameState);
    });

    it('should reject invalid JSON format', () => {
      // Arrange
      const invalidJson = 'invalid json format';

      // Act
      const result = saveManager.importGameState(invalidJson);

      // Assert
      expect(result).toBe(false);
      expect(mockResourceManager.setGameState).not.toHaveBeenCalled();
    });

    it('should reject invalid game state structure in JSON', () => {
      // Arrange
      const invalidState = { invalid: 'structure' };
      const invalidJson = JSON.stringify(invalidState);

      // Act
      const result = saveManager.importGameState(invalidJson);

      // Assert
      expect(result).toBe(false);
      expect(mockResourceManager.setGameState).not.toHaveBeenCalled();
    });
  });

  describe('createCheckpoint and loadCheckpoint', () => {
    it('should create checkpoint with metadata', () => {
      // Arrange
      const gameState = TestDataProvider.getBasicGameState();
      mockResourceManager.getGameState.mockReturnValue(gameState);
      const checkpointName = 'Before Boss Fight';
      const description = 'Right before the important meeting';

      // Act
      const result = saveManager.createCheckpoint(checkpointName, description);

      // Assert
      expect(result.checkpoint).toBeDefined();
      expect(result.checkpoint.name).toBe(checkpointName);
      expect(result.checkpoint.description).toBe(description);
      expect(result.checkpoint.timestamp).toBeDefined();
      expect(result.checkpoint.gameState).toEqual(gameState);
      expect(result.saveData).toBeDefined();
      expect(typeof result.saveData).toBe('string');
    });

    it('should create checkpoint with default description', () => {
      // Arrange
      const gameState = TestDataProvider.getBasicGameState();
      mockResourceManager.getGameState.mockReturnValue(gameState);
      const checkpointName = 'Auto Save';

      // Act
      const result = saveManager.createCheckpoint(checkpointName);

      // Assert
      expect(result.checkpoint.name).toBe(checkpointName);
      expect(result.checkpoint.description).toBe('');
    });

    it('should successfully load valid checkpoint', () => {
      // Arrange
      const gameState = TestDataProvider.createMockGameState({
        time: 900,
        money: 1500,
        skill: 30
      });
      mockResourceManager.getGameState.mockReturnValue(gameState);
      
      const checkpointResult = saveManager.createCheckpoint('Test Checkpoint', 'Test description');
      const checkpointData = checkpointResult.saveData;

      // Act
      const loadResult = saveManager.loadCheckpoint(checkpointData);

      // Assert
      expect(loadResult.success).toBe(true);
      expect(loadResult.checkpoint).toBeDefined();
      expect(loadResult.checkpoint!.name).toBe('Test Checkpoint');
      expect(loadResult.checkpoint!.description).toBe('Test description');
      expect(loadResult.error).toBeUndefined();
      expect(mockResourceManager.setGameState).toHaveBeenCalledWith(gameState);
    });

    it('should reject invalid checkpoint data', () => {
      // Arrange
      const invalidCheckpointData = 'invalid_checkpoint';

      // Act
      const result = saveManager.loadCheckpoint(invalidCheckpointData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.checkpoint).toBeUndefined();
      expect(mockResourceManager.setGameState).not.toHaveBeenCalled();
    });

    it('should reject checkpoint with invalid game state', () => {
      // Arrange
      const invalidCheckpoint = {
        name: 'Test',
        description: 'Test',
        timestamp: Date.now(),
        gameState: { invalid: 'structure' }
      };
      const invalidCheckpointData = btoa(JSON.stringify(invalidCheckpoint));

      // Act
      const result = saveManager.loadCheckpoint(invalidCheckpointData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid checkpoint format');
      expect(mockResourceManager.setGameState).not.toHaveBeenCalled();
    });
  });

  describe('Game State Validation', () => {
    it('should validate complete game state structure', () => {
      // Arrange
      const validState: GameState = {
        resources: { 1: 480, 2: 1000 },
        temporary_event_triggers: { 1: 1 },
        last_task_triggers: { 1: 480 },
        game_over: false,
        current_ending: undefined
      };
      const validSaveData = btoa(JSON.stringify(validState));

      // Act
      const result = saveManager.loadGame(validSaveData);

      // Assert
      expect(result.type).toBe('game_loaded');
      expect(result.data!.success).toBe(true);
    });

    it('should reject state missing required properties', () => {
      // Arrange
      const incompleteState = {
        resources: { 1: 480 },
        // Missing other required properties
      };
      const invalidSaveData = btoa(JSON.stringify(incompleteState));

      // Act
      const result = saveManager.loadGame(invalidSaveData);

      // Assert
      expect(result.type).toBe('error');
      expect(result.error).toBe('Invalid save data format');
    });

    it('should handle edge case with null values', () => {
      // Arrange
      const stateWithNulls = {
        resources: null,
        temporary_event_triggers: {},
        last_task_triggers: {},
        game_over: false
      };
      const invalidSaveData = btoa(JSON.stringify(stateWithNulls));

      // Act
      const result = saveManager.loadGame(invalidSaveData);

      // Assert
      expect(result.type).toBe('error');
      expect(result.error).toBe('Invalid save data format');
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle large game states efficiently', () => {
      // Arrange
      const largeState: GameState = {
        resources: {},
        temporary_event_triggers: {},
        last_task_triggers: {},
        game_over: false,
        current_ending: undefined
      };

      // Create large resource map
      for (let i = 1; i <= 1000; i++) {
        largeState.resources[i] = i * 10;
        largeState.temporary_event_triggers[i] = i;
        largeState.last_task_triggers[i] = i * 60;
      }

      mockResourceManager.getGameState.mockReturnValue(largeState);

      // Act
      const startTime = Date.now();
      const saveResult = saveManager.saveGame();
      const saveTime = Date.now() - startTime;

      const loadStartTime = Date.now();
      const loadResult = saveManager.loadGame(saveResult.data!.save_data);
      const loadTime = Date.now() - loadStartTime;

      // Assert
      expect(saveTime).toBeLessThan(100); // Save should complete within 100ms
      expect(loadTime).toBeLessThan(100); // Load should complete within 100ms
      expect(saveResult.type).toBe('game_saved');
      expect(loadResult.type).toBe('game_loaded');
    });

    it('should maintain data integrity across save/load cycles', () => {
      // Arrange
      const originalState = TestDataProvider.createMockGameState({
        time: 1200,
        money: 5000,
        health: 75,
        fatigue: 40,
        focus: 60,
        skill: 85,
        location: 2,
        gameOver: false
      });
      mockResourceManager.getGameState.mockReturnValue(originalState);

      // Act
      const saveResult = saveManager.saveGame();
      const loadResult = saveManager.loadGame(saveResult.data!.save_data);

      // Assert
      expect(loadResult.type).toBe('game_loaded');
      expect(mockResourceManager.setGameState).toHaveBeenCalledWith(originalState);
      
      // Verify exact state preservation
      const setStateCall = mockResourceManager.setGameState.mock.calls[0][0];
      expect(setStateCall.resources).toEqual(originalState.resources);
      expect(setStateCall.game_over).toBe(originalState.game_over);
    });
  });
}); 