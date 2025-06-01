import { AvailableEvent } from '../types';
import { LocalizationService } from '../services/LocalizationService';
import { getEventName } from '../../utils';

export class ActionMenuDisplay {
  private localization: LocalizationService;
  private displayedEvents: AvailableEvent[] = [];

  constructor() {
    this.localization = LocalizationService.getInstance();
  }

  displayAvailableActions(availableEvents: AvailableEvent[]): string {
    const texts = this.localization.getTexts();
    const language = this.localization.getCurrentLanguage();
    let output = '';
    this.displayedEvents = [];

    output += '┌─────────────────────────────────────────────────────────────┐\n';
    output += `│ ${texts.availableActions}\n`;
    output += '├─────────────────────────────────────────────────────────────┤\n';
    
    // 当前场景可用事件
    if (availableEvents.length > 0) {
      output += `│ ${texts.currentSceneEvents}\n`;
      let eventIndex = 1; // 从1开始编号，不再避免与场景切换冲突
      
      // 按时间消耗分组显示事件
      const shortEvents = availableEvents.filter(e => e.time_cost <= 2);
      const mediumEvents = availableEvents.filter(e => e.time_cost > 2 && e.time_cost <= 5);
      const longEvents = availableEvents.filter(e => e.time_cost > 5);
      
      if (shortEvents.length > 0) {
        output += `│  ${texts.quickActions}\n`;
        for (const event of shortEvents.slice(0, 5)) {
          output += `│   [${eventIndex}] ${getEventName(event, language)} (${event.time_cost * 0.5}${texts.hour})\n`;
          this.displayedEvents.push(event);
          eventIndex++;
        }
      }
      
      if (mediumEvents.length > 0) {
        output += `│  ${texts.mediumActions}\n`;
        for (const event of mediumEvents.slice(0, 5)) {
          output += `│   [${eventIndex}] ${getEventName(event, language)} (${event.time_cost * 0.5}${texts.hour})\n`;
          this.displayedEvents.push(event);
          eventIndex++;
        }
      }
      
      if (longEvents.length > 0) {
        output += `│  ${texts.longActions}\n`;
        for (const event of longEvents.slice(0, 3)) {
          output += `│   [${eventIndex}] ${getEventName(event, language)} (${event.time_cost * 0.5}${texts.hour})\n`;
          this.displayedEvents.push(event);
          eventIndex++;
        }
      }
    } else {
      output += `│ ${texts.noEventsAvailable}\n`;
    }
    
    output += '├─────────────────────────────────────────────────────────────┤\n';
    output += `│ ${texts.otherActions}\n`;
    output += `│  [s] ${texts.save}    [l] ${texts.load}    [i] ${texts.inventory}    [h] ${texts.help}    [q] ${texts.quit}    [lang] ${texts.switchLang}\n`;
    output += '└─────────────────────────────────────────────────────────────┘\n';
    
    return output;
  }

  getEventByIndex(index: number): AvailableEvent | null {
    const eventArrayIndex = index - 1; // 现在从1开始编号
    if (eventArrayIndex >= 0 && eventArrayIndex < this.displayedEvents.length) {
      return this.displayedEvents[eventArrayIndex];
    }
    return null;
  }

  isLocationCommand(choice: string): number | null {
    // 移除场景切换功能，返回null
    return null;
  }

  isEventCommand(choice: string): number | null {
    const eventIndex = parseInt(choice);
    if (eventIndex >= 1) { // 现在从1开始
      return eventIndex;
    }
    return null;
  }

  isSystemCommand(choice: string): string | null {
    const validCommands = ['s', 'l', 'i', 'h', 'q', 'lang'];
    if (validCommands.includes(choice.toLowerCase())) {
      return choice.toLowerCase();
    }
    return null;
  }
} 