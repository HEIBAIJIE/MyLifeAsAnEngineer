import { Resource, GameState } from '../types';
import { GameDataManager } from './GameDataManager';

export class ResourceManager {
  private gameState: GameState;
  private dataManager: GameDataManager;

  constructor(dataManager: GameDataManager) {
    this.dataManager = dataManager;
    this.gameState = {
      resources: {},
      temporary_event_triggers: {},
      last_task_triggers: {},
      game_over: false,
      current_ending: undefined
    };
    this.initializeResources();
  }

  private initializeResources() {
    // Initialize resource values from data
    this.dataManager.getAllResources().forEach((resource, id) => {
      this.gameState.resources[id] = resource.initial_value;
    });

    // Initialize temporary event triggers
    this.dataManager.getAllTemporaryEvents().forEach((tempEvent, id) => {
      this.gameState.temporary_event_triggers[id] = 0;
    });

    // Initialize scheduled task triggers
    this.dataManager.getAllScheduledTasks().forEach((task, id) => {
      this.gameState.last_task_triggers[id] = 0;
    });
  }

  // Resource value operations
  getResourceValue(resourceId: number): number {
    return this.gameState.resources[resourceId] || 0;
  }

  setResourceValue(resourceId: number, value: number): void {
    const clampedValue = this.clampResourceValue(resourceId, value);
    this.gameState.resources[resourceId] = clampedValue;
  }

  changeResourceValue(resourceId: number, change: number): number {
    const oldValue = this.getResourceValue(resourceId);
    const newValue = this.clampResourceValue(resourceId, oldValue + change);
    this.gameState.resources[resourceId] = newValue;
    return newValue - oldValue; // Return actual change
  }

  private clampResourceValue(resourceId: number, value: number): number {
    const resource = this.dataManager.getResource(resourceId);
    if (!resource) return value;
    
    return Math.max(resource.min_value, Math.min(resource.max_value, value));
  }

  // Game state operations
  getGameState(): GameState {
    return { ...this.gameState };
  }

  setGameState(state: GameState): void {
    this.gameState = { ...state };
  }

  isGameOver(): boolean {
    return this.gameState.game_over;
  }

  setGameOver(isOver: boolean): void {
    this.gameState.game_over = isOver;
  }

  getCurrentEnding() {
    return this.gameState.current_ending;
  }

  setCurrentEnding(ending: any): void {
    this.gameState.current_ending = ending;
  }

  // Temporary event triggers
  getTemporaryEventTriggerCount(eventId: number): number {
    return this.gameState.temporary_event_triggers[eventId] || 0;
  }

  incrementTemporaryEventTrigger(eventId: number): void {
    this.gameState.temporary_event_triggers[eventId] = 
      (this.gameState.temporary_event_triggers[eventId] || 0) + 1;
  }

  // Scheduled task triggers
  getLastTaskTriggerTime(taskId: number): number {
    return this.gameState.last_task_triggers[taskId] || 0;
  }

  setLastTaskTriggerTime(taskId: number, time: number): void {
    this.gameState.last_task_triggers[taskId] = time;
  }

  // Inventory operations
  addItemToInventory(itemType: string, quantity: number): boolean {
    // Find empty slot or existing item to stack
    for (let i = 3; i <= 11; i += 2) {
      const itemId = this.gameState.resources[i] || 0;
      const currentQuantity = this.gameState.resources[i + 1] || 0;
      
      // Empty slot
      if (itemId === 0) {
        // TODO: Convert itemType to itemId
        // this.gameState.resources[i] = convertItemTypeToId(itemType);
        this.gameState.resources[i + 1] = quantity;
        return true;
      }
      
      // Existing item of same type (if we can determine type match)
      // TODO: Implement item stacking logic
    }
    
    return false; // No space available
  }

  getInventorySlot(slot: number): { itemId: number; quantity: number } {
    const slotIndex = 3 + (slot - 1) * 2;
    return {
      itemId: this.gameState.resources[slotIndex] || 0,
      quantity: this.gameState.resources[slotIndex + 1] || 0
    };
  }

  // Utility methods
  getAllResourceValues(): Record<number, number> {
    return { ...this.gameState.resources };
  }

  resetToInitialState(): void {
    this.gameState = {
      resources: {},
      temporary_event_triggers: {},
      last_task_triggers: {},
      game_over: false,
      current_ending: undefined
    };
    this.initializeResources();
  }
} 