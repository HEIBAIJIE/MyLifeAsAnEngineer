import { GameStatusDisplay } from '../../../src/frontend/components/GameStatusDisplay';
import { LocalizationService } from '../../../src/frontend/services/LocalizationService';
import { GameState, LocationInfo } from '../../../src/frontend/types';

// Mock the LocalizationService
jest.mock('../../../src/frontend/services/LocalizationService');

describe('GameStatusDisplay', () => {
  let gameStatusDisplay: GameStatusDisplay;
  let mockLocalizationService: jest.Mocked<LocalizationService>;

  const mockGameState: GameState = {
    resources: [
      0, 0, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 50, 30, 80, 70, 90, 85, 75, 20, 5, 60, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 40, 60, 25
    ],
    game_over: false,
    current_ending: null,
    time_info: {
      current_time: 14,
      day_of_week: 1,
      is_weekend: false,
      is_night: false,
      time_display: '07:00'
    }
  };

  const mockLocation: LocationInfo = {
    location_name: '公司',
    location_id: 1
  };

  const mockTexts = {
    gameStatus: '游戏状态',
    time: '时间',
    location: '位置',
    weekend: '周末',
    workday: '工作日',
    night: '夜晚',
    day: '白天',
    money: '金钱',
    health: '健康',
    fatigue: '疲劳',
    hunger: '饥饿',
    rational: '理性',
    emotional: '感性',
    focus: '专注',
    mood: '心情',
    skill: '技能',
    jobLevel: '职级',
    project: '项目',
    boss: '老板',
    socialInfluence: '社交影响力',
    techReputation: '技术声誉',
    philosophyInsight: '哲学感悟',
    weekDays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    availableActions: '可选操作',
    sceneSwitch: '场景切换:',
    locations: ['公司', '商店', '家', '公园', '餐馆', '医院'],
    currentSceneEvents: '当前场景可用事件:',
    noEventsAvailable: '当前场景暂无可用事件',
    quickActions: '快速行动 (≤1小时):',
    mediumActions: '中等行动 (1-2.5小时):',
    longActions: '长时间行动 (>2.5小时):',
    otherActions: '其他操作:',
    save: '存档',
    load: '读档',
    inventory: '查看物品栏',
    help: '帮助',
    quit: '退出',
    switchLang: '切换语言',
    hour: '小时',
    executing: '🎯 执行事件:',
    estimatedTime: '⏰ 预计消耗时间:',
    success: '✅ 事件执行成功！',
    failed: '❌ 事件执行失败:',
    resourceChanges: '📊 属性变化:',
    tempEvents: '🎲 触发临时事件:',
    scheduledTasks: '⏰ 触发定时任务:'
  };

  beforeEach(() => {
    // Reset the mock
    jest.clearAllMocks();
    
    // Mock LocalizationService.getInstance()
    mockLocalizationService = {
      getInstance: jest.fn(),
      setLanguage: jest.fn(),
      getCurrentLanguage: jest.fn().mockReturnValue('zh'),
      getTexts: jest.fn().mockReturnValue(mockTexts),
      getText: jest.fn(),
      getResourceEmoji: jest.fn(),
      getHelpMessage: jest.fn()
    } as any;

    (LocalizationService.getInstance as jest.Mock).mockReturnValue(mockLocalizationService);
    
    gameStatusDisplay = new GameStatusDisplay();
  });

  describe('displayGameStatus', () => {
    test('should display complete game status with all resources', () => {
      const output = gameStatusDisplay.displayGameStatus(mockGameState, mockLocation);
      
      expect(output).toContain('游戏状态');
      expect(output).toContain('时间: 07:00 周一 (工作日) (白天)');
      expect(output).toContain('位置: 公司');
      expect(output).toContain('💰 金钱: 1000');
      expect(output).toContain('❤️  健康: 100/100');
      expect(output).toContain('😴 疲劳: 50/100');
      expect(output).toContain('🍽️  饥饿: 30/100');
      expect(output).toContain('🧠 理性: 80/100');
      expect(output).toContain('💖 感性: 70/100');
      expect(output).toContain('🎯 专注: 90/100');
      expect(output).toContain('😊 心情: 85/100');
      expect(output).toContain('🔧 技能: 75/100');
      expect(output).toContain('👔 职级: 5/10');
      expect(output).toContain('📊 项目: 60/100');
      expect(output).toContain('😠 老板: 20/100');
    });

    test('should display social attributes when they exist', () => {
      const output = gameStatusDisplay.displayGameStatus(mockGameState, mockLocation);
      
      expect(output).toContain('🤝 社交影响力: 40/100');
      expect(output).toContain('🏆 技术声誉: 60/100');
      expect(output).toContain('🤔 哲学感悟: 25/100');
    });

    test('should handle weekend time display', () => {
      const weekendGameState = {
        ...mockGameState,
        time_info: {
          ...mockGameState.time_info,
          day_of_week: 0,
          is_weekend: true
        }
      };
      
      const output = gameStatusDisplay.displayGameStatus(weekendGameState, mockLocation);
      
      expect(output).toContain('周日 (周末)');
    });

    test('should handle night time display', () => {
      const nightGameState = {
        ...mockGameState,
        time_info: {
          ...mockGameState.time_info,
          is_night: true
        }
      };
      
      const output = gameStatusDisplay.displayGameStatus(nightGameState, mockLocation);
      
      expect(output).toContain('(夜晚)');
    });

    test('should return empty string when gameState is null', () => {
      const output = gameStatusDisplay.displayGameStatus(null as any, mockLocation);
      
      expect(output).toBe('');
    });

    test('should handle missing location gracefully', () => {
      const output = gameStatusDisplay.displayGameStatus(mockGameState, null as any);
      
      expect(output).toContain('位置: Unknown');
    });

    test('should handle missing resources gracefully', () => {
      const gameStateWithMissingResources = {
        ...mockGameState,
        resources: []
      };
      
      const output = gameStatusDisplay.displayGameStatus(gameStateWithMissingResources, mockLocation);
      
      expect(output).toContain('💰 金钱: 0');
      expect(output).toContain('❤️  健康: 0/100');
    });
  });

  describe('displayGameOver', () => {
    test('should display game over with ending information', () => {
      const gameOverState = {
        ...mockGameState,
        game_over: true,
        current_ending: {
          ending_name: '平衡结局',
          description: '你找到了工作与生活的平衡'
        }
      };
      
      const output = gameStatusDisplay.displayGameOver(gameOverState);
      
      expect(output).toContain('游戏结束');
      expect(output).toContain('结局: 平衡结局');
      expect(output).toContain('描述: 你找到了工作与生活的平衡');
    });

    test('should display default message when no ending information', () => {
      mockLocalizationService.getCurrentLanguage.mockReturnValue('zh');
      
      const gameOverState = {
        ...mockGameState,
        game_over: true,
        current_ending: null
      };
      
      const output = gameStatusDisplay.displayGameOver(gameOverState);
      
      expect(output).toContain('游戏结束');
      expect(output).toContain('感谢您的游玩！');
    });

    test('should display English message when language is English', () => {
      mockLocalizationService.getCurrentLanguage.mockReturnValue('en');
      
      const gameOverState = {
        ...mockGameState,
        game_over: true,
        current_ending: null
      };
      
      const output = gameStatusDisplay.displayGameOver(gameOverState);
      
      expect(output).toContain('Thank you for playing!');
    });
  });

  describe('displayInventory', () => {
    test('should display inventory items', () => {
      const inventory = [
        { slot: 1, item_name: '咖啡', quantity: 2 },
        { slot: 2, item_name: '书籍', quantity: 1 }
      ];
      
      mockLocalizationService.getCurrentLanguage.mockReturnValue('zh');
      
      const output = gameStatusDisplay.displayInventory(inventory);
      
      expect(output).toContain('物品栏');
      expect(output).toContain('槽位1: 咖啡 x2');
      expect(output).toContain('槽位2: 书籍 x1');
    });

    test('should display empty inventory message when no items', () => {
      mockLocalizationService.getCurrentLanguage.mockReturnValue('zh');
      
      const output = gameStatusDisplay.displayInventory([]);
      
      expect(output).toContain('物品栏');
      expect(output).toContain('物品栏为空');
    });

    test('should display English inventory when language is English', () => {
      const inventory = [
        { slot: 1, item_name: 'Coffee', quantity: 2 }
      ];
      
      mockLocalizationService.getCurrentLanguage.mockReturnValue('en');
      
      const output = gameStatusDisplay.displayInventory(inventory);
      
      expect(output).toContain('Slot1: Coffee x2');
    });

    test('should display English empty message when language is English', () => {
      mockLocalizationService.getCurrentLanguage.mockReturnValue('en');
      
      const output = gameStatusDisplay.displayInventory([]);
      
      expect(output).toContain('Inventory is empty');
    });
  });

  describe('Localization Integration', () => {
    test('should call LocalizationService.getInstance()', () => {
      expect(LocalizationService.getInstance).toHaveBeenCalled();
    });

    test('should call getTexts() for status display', () => {
      gameStatusDisplay.displayGameStatus(mockGameState, mockLocation);
      
      expect(mockLocalizationService.getTexts).toHaveBeenCalled();
    });

    test('should call getCurrentLanguage() for conditional text', () => {
      gameStatusDisplay.displayGameOver(mockGameState);
      
      expect(mockLocalizationService.getCurrentLanguage).toHaveBeenCalled();
    });
  });
}); 