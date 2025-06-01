import { AvailableEntity, EntityEvent, EntityEventsData } from '../types';
import { LocalizationService } from '../services/LocalizationService';

export class EntityMenuDisplay {
  private localization: LocalizationService;
  private displayedEntities: AvailableEntity[] = [];
  private displayedEvents: EntityEvent[] = [];
  private currentMode: 'entities' | 'events' = 'entities';
  private currentEntityData: EntityEventsData | null = null;

  constructor() {
    this.localization = LocalizationService.getInstance();
  }

  displayAvailableEntities(availableEntities: AvailableEntity[]): string {
    this.currentMode = 'entities';
    this.displayedEntities = [];
    const texts = this.localization.getTexts();
    const language = this.localization.getCurrentLanguage();
    let output = '';

    output += '┌─────────────────────────────────────────────────────────────┐\n';
    output += `│ ${language === 'zh' ? '可交互实体' : 'Available Entities'}\n`;
    output += '├─────────────────────────────────────────────────────────────┤\n';
    
    if (availableEntities.length > 0) {
      let entityIndex = 1;
      
      // 按类型分组显示实体
      const persons = availableEntities.filter(e => e.entity_type === 'person' && e.can_interact);
      const objects = availableEntities.filter(e => e.entity_type === 'object' && e.can_interact);
      const facilities = availableEntities.filter(e => e.entity_type === 'facility' && e.can_interact);
      
      if (persons.length > 0) {
        output += `│  ${language === 'zh' ? '👥 人物:' : '👥 People:'}\n`;
        for (const entity of persons) {
          const entityName = language === 'zh' ? entity.entity_name : entity.entity_name_en;
          const eventsCount = entity.available_events_count;
          output += `│   [${entityIndex}] ${entityName} (${eventsCount}${language === 'zh' ? '个选项' : ' options'})\n`;
          this.displayedEntities.push(entity);
          entityIndex++;
        }
      }
      
      if (objects.length > 0) {
        output += `│  ${language === 'zh' ? '📦 物品:' : '📦 Objects:'}\n`;
        for (const entity of objects) {
          const entityName = language === 'zh' ? entity.entity_name : entity.entity_name_en;
          const eventsCount = entity.available_events_count;
          output += `│   [${entityIndex}] ${entityName} (${eventsCount}${language === 'zh' ? '个选项' : ' options'})\n`;
          this.displayedEntities.push(entity);
          entityIndex++;
        }
      }
      
      if (facilities.length > 0) {
        output += `│  ${language === 'zh' ? '🏢 设施:' : '🏢 Facilities:'}\n`;
        for (const entity of facilities) {
          const entityName = language === 'zh' ? entity.entity_name : entity.entity_name_en;
          const eventsCount = entity.available_events_count;
          output += `│   [${entityIndex}] ${entityName} (${eventsCount}${language === 'zh' ? '个选项' : ' options'})\n`;
          this.displayedEntities.push(entity);
          entityIndex++;
        }
      }

      // 显示无法交互的实体
      const unavailableEntities = availableEntities.filter(e => !e.can_interact);
      if (unavailableEntities.length > 0) {
        output += `│  ${language === 'zh' ? '❌ 暂时无法交互:' : '❌ Currently unavailable:'}\n`;
        for (const entity of unavailableEntities) {
          const entityName = language === 'zh' ? entity.entity_name : entity.entity_name_en;
          output += `│   - ${entityName}\n`;
        }
      }
    } else {
      output += `│ ${language === 'zh' ? '当前位置没有可交互的实体' : 'No entities available at current location'}\n`;
    }
    
    output += '├─────────────────────────────────────────────────────────────┤\n';
    output += `│ ${texts.otherActions}\n`;
    output += `│  [s] ${texts.save}    [l] ${texts.load}    [i] ${texts.inventory}    [h] ${texts.help}    [q] ${texts.quit}    [lang] ${texts.switchLang}\n`;
    output += '└─────────────────────────────────────────────────────────────┘\n';
    
    return output;
  }

  displayEntityEvents(entityData: EntityEventsData): string {
    this.currentMode = 'events';
    this.currentEntityData = entityData;
    this.displayedEvents = [];
    const language = this.localization.getCurrentLanguage();
    const texts = this.localization.getTexts();
    let output = '';

    const entityName = language === 'zh' ? entityData.entity_name : entityData.entity_name_en;

    output += '┌─────────────────────────────────────────────────────────────┐\n';
    output += `│ ${language === 'zh' ? '与' : 'Interact with'} ${entityName} ${language === 'zh' ? '的交互选项' : ''}\n`;
    output += '├─────────────────────────────────────────────────────────────┤\n';
    
    if (entityData.available_events.length > 0) {
      let eventIndex = 1;
      
      // 按时间消耗分组显示事件
      const executableEvents = entityData.available_events.filter(e => e.can_execute);
      const nonExecutableEvents = entityData.available_events.filter(e => !e.can_execute);
      
      if (executableEvents.length > 0) {
        const shortEvents = executableEvents.filter(e => e.time_cost <= 2);
        const mediumEvents = executableEvents.filter(e => e.time_cost > 2 && e.time_cost <= 5);
        const longEvents = executableEvents.filter(e => e.time_cost > 5);
        
        if (shortEvents.length > 0) {
          output += `│  ${texts.quickActions}\n`;
          for (const event of shortEvents) {
            const eventName = language === 'zh' ? event.event_name_cn : event.event_name_en;
            output += `│   [${eventIndex}] ${eventName} (${event.time_cost * 0.5}${texts.hour})\n`;
            this.displayedEvents.push(event);
            eventIndex++;
          }
        }
        
        if (mediumEvents.length > 0) {
          output += `│  ${texts.mediumActions}\n`;
          for (const event of mediumEvents) {
            const eventName = language === 'zh' ? event.event_name_cn : event.event_name_en;
            output += `│   [${eventIndex}] ${eventName} (${event.time_cost * 0.5}${texts.hour})\n`;
            this.displayedEvents.push(event);
            eventIndex++;
          }
        }
        
        if (longEvents.length > 0) {
          output += `│  ${texts.longActions}\n`;
          for (const event of longEvents) {
            const eventName = language === 'zh' ? event.event_name_cn : event.event_name_en;
            output += `│   [${eventIndex}] ${eventName} (${event.time_cost * 0.5}${texts.hour})\n`;
            this.displayedEvents.push(event);
            eventIndex++;
          }
        }
      }

      if (nonExecutableEvents.length > 0) {
        output += `│  ${language === 'zh' ? '❌ 条件不满足:' : '❌ Requirements not met:'}\n`;
        for (const event of nonExecutableEvents) {
          const eventName = language === 'zh' ? event.event_name_cn : event.event_name_en;
          output += `│   - ${eventName}\n`;
        }
      }
    } else {
      output += `│ ${language === 'zh' ? '此实体暂无可用的交互选项' : 'No interaction options available for this entity'}\n`;
    }
    
    output += '├─────────────────────────────────────────────────────────────┤\n';
    output += `│ ${language === 'zh' ? '其他操作:' : 'Other actions:'}\n`;
    output += `│  [b] ${language === 'zh' ? '返回实体列表' : 'Back to entities'}    [s] ${texts.save}    [l] ${texts.load}    [i] ${texts.inventory}    [h] ${texts.help}    [q] ${texts.quit}\n`;
    output += '└─────────────────────────────────────────────────────────────┘\n';
    
    return output;
  }

  getEntityByIndex(index: number): AvailableEntity | null {
    const entityArrayIndex = index - 1;
    if (entityArrayIndex >= 0 && entityArrayIndex < this.displayedEntities.length) {
      return this.displayedEntities[entityArrayIndex];
    }
    return null;
  }

  getEventByIndex(index: number): EntityEvent | null {
    const eventArrayIndex = index - 1;
    if (eventArrayIndex >= 0 && eventArrayIndex < this.displayedEvents.length) {
      return this.displayedEvents[eventArrayIndex];
    }
    return null;
  }

  getCurrentMode(): 'entities' | 'events' {
    return this.currentMode;
  }

  getCurrentEntityData(): EntityEventsData | null {
    return this.currentEntityData;
  }

  isEntityCommand(choice: string): number | null {
    if (this.currentMode !== 'entities') return null;
    const entityIndex = parseInt(choice);
    if (entityIndex >= 1 && entityIndex <= this.displayedEntities.length) {
      return entityIndex;
    }
    return null;
  }

  isEventCommand(choice: string): number | null {
    if (this.currentMode !== 'events') return null;
    const eventIndex = parseInt(choice);
    if (eventIndex >= 1 && eventIndex <= this.displayedEvents.length) {
      return eventIndex;
    }
    return null;
  }

  isBackCommand(choice: string): boolean {
    return choice.toLowerCase() === 'b' && this.currentMode === 'events';
  }

  isSystemCommand(choice: string): string | null {
    const validCommands = ['s', 'l', 'i', 'h', 'q', 'lang'];
    if (validCommands.includes(choice.toLowerCase())) {
      return choice.toLowerCase();
    }
    return null;
  }
} 