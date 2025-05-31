import * as readline from 'readline';
import { sendCommand } from './src/index';

interface GameState {
  resources: number[];
  game_over: boolean;
  current_ending: any;
  time_info: {
    current_time: number;
    day_of_week: number;
    is_weekend: boolean;
    is_night: boolean;
    time_display: string;
  };
}

interface AvailableEvent {
  event_id: number;
  event_name: string;
  time_cost: number;
}

class GameCLI {
  private rl: readline.Interface;
  private gameState: GameState | null = null;
  private availableEvents: AvailableEvent[] = [];
  private currentLocation: string = '';

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.clear();
    this.showWelcome();
    await this.refreshGameState();
    this.gameLoop();
  }

  private showWelcome() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    My Life As An Engineer                    ║');
    console.log('║                      命令行游戏界面                          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log();
    console.log('欢迎来到《我的工程师生活》！');
    console.log('在这个游戏中，你将扮演一名工程师，体验真实的职场生活。');
    console.log('通过感性和理性两条路径，探索生活的本质和意义。');
    console.log();
  }

  private async refreshGameState() {
    try {
      // 获取游戏状态
      const stateResponse = JSON.parse(sendCommand('{"type":"get_game_state"}'));
      if (stateResponse.type === 'query_result') {
        this.gameState = stateResponse.data;
      }

      // 获取可用事件
      const eventsResponse = JSON.parse(sendCommand('{"type":"query_available_events"}'));
      if (eventsResponse.type === 'query_result') {
        this.availableEvents = eventsResponse.data.available_events;
      }

      // 获取当前位置
      try {
        const locationResponse = JSON.parse(sendCommand('{"type":"query_location"}'));
        if (locationResponse.type === 'query_result') {
          this.currentLocation = locationResponse.data.location_name;
        } else {
          // 如果查询失败，使用默认位置名称
          const locationId = this.gameState?.resources[61] || 1;
          const locationNames = ['', '公司', '商店', '家', '公园', '餐馆', '医院'];
          this.currentLocation = locationNames[locationId] || '未知位置';
        }
      } catch (error) {
        // 如果查询失败，使用默认位置名称
        const locationId = this.gameState?.resources[61] || 1;
        const locationNames = ['', '公司', '商店', '家', '公园', '餐馆', '医院'];
        this.currentLocation = locationNames[locationId] || '未知位置';
      }
    } catch (error) {
      console.error('获取游戏状态失败:', error);
    }
  }

  private displayGameStatus() {
    if (!this.gameState) return;

    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                        游戏状态                            │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    
    // 时间信息
    const timeInfo = this.gameState.time_info;
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    console.log(`│ 时间: ${timeInfo.time_display || '07:00'} ${weekDays[timeInfo.day_of_week]} ${timeInfo.is_weekend ? '(周末)' : '(工作日)'} ${timeInfo.is_night ? '(夜晚)' : '(白天)'}`);
    console.log(`│ 位置: ${this.currentLocation}`);
    console.log('├─────────────────────────────────────────────────────────────┤');
    
    // 基础属性 - 使用正确的资源索引（从1开始）
    const resources = this.gameState.resources;
    console.log(`│ 💰 金钱: ${resources[2] || 0}     ❤️  健康: ${resources[13] || 0}/100     😴 疲劳: ${resources[14] || 0}/100`);
    console.log(`│ 🍽️  饥饿: ${resources[15] || 0}/100     🧠 理性: ${resources[16] || 0}/100     💖 感性: ${resources[17] || 0}/100`);
    console.log(`│ 🎯 专注: ${resources[18] || 0}/100     😊 心情: ${resources[19] || 0}/100    🔧 技能: ${resources[20] || 0}/100`);
    console.log(`│ 👔 职级: ${resources[22] || 0}/10     📊 项目: ${resources[23] || 0}/100    😠 老板: ${resources[21] || 0}/100`);
    
    // 社交属性
    if (resources[70] || resources[71] || resources[72]) {
      console.log('├─────────────────────────────────────────────────────────────┤');
      console.log(`│ 🤝 社交影响力: ${resources[70] || 0}/100  🏆 技术声誉: ${resources[71] || 0}/100  🤔 哲学感悟: ${resources[72] || 0}/100`);
    }
    
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log();
  }

  private displayAvailableActions() {
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                      可选操作                               │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    
    // 场景切换选项
    console.log('│ 场景切换:');
    console.log('│  [1] 公司    [2] 商店    [3] 家      [4] 公园    [5] 餐馆    [6] 医院');
    console.log('├─────────────────────────────────────────────────────────────┤');
    
    // 当前场景可用事件
    if (this.availableEvents.length > 0) {
      console.log('│ 当前场景可用事件:');
      let eventIndex = 7; // 从7开始编号，避免与场景切换冲突
      
      // 按时间消耗分组显示事件
      const shortEvents = this.availableEvents.filter(e => e.time_cost <= 2);
      const mediumEvents = this.availableEvents.filter(e => e.time_cost > 2 && e.time_cost <= 5);
      const longEvents = this.availableEvents.filter(e => e.time_cost > 5);
      
      if (shortEvents.length > 0) {
        console.log('│  快速行动 (≤1小时):');
        for (const event of shortEvents.slice(0, 5)) {
          console.log(`│   [${eventIndex}] ${event.event_name} (${event.time_cost * 0.5}小时)`);
          eventIndex++;
        }
      }
      
      if (mediumEvents.length > 0) {
        console.log('│  中等行动 (1-2.5小时):');
        for (const event of mediumEvents.slice(0, 5)) {
          console.log(`│   [${eventIndex}] ${event.event_name} (${event.time_cost * 0.5}小时)`);
          eventIndex++;
        }
      }
      
      if (longEvents.length > 0) {
        console.log('│  长时间行动 (>2.5小时):');
        for (const event of longEvents.slice(0, 3)) {
          console.log(`│   [${eventIndex}] ${event.event_name} (${event.time_cost * 0.5}小时)`);
          eventIndex++;
        }
      }
    } else {
      console.log('│ 当前场景暂无可用事件');
    }
    
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ 其他操作:');
    console.log('│  [s] 存档    [l] 读档    [i] 查看物品栏    [h] 帮助    [q] 退出');
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log();
  }

  private async gameLoop() {
    while (true) {
      if (this.gameState?.game_over) {
        this.showGameOver();
        break;
      }

      this.displayGameStatus();
      this.displayAvailableActions();
      
      const choice = await this.getUserInput('请选择操作 (输入数字或字母): ');
      console.log();
      
      await this.handleUserChoice(choice.trim().toLowerCase());
      
      // 刷新游戏状态
      await this.refreshGameState();
      
      console.log('\n' + '='.repeat(65) + '\n');
    }
  }

  private async handleUserChoice(choice: string) {
    // 场景切换
    const sceneMap: { [key: string]: number } = {
      '1': 1, // 公司
      '2': 2, // 商店  
      '3': 3, // 家
      '4': 4, // 公园
      '5': 5, // 餐馆
      '6': 6  // 医院
    };

    if (sceneMap[choice]) {
      await this.changeLocation(sceneMap[choice]);
      return;
    }

    // 事件执行
    const eventIndex = parseInt(choice);
    if (eventIndex >= 7) {
      const eventArrayIndex = eventIndex - 7;
      if (eventArrayIndex < this.availableEvents.length) {
        await this.executeEvent(this.availableEvents[eventArrayIndex]);
        return;
      }
    }

    // 其他操作
    switch (choice) {
      case 's':
        await this.saveGame();
        break;
      case 'l':
        await this.loadGame();
        break;
      case 'i':
        await this.showInventory();
        break;
      case 'h':
        this.showHelp();
        break;
      case 'q':
        await this.quitGame();
        break;
      default:
        console.log('❌ 无效的选择，请重新输入。');
    }
  }

  private async changeLocation(locationId: number) {
    const locationNames = ['', '公司', '商店', '家', '公园', '餐馆', '医院'];
    console.log(`🚶 正在前往 ${locationNames[locationId]}...`);
    
    // 查找场景切换事件 (1-6)
    const switchEventId = locationId;
    const response = JSON.parse(sendCommand(`{"type":"execute_event","params":{"event_id":${switchEventId}}}`));
    
    if (response.type === 'event_result') {
      console.log(`✅ 已到达 ${locationNames[locationId]}`);
      if (response.data.time_cost > 0) {
        console.log(`⏰ 消耗时间: ${response.data.time_cost * 0.5} 小时`);
      }
      if (response.data.game_text) {
        console.log(`📖 ${response.data.game_text}`);
      }
    } else {
      console.log('❌ 场景切换失败:', response.error || '未知错误');
    }
  }

  private async executeEvent(event: AvailableEvent) {
    console.log(`🎯 执行事件: ${event.event_name}`);
    console.log(`⏰ 预计消耗时间: ${event.time_cost * 0.5} 小时`);
    
    const confirm = await this.getUserInput('确认执行吗？(y/n): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ 已取消操作');
      return;
    }

    const response = JSON.parse(sendCommand(`{"type":"execute_event","params":{"event_id":${event.event_id}}}`));
    
    if (response.type === 'event_result') {
      console.log('✅ 事件执行成功！');
      
      // 显示事件结果
      const result = response.data;
      if (result.game_text) {
        console.log(`📖 ${result.game_text}`);
      }
      
      // 显示资源变化
      if (result.resource_changes && result.resource_changes.length > 0) {
        console.log('\n📊 属性变化:');
        for (const change of result.resource_changes) {
          const sign = change.change > 0 ? '+' : '';
          const emoji = this.getResourceEmoji(change.resource_id);
          console.log(`   ${emoji} ${change.resource_name}: ${sign}${change.change}`);
        }
      }
      
      // 显示临时事件
      if (result.temporary_events && result.temporary_events.length > 0) {
        console.log('\n🎲 触发临时事件:');
        for (const tempEvent of result.temporary_events) {
          console.log(`   ⚡ ${tempEvent.event_name}: ${tempEvent.description}`);
        }
      }
      
      // 显示定时任务
      if (result.scheduled_tasks && result.scheduled_tasks.length > 0) {
        console.log('\n⏰ 触发定时任务:');
        for (const task of result.scheduled_tasks) {
          console.log(`   📅 ${task.task_name}: ${task.description}`);
        }
      }
      
    } else {
      console.log('❌ 事件执行失败:', response.error || '未知错误');
    }
  }

  private getResourceEmoji(resourceId: number): string {
    const emojiMap: { [key: number]: string } = {
      2: '💰', // 金钱
      4: '❤️', // 健康
      5: '😴', // 疲劳
      6: '🍽️', // 饥饿
      7: '🧠', // 理性
      8: '💖', // 感性
      9: '🎯', // 专注
      10: '😊', // 心情
      11: '🔧', // 专业技能
      12: '😠', // 老板不满
      13: '👔', // 职级
      14: '📊', // 项目进度
      63: '🤝', // 社交影响力
      64: '🏆', // 技术声誉
      65: '🤔'  // 哲学感悟
    };
    return emojiMap[resourceId] || '📈';
  }

  private async saveGame() {
    const response = JSON.parse(sendCommand('{"type":"save_game"}'));
    if (response.type === 'save_result') {
      console.log('💾 游戏已保存！');
      console.log('存档代码 (请妥善保存):');
      console.log('─'.repeat(65));
      console.log(response.data.save_data);
      console.log('─'.repeat(65));
    } else {
      console.log('❌ 保存失败:', response.error || '未知错误');
    }
  }

  private async loadGame() {
    const saveData = await this.getUserInput('请输入存档代码: ');
    if (!saveData.trim()) {
      console.log('❌ 存档代码不能为空');
      return;
    }

    const response = JSON.parse(sendCommand(`{"type":"load_game","params":{"save_data":"${saveData.trim()}"}}`));
    if (response.type === 'load_result') {
      console.log('📁 游戏读档成功！');
    } else {
      console.log('❌ 读档失败:', response.error || '未知错误');
    }
  }

  private async showInventory() {
    const response = JSON.parse(sendCommand('{"type":"query_inventory"}'));
    if (response.type === 'query_result') {
      console.log('┌─────────────────────────────────────────────────────────────┐');
      console.log('│                        物品栏                               │');
      console.log('├─────────────────────────────────────────────────────────────┤');
      
      const inventory = response.data.inventory;
      if (inventory.length === 0) {
        console.log('│ 物品栏为空                                                  │');
      } else {
        for (const item of inventory) {
          console.log(`│ 槽位${item.slot}: ${item.item_name} x${item.quantity}                    │`);
        }
      }
      console.log('└─────────────────────────────────────────────────────────────┘');
    } else {
      console.log('❌ 查询物品栏失败:', response.error || '未知错误');
    }
  }

  private showHelp() {
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                        游戏帮助                             │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ 游戏目标:                                                   │');
    console.log('│   通过工程师的视角体验生活，在感性和理性之间找到平衡        │');
    console.log('│                                                             │');
    console.log('│ 基本操作:                                                   │');
    console.log('│   - 数字1-6: 切换场景 (公司/商店/家/公园/餐馆/医院)        │');
    console.log('│   - 数字7+: 执行对应的事件                                  │');
    console.log('│   - s: 保存游戏进度                                         │');
    console.log('│   - l: 读取游戏进度                                         │');
    console.log('│   - i: 查看物品栏                                           │');
    console.log('│   - h: 显示帮助                                             │');
    console.log('│   - q: 退出游戏                                             │');
    console.log('│                                                             │');
    console.log('│ 游戏机制:                                                   │');
    console.log('│   - 时间系统: 每天48个时间单元，每个单元30分钟              │');
    console.log('│   - 工作日/周末: 影响可用事件                               │');
    console.log('│   - 感性/理性: 影响专注力消耗和事件效果                     │');
    console.log('│   - 疲劳/饥饿: 需要通过休息和进食来恢复                     │');
    console.log('└─────────────────────────────────────────────────────────────┘');
  }

  private showGameOver() {
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│                        游戏结束                             │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    
    if (this.gameState?.current_ending) {
      console.log(`│ 结局: ${this.gameState.current_ending.ending_name}                    │`);
      console.log(`│ 描述: ${this.gameState.current_ending.description}                   │`);
    } else {
      console.log('│ 感谢您的游玩！                                              │');
    }
    
    console.log('└─────────────────────────────────────────────────────────────┘');
  }

  private async quitGame() {
    const confirm = await this.getUserInput('确认退出游戏吗？(y/n): ');
    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
      console.log('👋 感谢游玩《我的工程师生活》！');
      this.rl.close();
      process.exit(0);
    }
  }

  private getUserInput(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }
}

// 启动游戏
if (require.main === module) {
  const game = new GameCLI();
  game.start().catch(console.error);
}

export { GameCLI }; 