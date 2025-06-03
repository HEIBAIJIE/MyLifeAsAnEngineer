import * as readline from 'readline';
import { GameService } from '../services/GameService';
import { LocalizationService } from '../services/LocalizationService';
import { GameStatusDisplay } from '../components/GameStatusDisplay';
import { ActionMenuDisplay } from '../components/ActionMenuDisplay';
import { EntityMenuDisplay } from '../components/EntityMenuDisplay';
import { EventResultDisplay } from '../components/EventResultDisplay';
import { GameState, AvailableEvent, AvailableEntity, EntityEventsData, EntityEvent, LocationInfo, Language } from '../types';
import { getEventName } from '../../utils';

export class GameController {
  private rl: readline.Interface;
  private gameService: GameService;
  private localization: LocalizationService;
  private statusDisplay: GameStatusDisplay;
  private actionDisplay: ActionMenuDisplay;
  private entityDisplay: EntityMenuDisplay;
  private resultDisplay: EventResultDisplay;
  
  private gameState: GameState | null = null;
  private availableEvents: AvailableEvent[] = [];
  private availableEntities: AvailableEntity[] = [];
  private currentLocation: LocationInfo | null = null;
  private alreadyRefreshed: boolean = false;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.gameService = new GameService();
    this.localization = LocalizationService.getInstance();
    this.statusDisplay = new GameStatusDisplay();
    this.actionDisplay = new ActionMenuDisplay();
    this.entityDisplay = new EntityMenuDisplay();
    this.resultDisplay = new EventResultDisplay();
  }

  async start(): Promise<void> {
    await this.refreshGameState();
    await this.gameLoop();
  }

  private async refreshGameState(): Promise<void> {
    try {
      // 获取游戏状态
      this.gameState = await this.gameService.getGameState();
      
      // 获取可用事件
      this.availableEvents = await this.gameService.getAvailableEvents();
      
      // 获取可用实体
      this.availableEntities = await this.gameService.getAvailableEntities();
      
      // 获取当前位置
      this.currentLocation = await this.gameService.getCurrentLocation();
      
    } catch (error) {
      const errorMessage = this.localization.getCurrentLanguage() === 'zh' ? 
        '获取游戏状态失败:' : 'Failed to get game state:';
      console.error(errorMessage, error);
    }
  }

  private async gameLoop(): Promise<void> {
    while (true) {
      if (this.gameState?.game_over) {
        this.showGameOver();
        break;
      }

      this.displayGameStatus();
      this.displayAvailableActions();
      
      const choice = await this.getUserInput(
        this.localization.getCurrentLanguage() === 'zh' ? 
          '请选择操作 (输入数字或字母): ' : 
          'Please choose an action (enter number or letter): '
      );
      console.log();
      
      await this.handleUserChoice(choice.trim().toLowerCase());
      
      // 刷新游戏状态 - 如果在executeEvent中已经刷新过，则跳过
      if (!this.alreadyRefreshed) {
        await this.refreshGameState();
      }
      this.alreadyRefreshed = false; // 重置标志
      
      console.log('\n' + '='.repeat(65) + '\n');
    }
  }

  private displayGameStatus(): void {
    if (this.gameState && this.currentLocation) {
      const statusOutput = this.statusDisplay.displayGameStatus(this.gameState, this.currentLocation);
      console.log(statusOutput);
    }
  }

  private displayAvailableActions(): void {
    const entityOutput = this.entityDisplay.displayAvailableEntities(this.availableEntities);
    console.log(entityOutput);
  }

  private async handleUserChoice(choice: string): Promise<void> {
    // 检查是否是实体选择
    const entityIndex = this.entityDisplay.isEntityCommand(choice);
    if (entityIndex) {
      const entity = this.entityDisplay.getEntityByIndex(entityIndex);
      if (entity) {
        await this.showEntityEvents(entity);
        return;
      }
    }

    // 检查系统命令
    const systemCommand = this.entityDisplay.isSystemCommand(choice);
    if (systemCommand) {
      await this.handleSystemCommand(systemCommand);
      return;
    }

    // 无效选择
    console.log(this.resultDisplay.displayError(''));
  }

  private async showEntityEvents(entity: AvailableEntity): Promise<void> {
    while (true) {
      const entityEventsData = await this.gameService.getEntityEvents(entity.entity_id);
      if (!entityEventsData) {
        const errorMessage = this.localization.getCurrentLanguage() === 'zh' ? 
          '❌ 无法获取实体交互选项' : '❌ Cannot get entity interaction options';
        console.log(errorMessage);
        return;
      }

      this.displayGameStatus();
      const entityEventsOutput = this.entityDisplay.displayEntityEvents(entityEventsData);
      console.log(entityEventsOutput);
      
      const choice = await this.getUserInput(
        this.localization.getCurrentLanguage() === 'zh' ? 
          '请选择交互选项 (输入数字或字母): ' : 
          'Please choose an interaction option (enter number or letter): '
      );
      console.log();
      
      const trimmedChoice = choice.trim().toLowerCase();
      
      // 检查是否是返回命令
      if (this.entityDisplay.isBackCommand(trimmedChoice)) {
        return; // 返回到主游戏循环
      }

      // 检查是否是事件选择
      const eventIndex = this.entityDisplay.isEventCommand(trimmedChoice);
      if (eventIndex) {
        const event = this.entityDisplay.getEventByIndex(eventIndex);
        if (event) {
          await this.executeEntityEvent(event);
          // 事件执行后继续循环，显示更新后的实体事件
          continue;
        }
      }

      // 检查系统命令
      const systemCommand = this.entityDisplay.isSystemCommand(trimmedChoice);
      if (systemCommand) {
        await this.handleSystemCommand(systemCommand);
        // 系统命令执行后继续显示实体事件
        continue;
      }

      // 无效选择
      console.log(this.resultDisplay.displayError(''));
    }
  }

  private async executeEntityEvent(event: EntityEvent): Promise<void> {
    const language = this.localization.getCurrentLanguage();
    const eventName = language === 'zh' ? event.event_name_cn : event.event_name_en;
    
    console.log(this.resultDisplay.displayEventConfirmation(eventName, event.time_cost));
    
    const result = await this.gameService.executeEvent(event.event_id);
    console.log(this.resultDisplay.displayEventResult(result));

    // Check if this was a location change event
    const isLocationChange = result.resource_changes?.some(change => change.resource_id === 61);
    
    if (isLocationChange) {
      // Refresh game state after location change
      await this.refreshGameState();
      this.alreadyRefreshed = true;
    } else {
      this.alreadyRefreshed = false;
    }
  }

  private async handleSystemCommand(command: string): Promise<void> {
    switch (command) {
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
      case 'lang':
        this.switchLanguage();
        break;
    }
  }

  private async saveGame(): Promise<void> {
    const result = await this.gameService.saveGame();
    console.log(this.resultDisplay.displaySaveResult(result));
  }

  private async loadGame(): Promise<void> {
    const saveDataPrompt = this.localization.getCurrentLanguage() === 'zh' ? 
      '请输入存档代码: ' : 'Please enter save code: ';
    const saveData = await this.getUserInput(saveDataPrompt);
    
    if (!saveData.trim()) {
      const emptyMessage = this.localization.getCurrentLanguage() === 'zh' ? 
        '❌ 存档代码不能为空' : '❌ Save code cannot be empty';
      console.log(emptyMessage);
      return;
    }

    const result = await this.gameService.loadGame(saveData.trim());
    console.log(this.resultDisplay.displayLoadResult(result));
  }

  private async showInventory(): Promise<void> {
    const inventory = await this.gameService.getInventory();
    console.log(this.statusDisplay.displayInventory(inventory));
  }

  private showHelp(): void {
    console.log(this.localization.getHelpMessage());
  }

  private showGameOver(): void {
    if (this.gameState) {
      console.log(this.statusDisplay.displayGameOver(this.gameState));
    }
  }

  private async quitGame(): Promise<void> {
    const goodbyeMessage = this.localization.getCurrentLanguage() === 'zh' ? 
      '👋 感谢游玩《工程师日记》！' : '👋 Thank you for playing "My Life As An Engineer"!';
    console.log(goodbyeMessage);
    this.rl.close();
    process.exit(0);
  }

  private switchLanguage(): void {
    const newLanguage: Language = this.localization.getCurrentLanguage() === 'zh' ? 'en' : 'zh';
    this.localization.setLanguage(newLanguage);
    this.gameService.setLanguage(newLanguage);
    
    const message = newLanguage === 'zh' ? 
      '🌐 语言已切换为中文' : 
      '🌐 Language switched to English';
    console.log(message);
  }

  private getUserInput(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }

  // Public method for testing
  public async getGameState(): Promise<GameState | null> {
    return this.gameState;
  }

  public async getAvailableEvents(): Promise<AvailableEvent[]> {
    return this.availableEvents;
  }

  public async getAvailableEntities(): Promise<AvailableEntity[]> {
    return this.availableEntities;
  }

  public getCurrentLocation(): LocationInfo | null {
    return this.currentLocation;
  }

  public close(): void {
    this.rl.close();
  }
} 