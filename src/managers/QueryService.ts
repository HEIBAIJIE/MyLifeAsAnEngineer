import { Event } from '../types';
import { GameDataManager } from './GameDataManager';
import { ResourceManager } from './ResourceManager';
import { TimeManager } from './TimeManager';
import { ConditionParser } from '../conditionParser';
import { Language, getResourceName, getEventName } from '../utils';

export class QueryService {
  private dataManager: GameDataManager;
  private resourceManager: ResourceManager;
  private timeManager: TimeManager;

  constructor(
    dataManager: GameDataManager,
    resourceManager: ResourceManager,
    timeManager: TimeManager
  ) {
    this.dataManager = dataManager;
    this.resourceManager = resourceManager;
    this.timeManager = timeManager;
  }

  queryResource(resourceId: number, language: Language = 'zh') {
    const resource = this.dataManager.getResource(resourceId);
    const value = this.resourceManager.getResourceValue(resourceId);
    
    return {
      type: 'query_result',
      data: {
        resource_id: resourceId,
        resource_name: resource ? getResourceName(resource, language) : 'Unknown',
        value: value,
        max_value: resource?.max_value || 0,
        min_value: resource?.min_value || 0
      }
    };
  }

  queryLocation(locationId?: number, language: Language = 'zh') {
    const currentLocationId = locationId || this.resourceManager.getResourceValue(61);
    const location = this.dataManager.getLocation(currentLocationId);
    
    return {
      type: 'query_result',
      data: {
        location_id: currentLocationId,
        location_name: location?.location_name || 'Unknown',
        available_entities: location?.available_entities || []
      }
    };
  }

  queryAvailableEvents(language: Language = 'zh') {
    const currentLocation = this.resourceManager.getResourceValue(61);
    const conditionParser = new ConditionParser(
      this.resourceManager.getAllResourceValues(),
      this.timeManager.getTimeInfo()
    );
    const availableEvents: Event[] = [];
    
    this.dataManager.getAllEvents().forEach(event => {
      // Check location
      if (event.location_requirement && event.location_requirement !== currentLocation) {
        return;
      }
      
      // Check conditions
      if (!conditionParser.evaluate(event.condition_expression)) {
        return;
      }
      
      availableEvents.push(event);
    });
    
    return {
      type: 'query_result',
      data: {
        available_events: availableEvents.map(e => ({
          event_id: e.event_id,
          event_name_cn: e.event_name_cn,
          event_name_en: e.event_name_en,
          time_cost: e.time_cost
        }))
      }
    };
  }

  queryInventory(language: Language = 'zh') {
    const inventory: Array<{
      slot: number;
      item_id: number;
      item_name: string;
      quantity: number;
    }> = [];
    
    // Check inventory slots (resources 3-12)
    for (let i = 3; i <= 11; i += 2) {
      const itemId = this.resourceManager.getResourceValue(i);
      const quantity = this.resourceManager.getResourceValue(i + 1);
      
      if (itemId > 0 && quantity > 0) {
        const item = this.dataManager.getItem(itemId);
        inventory.push({
          slot: Math.floor((i - 3) / 2) + 1,
          item_id: itemId,
          item_name: item?.item_name || 'Unknown',
          quantity: quantity
        });
      }
    }
    
    return {
      type: 'query_result',
      data: { inventory }
    };
  }

  getGameState() {
    return {
      type: 'query_result',
      data: {
        resources: this.resourceManager.getAllResourceValues(),
        game_over: this.resourceManager.isGameOver(),
        current_ending: this.resourceManager.getCurrentEnding(),
        time_info: this.timeManager.getTimeInfo()
      }
    };
  }

  getTimeInfo() {
    return {
      type: 'query_result',
      data: this.timeManager.getTimeInfo()
    };
  }

  // Advanced query methods
  queryEventsByLocation(locationId: number, language: Language = 'zh') {
    const conditionParser = new ConditionParser(
      this.resourceManager.getAllResourceValues(),
      this.timeManager.getTimeInfo()
    );
    const events: Event[] = [];
    
    this.dataManager.getAllEvents().forEach(event => {
      if (event.location_requirement === locationId) {
        events.push(event);
      }
    });
    
    return {
      type: 'query_result',
      data: {
        location_id: locationId,
        events: events.map(e => ({
          event_id: e.event_id,
          event_name_cn: e.event_name_cn,
          event_name_en: e.event_name_en,
          time_cost: e.time_cost,
          can_execute: conditionParser.evaluate(e.condition_expression)
        }))
      }
    };
  }

  queryResourcesByType(resourceType: string) {
    const resources: Array<{
      resource_id: number;
      resource_name: string;
      current_value: number;
      max_value: number;
      min_value: number;
    }> = [];
    
    this.dataManager.getAllResources().forEach((resource, id) => {
      if (resource.resource_type === resourceType) {
        resources.push({
          resource_id: id,
          resource_name: resource.resource_name,
          current_value: this.resourceManager.getResourceValue(id),
          max_value: resource.max_value,
          min_value: resource.min_value
        });
      }
    });
    
    return {
      type: 'query_result',
      data: { resources }
    };
  }

  queryItemsByType(itemType: string) {
    const items: Array<{
      item_id: number;
      item_name: string;
      price: number;
      description: string;
    }> = [];
    
    this.dataManager.getAllItems().forEach((item, id) => {
      if (item.item_type === itemType) {
        items.push({
          item_id: id,
          item_name: item.item_name,
          price: item.price,
          description: item.description_cn
        });
      }
    });
    
    return {
      type: 'query_result',
      data: { items }
    };
  }

  queryEndingConditions() {
    const conditionParser = new ConditionParser(
      this.resourceManager.getAllResourceValues(),
      this.timeManager.getTimeInfo()
    );
    const endings: Array<{
      ending_id: number;
      ending_name: string;
      ending_type: string;
      can_trigger: boolean;
      trigger_condition: string;
    }> = [];
    
    this.dataManager.getAllEndings().forEach((ending, id) => {
      endings.push({
        ending_id: id,
        ending_name: ending.ending_name,
        ending_type: ending.ending_type,
        can_trigger: conditionParser.evaluate(ending.trigger_condition),
        trigger_condition: ending.trigger_condition
      });
    });
    
    return {
      type: 'query_result',
      data: { endings }
    };
  }

  // New methods for entity-based interaction
  queryAvailableEntities(language: Language = 'zh') {
    const currentLocation = this.resourceManager.getResourceValue(61);
    const conditionParser = new ConditionParser(
      this.resourceManager.getAllResourceValues(),
      this.timeManager.getTimeInfo()
    );
    const availableEntities: Array<{
      entity_id: number;
      entity_name: string;
      entity_name_en: string;
      entity_type: string;
      can_interact: boolean;
      available_events_count: number;
      description?: string;
      description_en?: string;
    }> = [];
    
    this.dataManager.getAllEntities().forEach((entity, id) => {
      if (entity.location === currentLocation) {
        // Check if player can interact with this entity
        const canInteract = conditionParser.evaluate(entity.interaction_requirements || 'always');
        
        // Count available events for this entity
        let availableEventsCount = 0;
        if (canInteract) {
          entity.available_events.forEach(eventId => {
            const event = this.dataManager.getEvent(eventId);
            if (event && conditionParser.evaluate(event.condition_expression)) {
              availableEventsCount++;
            }
          });
        }
        
        availableEntities.push({
          entity_id: id,
          entity_name: entity.entity_name,
          entity_name_en: entity.entity_name_en,
          entity_type: entity.entity_type,
          can_interact: canInteract,
          available_events_count: availableEventsCount,
          description: entity.description,
          description_en: entity.description_en
        });
      }
    });
    
    return {
      type: 'query_result',
      data: {
        location_id: currentLocation,
        available_entities: availableEntities
      }
    };
  }

  queryEntityEvents(entityId: number, language: Language = 'zh') {
    const entity = this.dataManager.getEntity(entityId);
    if (!entity) {
      return {
        type: 'error',
        error: language === 'zh' ? '实体不存在' : 'Entity not found'
      };
    }

    const conditionParser = new ConditionParser(
      this.resourceManager.getAllResourceValues(),
      this.timeManager.getTimeInfo()
    );

    // Check if player can interact with this entity
    const canInteract = conditionParser.evaluate(entity.interaction_requirements || 'always');
    if (!canInteract) {
      return {
        type: 'error',
        error: language === 'zh' ? '无法与此实体交互' : 'Cannot interact with this entity'
      };
    }

    const availableEvents: Array<{
      event_id: number;
      event_name_cn: string;
      event_name_en: string;
      time_cost: number;
      can_execute: boolean;
    }> = [];

    entity.available_events.forEach(eventId => {
      const event = this.dataManager.getEvent(eventId);
      if (event) {
        const canExecute = conditionParser.evaluate(event.condition_expression);
        availableEvents.push({
          event_id: event.event_id,
          event_name_cn: event.event_name_cn,
          event_name_en: event.event_name_en,
          time_cost: event.time_cost,
          can_execute: canExecute
        });
      }
    });

    return {
      type: 'query_result',
      data: {
        entity_id: entityId,
        entity_name: entity.entity_name,
        entity_name_en: entity.entity_name_en,
        available_events: availableEvents
      }
    };
  }
} 