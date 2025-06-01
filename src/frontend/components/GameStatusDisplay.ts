import { GameState, LocationInfo } from '../types';
import { LocalizationService } from '../services/LocalizationService';

export class GameStatusDisplay {
  private localization: LocalizationService;

  constructor() {
    this.localization = LocalizationService.getInstance();
  }

  displayGameStatus(gameState: GameState, currentLocation: LocationInfo): string {
    if (!gameState) return '';

    const texts = this.localization.getTexts();
    let output = '';

    output += '┌─────────────────────────────────────────────────────────────┐\n';
    output += `│                        ${texts.gameStatus.padEnd(28)}│\n`;
    output += '├─────────────────────────────────────────────────────────────┤\n';
    
    // 时间信息
    const timeInfo = gameState.time_info;
    const weekDay = texts.weekDays[timeInfo.day_of_week];
    const dayType = timeInfo.is_weekend ? texts.weekend : texts.workday;
    const timeOfDay = timeInfo.is_night ? texts.night : texts.day;
    output += `│ ${texts.time}: ${timeInfo.time_display || '07:00'} ${weekDay} (${dayType}) (${timeOfDay})\n`;
    output += `│ ${texts.location}: ${currentLocation?.location_name || 'Unknown'}\n`;
    output += '├─────────────────────────────────────────────────────────────┤\n';
    
    // 基础属性 - 使用正确的资源索引（从1开始）
    const resources = gameState.resources;
    output += `│ 💰 ${texts.money}: ${resources[2] || 0}     ❤️  ${texts.health}: ${resources[13] || 0}/100     😴 ${texts.fatigue}: ${resources[14] || 0}/100\n`;
    output += `│ 🍽️  ${texts.hunger}: ${resources[15] || 0}/100     🧠 ${texts.rational}: ${resources[16] || 0}/100     💖 ${texts.emotional}: ${resources[17] || 0}/100\n`;
    output += `│ 🎯 ${texts.focus}: ${resources[18] || 0}/100     😊 ${texts.mood}: ${resources[19] || 0}/100    🔧 ${texts.skill}: ${resources[20] || 0}/100\n`;
    output += `│ 👔 ${texts.jobLevel}: ${resources[22] || 0}/10     📊 ${texts.project}: ${resources[23] || 0}/100    😠 ${texts.boss}: ${resources[21] || 0}/100\n`;
    
    // 社交属性
    if (resources[70] || resources[71] || resources[72]) {
      output += '├─────────────────────────────────────────────────────────────┤\n';
      output += `│ 🤝 ${texts.socialInfluence}: ${resources[70] || 0}/100  🏆 ${texts.techReputation}: ${resources[71] || 0}/100  🤔 ${texts.philosophyInsight}: ${resources[72] || 0}/100\n`;
    }
    
    output += '└─────────────────────────────────────────────────────────────┘\n';
    
    return output;
  }

  displayGameOver(gameState: GameState): string {
    const texts = this.localization.getTexts();
    let output = '';

    output += '┌─────────────────────────────────────────────────────────────┐\n';
    output += '│                        游戏结束                             │\n';
    output += '├─────────────────────────────────────────────────────────────┤\n';
    
    if (gameState?.current_ending) {
      output += `│ 结局: ${gameState.current_ending.ending_name}                    │\n`;
      output += `│ 描述: ${gameState.current_ending.description}                   │\n`;
    } else {
      const thankYouMessage = this.localization.getCurrentLanguage() === 'zh' ? 
        '感谢您的游玩！' : 'Thank you for playing!';
      output += `│ ${thankYouMessage}                                              │\n`;
    }
    
    output += '└─────────────────────────────────────────────────────────────┘\n';
    
    return output;
  }

  displayInventory(inventory: any[]): string {
    const texts = this.localization.getTexts();
    let output = '';

    output += '┌─────────────────────────────────────────────────────────────┐\n';
    output += '│                        物品栏                               │\n';
    output += '├─────────────────────────────────────────────────────────────┤\n';
    
    if (inventory.length === 0) {
      const emptyMessage = this.localization.getCurrentLanguage() === 'zh' ? 
        '物品栏为空' : 'Inventory is empty';
      output += `│ ${emptyMessage}                                                  │\n`;
    } else {
      for (const item of inventory) {
        const slotText = this.localization.getCurrentLanguage() === 'zh' ? '槽位' : 'Slot';
        output += `│ ${slotText}${item.slot}: ${item.item_name} x${item.quantity}                    │\n`;
      }
    }
    output += '└─────────────────────────────────────────────────────────────┘\n';
    
    return output;
  }
} 