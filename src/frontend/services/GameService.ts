import { sendCommand } from '../../index';
import {
  GameState,
  AvailableEvent,
  EventResult,
  InventoryItem,
  LocationInfo,
  SaveData,
  Language,
  GameCommand,
  GameResponse
} from '../types';

export class GameService {
  private currentLanguage: Language = 'zh';

  setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  private sendCommand(command: GameCommand): GameResponse {
    try {
      const commandStr = JSON.stringify({
        ...command,
        language: command.language || this.currentLanguage
      });
      const response = sendCommand(commandStr);
      return JSON.parse(response);
    } catch (error: any) {
      return {
        type: 'error',
        error: error.message || 'Unknown error'
      };
    }
  }

  async getGameState(): Promise<GameState | null> {
    const response = this.sendCommand({ type: 'get_game_state' });
    if (response.type === 'query_result') {
      return response.data;
    }
    return null;
  }

  async getAvailableEvents(): Promise<AvailableEvent[]> {
    const response = this.sendCommand({ 
      type: 'query_available_events',
      language: this.currentLanguage
    });
    if (response.type === 'query_result') {
      return response.data.available_events || [];
    }
    return [];
  }

  async getCurrentLocation(): Promise<LocationInfo | null> {
    const response = this.sendCommand({ 
      type: 'query_location',
      language: this.currentLanguage
    });
    
    if (response.type === 'query_result') {
      return response.data;
    }
    
    // Fallback to default location names if query fails
    const gameState = await this.getGameState();
    if (gameState) {
      const locationId = gameState.resources[61] || 1;
      const locationNames = this.currentLanguage === 'zh' ? 
        ['', '公司', '商店', '家', '公园', '餐馆', '医院'] :
        ['', 'Company', 'Store', 'Home', 'Park', 'Restaurant', 'Hospital'];
      return {
        location_name: locationNames[locationId] || (this.currentLanguage === 'zh' ? '未知位置' : 'Unknown Location'),
        location_id: locationId
      };
    }
    
    return null;
  }

  async executeEvent(eventId: number): Promise<EventResult> {
    const response = this.sendCommand({
      type: 'execute_event',
      params: { event_id: eventId },
      language: this.currentLanguage
    });

    if (response.type === 'event_result') {
      return {
        success: true,
        game_text: response.data.game_text,
        time_cost: response.data.time_cost || 0,
        resource_changes: response.data.resource_changes,
        temporary_events: response.data.temporary_events,
        scheduled_tasks: response.data.scheduled_tasks
      };
    } else {
      return {
        success: false,
        time_cost: 0,
        game_text: response.error || (this.currentLanguage === 'zh' ? '未知错误' : 'Unknown error')
      };
    }
  }

  async changeLocation(locationId: number): Promise<EventResult> {
    return this.executeEvent(locationId);
  }

  async saveGame(): Promise<SaveData | null> {
    const response = this.sendCommand({ type: 'save_game' });
    if (response.type === 'save_result') {
      return response.data;
    }
    return null;
  }

  async loadGame(saveData: string): Promise<boolean> {
    const response = this.sendCommand({
      type: 'load_game',
      params: { save_data: saveData }
    });
    return response.type === 'load_result';
  }

  async getInventory(): Promise<InventoryItem[]> {
    const response = this.sendCommand({ type: 'query_inventory' });
    if (response.type === 'query_result') {
      return response.data.inventory || [];
    }
    return [];
  }

  async useItem(itemId: number): Promise<EventResult> {
    const response = this.sendCommand({
      type: 'use_item',
      params: { item_id: itemId }
    });

    if (response.type === 'event_result') {
      return {
        success: true,
        game_text: response.data.game_text,
        time_cost: response.data.time_cost || 0,
        resource_changes: response.data.resource_changes
      };
    } else {
      return {
        success: false,
        time_cost: 0,
        game_text: response.error || (this.currentLanguage === 'zh' ? '使用物品失败' : 'Failed to use item')
      };
    }
  }
} 