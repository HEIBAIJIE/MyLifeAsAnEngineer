import {
  Resource,
  Event,
  Item,
  Entity,
  TemporaryEvent,
  ScheduledTask,
  Location,
  Ending,
  GameText,
  GameState,
  TimeInfo,
  EventResult,
  TemporaryEventResult,
  ScheduledTaskResult,
  Command,
  CommandType
} from './types';
import { ConditionParser } from './conditionParser';
import { CSVLoader } from './csvLoader';
import { base64Encode, base64Decode, Language, getResourceName, getTaskName, getEventName, getLocalizedText } from './utils';
import { GameDataManager } from './managers/GameDataManager';
import { ResourceManager } from './managers/ResourceManager';
import { TimeManager } from './managers/TimeManager';
import { EventProcessor } from './managers/EventProcessor';
import { QueryService } from './managers/QueryService';
import { SaveManager } from './managers/SaveManager';

export class GameEngine {
  private dataManager: GameDataManager;
  private resourceManager: ResourceManager;
  private timeManager: TimeManager;
  private eventProcessor: EventProcessor;
  private queryService: QueryService;
  private saveManager: SaveManager;
  
  private commandQueue: string[] = [];
  private responseQueue: any[] = [];

  constructor() {
    // Initialize managers in dependency order
    this.dataManager = new GameDataManager();
    this.resourceManager = new ResourceManager(this.dataManager);
    this.timeManager = new TimeManager(this.resourceManager);
    this.eventProcessor = new EventProcessor(this.dataManager, this.resourceManager, this.timeManager);
    this.queryService = new QueryService(this.dataManager, this.resourceManager, this.timeManager);
    this.saveManager = new SaveManager(this.resourceManager);
  }

  // Command processing methods
  processCommand(commandStr: string): any {
    try {
      const command = JSON.parse(commandStr);
      const language = command.language || 'zh'; // 默认中文
      
      switch (command.type) {
        case 'execute_event':
          return this.executeEvent(command.params?.event_id, language);
        case 'query_resource':
          return this.queryService.queryResource(command.params?.resource_id, language);
        case 'query_location':
          return this.queryService.queryLocation(command.params?.location_id, language);
        case 'query_available_events':
          return this.queryService.queryAvailableEvents(language);
        case 'query_inventory':
          return this.queryService.queryInventory(language);
        case 'use_item':
          return this.useItem(command.params?.item_slot, language);
        case 'save_game':
          return this.saveManager.saveGame();
        case 'load_game':
          return this.saveManager.loadGame(command.params?.save_data);
        case 'get_game_state':
          return this.queryService.getGameState();
        case 'get_time_info':
          return this.queryService.getTimeInfo();
        default:
          return { type: 'error', error: 'Unknown command type' };
      }
    } catch (error: any) {
      return { type: 'error', error: error.message || 'Command parse error' };
    }
  }

  private executeEvent(eventId: number, language: 'zh' | 'en' = 'zh') {
    const result = this.eventProcessor.executeEvent(eventId, language);
    
    // 包装成标准响应格式
    if (result.success) {
      return {
        type: 'event_result',
        data: {
          success: result.success,
          event_id: result.event_id,
          event_name: result.event_name,
          text_id: result.text_id,
          game_text: result.text_content, // 前端期望的字段名
          time_cost: result.time_consumed,
          resource_changes: Object.entries(result.resource_changes).map(([resourceId, change]) => ({
            resource_id: parseInt(resourceId),
            resource_name: this.dataManager.getResource(parseInt(resourceId))?.resource_name || `Resource ${resourceId}`,
            change: change
          })),
          temporary_events: result.temporary_events_triggered.map(te => ({
            event_id: te.temp_event_id,
            event_name: te.event_name,
            description: te.text_content
          })),
          scheduled_tasks: result.scheduled_tasks_triggered.map(st => ({
            task_id: st.task_id,
            task_name: st.task_name,
            description: st.text_content
          })),
          ending_triggered: result.ending_triggered
        }
      };
    } else {
      return {
        type: 'error',
        error: result.text_content || 'Event execution failed'
      };
    }
  }

  private useItem(itemSlot: number, language: 'zh' | 'en' = 'zh') {
    // TODO: Implement item usage logic
    const errorMessage = language === 'en' ? 'Item usage not yet implemented' : '物品使用功能尚未实现';
    return {
      type: 'error',
      error: errorMessage
    };
  }

  // Public interface for command queue
  addCommand(command: string) {
    this.commandQueue.push(command);
  }

  getNextResponse(): any | null {
    if (this.responseQueue.length === 0 && this.commandQueue.length > 0) {
      const command = this.commandQueue.shift()!;
      const response = this.processCommand(command);
      this.responseQueue.push(response);
    }
    
    return this.responseQueue.shift() || null;
  }

  // Convenience methods for direct access to managers
  getDataManager(): GameDataManager {
    return this.dataManager;
  }

  getResourceManager(): ResourceManager {
    return this.resourceManager;
  }

  getTimeManager(): TimeManager {
    return this.timeManager;
  }

  getEventProcessor(): EventProcessor {
    return this.eventProcessor;
  }

  getQueryService(): QueryService {
    return this.queryService;
  }

  getSaveManager(): SaveManager {
    return this.saveManager;
  }

  // High-level game operations
  resetGame(): void {
    this.resourceManager.resetToInitialState();
  }

  isGameOver(): boolean {
    return this.resourceManager.isGameOver();
  }

  getCurrentEnding() {
    return this.resourceManager.getCurrentEnding();
  }

  // Advanced command processing
  processCommands(commands: string[]): any[] {
    const results: any[] = [];
    for (const command of commands) {
      results.push(this.processCommand(command));
    }
    return results;
  }

  // Batch operations
  executeBatchCommands(commands: Command[]): any[] {
    const results: any[] = [];
    for (const command of commands) {
      const commandStr = JSON.stringify(command);
      results.push(this.processCommand(commandStr));
    }
    return results;
  }
} 