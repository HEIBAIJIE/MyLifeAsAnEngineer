import * as readline from 'readline';
import { GameService } from '../services/GameService';
import { LocalizationService } from '../services/LocalizationService';
import { GameStatusDisplay } from '../components/GameStatusDisplay';
import { ActionMenuDisplay } from '../components/ActionMenuDisplay';
import { EventResultDisplay } from '../components/EventResultDisplay';
import { GameState, AvailableEvent, LocationInfo, Language } from '../types';

export class GameController {
  private rl: readline.Interface;
  private gameService: GameService;
  private localization: LocalizationService;
  private statusDisplay: GameStatusDisplay;
  private actionDisplay: ActionMenuDisplay;
  private resultDisplay: EventResultDisplay;
  
  private gameState: GameState | null = null;
  private availableEvents: AvailableEvent[] = [];
  private currentLocation: LocationInfo | null = null;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.gameService = new GameService();
    this.localization = LocalizationService.getInstance();
    this.statusDisplay = new GameStatusDisplay();
    this.actionDisplay = new ActionMenuDisplay();
    this.resultDisplay = new EventResultDisplay();
  }

  async start(): Promise<void> {
    console.clear();
    this.showWelcome();
    await this.refreshGameState();
    await this.gameLoop();
  }

  private showWelcome(): void {
    console.log(this.localization.getWelcomeMessage());
  }

  private async refreshGameState(): Promise<void> {
    try {
      // 获取游戏状态
      this.gameState = await this.gameService.getGameState();
      
      // 获取可用事件
      this.availableEvents = await this.gameService.getAvailableEvents();
      
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
      
      // 刷新游戏状态
      await this.refreshGameState();
      
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
    const actionOutput = this.actionDisplay.displayAvailableActions(this.availableEvents);
    console.log(actionOutput);
  }

  private async handleUserChoice(choice: string): Promise<void> {
    // 场景切换
    const locationId = this.actionDisplay.isLocationCommand(choice);
    if (locationId) {
      await this.changeLocation(locationId);
      return;
    }

    // 事件执行
    const eventIndex = this.actionDisplay.isEventCommand(choice);
    if (eventIndex) {
      const event = this.actionDisplay.getEventByIndex(this.availableEvents, eventIndex);
      if (event) {
        await this.executeEvent(event);
        return;
      }
    }

    // 系统命令
    const systemCommand = this.actionDisplay.isSystemCommand(choice);
    if (systemCommand) {
      await this.handleSystemCommand(systemCommand);
      return;
    }

    // 无效选择
    console.log(this.resultDisplay.displayError(''));
  }

  private async changeLocation(locationId: number): Promise<void> {
    const locationNames = this.localization.getCurrentLanguage() === 'zh' ? 
      ['', '公司', '商店', '家', '公园', '餐馆', '医院'] :
      ['', 'Company', 'Store', 'Home', 'Park', 'Restaurant', 'Hospital'];
    
    const locationName = locationNames[locationId];
    console.log(this.resultDisplay.displayLocationChange(locationName, 0));
    
    const result = await this.gameService.changeLocation(locationId);
    console.log(this.resultDisplay.displayEventResult(result));
  }

  private async executeEvent(event: AvailableEvent): Promise<void> {
    const texts = this.localization.getTexts();
    
    console.log(this.resultDisplay.displayEventConfirmation(event.event_name, event.time_cost));
    
    const confirm = await this.getUserInput(texts.confirm as string);
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log(texts.cancelled);
      return;
    }

    const result = await this.gameService.executeEvent(event.event_id);
    console.log(this.resultDisplay.displayEventResult(result));
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
    const saveData = await this.gameService.saveGame();
    console.log(this.resultDisplay.displaySaveResult(saveData?.save_data || null));
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

    const success = await this.gameService.loadGame(saveData.trim());
    console.log(this.resultDisplay.displayLoadResult(success));
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
    const confirmPrompt = this.localization.getCurrentLanguage() === 'zh' ? 
      '确认退出游戏吗？(y/n): ' : 'Confirm quit game? (y/n): ';
    const confirm = await this.getUserInput(confirmPrompt);
    
    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
      const goodbyeMessage = this.localization.getCurrentLanguage() === 'zh' ? 
        '👋 感谢游玩《我的工程师生活》！' : '👋 Thank you for playing "My Life As An Engineer"!';
      console.log(goodbyeMessage);
      this.rl.close();
      process.exit(0);
    }
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

  public getCurrentLocation(): LocationInfo | null {
    return this.currentLocation;
  }

  public close(): void {
    this.rl.close();
  }
} 