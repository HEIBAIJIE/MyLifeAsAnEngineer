import { GameState } from '../types';
import { ResourceManager } from './ResourceManager';
import { base64Encode, base64Decode } from '../utils';

export class SaveManager {
  private resourceManager: ResourceManager;

  constructor(resourceManager: ResourceManager) {
    this.resourceManager = resourceManager;
  }

  saveGame(): { type: string; data?: { save_data: string }; error?: string } {
    try {
      const gameState = this.resourceManager.getGameState();
      const stateStr = JSON.stringify(gameState);
      const saveData = base64Encode(stateStr);
      
      return {
        type: 'game_saved',
        data: { save_data: saveData }
      };
    } catch (error) {
      return {
        type: 'error',
        error: 'Failed to save game: ' + (error as Error).message
      };
    }
  }

  loadGame(saveData: string): { type: string; data?: { success: boolean }; error?: string } {
    try {
      const stateStr = base64Decode(saveData);
      const gameState: any = JSON.parse(stateStr);
      
      // Validate the game state structure
      if (!this.isValidGameState(gameState)) {
        // Provide detailed error information for debugging
        const errors = [];
        if (!gameState || typeof gameState !== 'object') {
          errors.push('gameState is not an object');
        } else {
          if (gameState.resources === null || gameState.resources === undefined || typeof gameState.resources !== 'object') {
            errors.push('resources field is missing or invalid');
          }
          if (gameState.temporary_event_triggers === null || gameState.temporary_event_triggers === undefined || typeof gameState.temporary_event_triggers !== 'object') {
            errors.push('temporary_event_triggers field is missing or invalid');
          }
          if (gameState.last_task_triggers === null || gameState.last_task_triggers === undefined || typeof gameState.last_task_triggers !== 'object') {
            errors.push('last_task_triggers field is missing or invalid');
          }
          if (typeof gameState.game_over !== 'boolean') {
            errors.push('game_over field is missing or invalid');
          }
        }
        
        console.log('Invalid save data format. Errors:', errors);
        console.log('Received gameState:', gameState);
        
        return {
          type: 'error',
          error: 'Invalid save data format: ' + errors.join(', ')
        };
      }
      
      this.resourceManager.setGameState(gameState as GameState);
      
      return {
        type: 'game_loaded',
        data: { success: true }
      };
    } catch (error) {
      console.log('Failed to load game:', error);
      console.log('Save data length:', saveData.length);
      console.log('Save data preview:', saveData.substring(0, 100) + '...');
      
      return {
        type: 'error',
        error: 'Failed to load game: ' + (error as Error).message
      };
    }
  }

  private isValidGameState(state: any): state is GameState {
    return (
      state &&
      typeof state === 'object' &&
      state.resources !== null && 
      state.resources !== undefined &&
      typeof state.resources === 'object' &&
      state.temporary_event_triggers !== null &&
      state.temporary_event_triggers !== undefined &&
      typeof state.temporary_event_triggers === 'object' &&
      state.last_task_triggers !== null &&
      state.last_task_triggers !== undefined &&
      typeof state.last_task_triggers === 'object' &&
      typeof state.game_over === 'boolean'
    );
  }

  // Create a quick save
  createQuickSave(): string {
    const gameState = this.resourceManager.getGameState();
    const stateStr = JSON.stringify(gameState);
    return base64Encode(stateStr);
  }

  // Load from quick save
  loadQuickSave(saveData: string): boolean {
    try {
      const stateStr = base64Decode(saveData);
      const gameState: GameState = JSON.parse(stateStr);
      
      if (!this.isValidGameState(gameState)) {
        return false;
      }
      
      this.resourceManager.setGameState(gameState);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Export game state for debugging or analysis
  exportGameState(): string {
    const gameState = this.resourceManager.getGameState();
    return JSON.stringify(gameState, null, 2);
  }

  // Import game state from JSON (for debugging)
  importGameState(jsonStr: string): boolean {
    try {
      const gameState: GameState = JSON.parse(jsonStr);
      
      if (!this.isValidGameState(gameState)) {
        return false;
      }
      
      this.resourceManager.setGameState(gameState);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Create a checkpoint with metadata
  createCheckpoint(name: string, description?: string) {
    const gameState = this.resourceManager.getGameState();
    const checkpoint = {
      name,
      description: description || '',
      timestamp: Date.now(),
      gameState
    };
    
    return {
      checkpoint,
      saveData: base64Encode(JSON.stringify(checkpoint))
    };
  }

  // Load from checkpoint
  loadCheckpoint(saveData: string): { success: boolean; checkpoint?: any; error?: string } {
    try {
      const checkpointStr = base64Decode(saveData);
      const checkpoint = JSON.parse(checkpointStr);
      
      if (!checkpoint.gameState || !this.isValidGameState(checkpoint.gameState)) {
        return { success: false, error: 'Invalid checkpoint format' };
      }
      
      this.resourceManager.setGameState(checkpoint.gameState);
      
      return { success: true, checkpoint };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to load checkpoint: ' + (error as Error).message 
      };
    }
  }
} 