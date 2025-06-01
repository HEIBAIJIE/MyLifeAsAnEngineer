import { EventResult } from '../types';
import { LocalizationService } from '../services/LocalizationService';

export class EventResultDisplay {
  private localization: LocalizationService;

  constructor() {
    this.localization = LocalizationService.getInstance();
  }

  displayEventResult(result: EventResult): string {
    const texts = this.localization.getTexts();
    let output = '';

    if (result.success) {
      output += `${texts.success}\n`;
      
      // 显示事件结果
      if (result.game_text) {
        output += `📖 ${result.game_text}\n`;
      }
      
      // 显示资源变化
      if (result.resource_changes && result.resource_changes.length > 0) {
        output += `\n${texts.resourceChanges}\n`;
        for (const change of result.resource_changes) {
          const sign = change.change > 0 ? '+' : '';
          const emoji = this.localization.getResourceEmoji(change.resource_id);
          output += `   ${emoji} ${change.resource_name}: ${sign}${change.change}\n`;
        }
      }
      
      // 显示临时事件
      if (result.temporary_events && result.temporary_events.length > 0) {
        output += `\n${texts.tempEvents}\n`;
        for (const tempEvent of result.temporary_events) {
          output += `   ⚡ ${tempEvent.event_name}: ${tempEvent.description}\n`;
        }
      }
      
      // 显示定时任务
      if (result.scheduled_tasks && result.scheduled_tasks.length > 0) {
        output += `\n${texts.scheduledTasks}\n`;
        for (const task of result.scheduled_tasks) {
          output += `   📅 ${task.task_name}: ${task.description}\n`;
        }
      }
      
    } else {
      output += `${texts.failed} ${result.game_text || (this.localization.getCurrentLanguage() === 'zh' ? '未知错误' : 'Unknown error')}\n`;
    }

    return output;
  }

  displayLocationChange(locationName: string, timeCost: number): string {
    const texts = this.localization.getTexts();
    let output = '';

    output += `🚶 ${this.localization.getCurrentLanguage() === 'zh' ? '正在前往' : 'Moving to'} ${locationName}...\n`;
    output += `✅ ${this.localization.getCurrentLanguage() === 'zh' ? '已到达' : 'Arrived at'} ${locationName}\n`;
    
    if (timeCost > 0) {
      output += `⏰ ${this.localization.getCurrentLanguage() === 'zh' ? '消耗时间:' : 'Time consumed:'} ${timeCost * 0.5} ${texts.hour}\n`;
    }

    return output;
  }

  displayEventConfirmation(eventName: string, timeCost: number): string {
    const texts = this.localization.getTexts();
    let output = '';

    output += `${texts.executing} ${eventName}\n`;
    output += `${texts.estimatedTime} ${timeCost * 0.5} ${texts.hour}\n`;

    return output;
  }

  displaySaveResult(result: { success: boolean; saveData?: string; error?: string }): string {
    const lang = this.localization.getCurrentLanguage();
    let output = '';

    if (result.success && result.saveData) {
      const savedMessage = lang === 'zh' ? '💾 游戏已保存！' : '💾 Game saved!';
      const codeMessage = lang === 'zh' ? '存档代码 (请妥善保存):' : 'Save code (please keep it safe):';
      
      output += `${savedMessage}\n`;
      output += `${codeMessage}\n`;
      output += '─'.repeat(65) + '\n';
      output += `${result.saveData}\n`;
      output += '─'.repeat(65) + '\n';
    } else {
      const errorMessage = lang === 'zh' ? '❌ 保存失败' : '❌ Save failed';
      output += `${errorMessage}`;
      if (result.error) {
        output += `: ${result.error}`;
      }
      output += '\n';
    }

    return output;
  }

  displayLoadResult(result: { success: boolean; error?: string }): string {
    const lang = this.localization.getCurrentLanguage();
    
    if (result.success) {
      return lang === 'zh' ? '📁 游戏读档成功！\n' : '📁 Game loaded successfully!\n';
    } else {
      let errorMessage = lang === 'zh' ? '❌ 读档失败' : '❌ Load failed';
      if (result.error) {
        errorMessage += `: ${result.error}`;
      }
      return errorMessage + '\n';
    }
  }

  displayError(message: string): string {
    const errorPrefix = this.localization.getCurrentLanguage() === 'zh' ? 
      '❌ 无效的选择，请重新输入。' : 
      '❌ Invalid choice, please try again.';
    
    return message || errorPrefix;
  }
} 