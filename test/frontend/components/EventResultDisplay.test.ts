import { EventResultDisplay } from '../../../src/frontend/components/EventResultDisplay';
import { LocalizationService } from '../../../src/frontend/services/LocalizationService';
import { EventResult } from '../../../src/frontend/types';

// Mock the LocalizationService
jest.mock('../../../src/frontend/services/LocalizationService');

describe('EventResultDisplay', () => {
  let eventResultDisplay: EventResultDisplay;
  let mockLocalizationService: jest.Mocked<LocalizationService>;

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
    jest.clearAllMocks();
    
    mockLocalizationService = {
      getInstance: jest.fn(),
      setLanguage: jest.fn(),
      getCurrentLanguage: jest.fn().mockReturnValue('zh'),
      getTexts: jest.fn().mockReturnValue(mockTexts),
      getText: jest.fn(),
      getResourceEmoji: jest.fn().mockImplementation((id: number) => {
        const emojiMap: { [key: number]: string } = {
          2: '💰',
          14: '😴'
        };
        return emojiMap[id] || '📈';
      }),
      getHelpMessage: jest.fn()
    } as any;

    (LocalizationService.getInstance as jest.Mock).mockReturnValue(mockLocalizationService);
    
    eventResultDisplay = new EventResultDisplay();
  });

  describe('displayEventResult', () => {
    test('should display successful event result with all details', () => {
      const successResult: EventResult = {
        success: true,
        game_text: '你完成了工作任务',
        time_cost: 4,
        resource_changes: [
          { resource_id: 2, resource_name: '金钱', change: 100 },
          { resource_id: 14, resource_name: '疲劳', change: 20 }
        ],
        temporary_events: [
          { event_name: '加班奖励', description: '获得额外奖金' }
        ],
        scheduled_tasks: [
          { task_name: '周报提交', description: '下周一提交工作周报' }
        ]
      };

      const output = eventResultDisplay.displayEventResult(successResult);

      expect(output).toContain('✅ 事件执行成功！');
      expect(output).toContain('📖 你完成了工作任务');
      expect(output).toContain('📊 属性变化:');
      expect(output).toContain('💰 金钱: +100');
      expect(output).toContain('😴 疲劳: +20');
      expect(output).toContain('🎲 触发临时事件:');
      expect(output).toContain('⚡ 加班奖励: 获得额外奖金');
      expect(output).toContain('⏰ 触发定时任务:');
      expect(output).toContain('📅 周报提交: 下周一提交工作周报');
    });

    test('should display successful event result without optional details', () => {
      const simpleResult: EventResult = {
        success: true,
        game_text: '简单的事件',
        time_cost: 1
      };

      const output = eventResultDisplay.displayEventResult(simpleResult);

      expect(output).toContain('✅ 事件执行成功！');
      expect(output).toContain('📖 简单的事件');
      expect(output).not.toContain('📊 属性变化:');
      expect(output).not.toContain('🎲 触发临时事件:');
      expect(output).not.toContain('⏰ 触发定时任务:');
    });

    test('should display failed event result', () => {
      const failedResult: EventResult = {
        success: false,
        time_cost: 0,
        game_text: '条件不满足'
      };

      const output = eventResultDisplay.displayEventResult(failedResult);

      expect(output).toContain('❌ 事件执行失败: 条件不满足');
      expect(output).not.toContain('✅ 事件执行成功！');
    });

    test('should display failed event result with default error message', () => {
      const failedResult: EventResult = {
        success: false,
        time_cost: 0
      };

      const output = eventResultDisplay.displayEventResult(failedResult);

      expect(output).toContain('❌ 事件执行失败: 未知错误');
    });

    test('should display failed event result in English', () => {
      mockLocalizationService.getCurrentLanguage.mockReturnValue('en');
      
      const failedResult: EventResult = {
        success: false,
        time_cost: 0
      };

      const output = eventResultDisplay.displayEventResult(failedResult);

      expect(output).toContain('Unknown error');
    });
  });

  describe('displayLocationChange', () => {
    test('should display location change with time cost', () => {
      const output = eventResultDisplay.displayLocationChange('公司', 2);

      expect(output).toContain('🚶 正在前往 公司...');
      expect(output).toContain('✅ 已到达 公司');
      expect(output).toContain('⏰ 消耗时间: 1 小时');
    });

    test('should display location change without time cost', () => {
      const output = eventResultDisplay.displayLocationChange('家', 0);

      expect(output).toContain('🚶 正在前往 家...');
      expect(output).toContain('✅ 已到达 家');
      expect(output).not.toContain('⏰ 消耗时间:');
    });

    test('should display location change in English', () => {
      mockLocalizationService.getCurrentLanguage.mockReturnValue('en');
      
      const output = eventResultDisplay.displayLocationChange('Company', 1);

      expect(output).toContain('🚶 Moving to Company...');
      expect(output).toContain('✅ Arrived at Company');
    });
  });

  describe('displayEventConfirmation', () => {
    test('should display event confirmation', () => {
      const output = eventResultDisplay.displayEventConfirmation('工作', 8);

      expect(output).toContain('🎯 执行事件: 工作');
      expect(output).toContain('⏰ 预计消耗时间: 4 小时');
    });
  });

  describe('displaySaveResult', () => {
    test('should display successful save result', () => {
      const saveResult = {
        success: true,
        saveData: 'encoded_save_data_12345'
      };
      const output = eventResultDisplay.displaySaveResult(saveResult);

      expect(output).toContain('💾 游戏已保存！');
      expect(output).toContain('存档代码 (请妥善保存):');
      expect(output).toContain('encoded_save_data_12345');
      expect(output).toContain('─'.repeat(65));
    });

    test('should display failed save result', () => {
      const saveResult = {
        success: false,
        error: 'Failed to save game: disk full'
      };
      const output = eventResultDisplay.displaySaveResult(saveResult);

      expect(output).toContain('❌ 保存失败: Failed to save game: disk full');
      expect(output).not.toContain('💾 游戏已保存！');
    });

    test('should display failed save result without error message', () => {
      const saveResult = {
        success: false
      };
      const output = eventResultDisplay.displaySaveResult(saveResult);

      expect(output).toContain('❌ 保存失败');
      expect(output).not.toContain('💾 游戏已保存！');
    });

    test('should display save result in English', () => {
      mockLocalizationService.getCurrentLanguage.mockReturnValue('en');
      
      const saveResult = {
        success: true,
        saveData: 'encoded_save_data_12345'
      };
      const output = eventResultDisplay.displaySaveResult(saveResult);

      expect(output).toContain('💾 Game saved!');
      expect(output).toContain('Save code (please keep it safe):');
    });
  });

  describe('displayLoadResult', () => {
    test('should display successful load result', () => {
      const loadResult = {
        success: true
      };
      const output = eventResultDisplay.displayLoadResult(loadResult);

      expect(output).toContain('📁 游戏读档成功！');
    });

    test('should display failed load result', () => {
      const loadResult = {
        success: false,
        error: 'Failed to load game: Invalid save data format'
      };
      const output = eventResultDisplay.displayLoadResult(loadResult);

      expect(output).toContain('❌ 读档失败: Failed to load game: Invalid save data format');
    });

    test('should display failed load result without error message', () => {
      const loadResult = {
        success: false
      };
      const output = eventResultDisplay.displayLoadResult(loadResult);

      expect(output).toContain('❌ 读档失败');
    });

    test('should display load result in English', () => {
      mockLocalizationService.getCurrentLanguage.mockReturnValue('en');
      
      const loadResult = {
        success: true
      };
      const output = eventResultDisplay.displayLoadResult(loadResult);

      expect(output).toContain('📁 Game loaded successfully!');
      
      const failedResult = {
        success: false,
        error: 'Invalid data'
      };
      const failedOutput = eventResultDisplay.displayLoadResult(failedResult);
      expect(failedOutput).toContain('❌ Load failed: Invalid data');
    });
  });

  describe('displayError', () => {
    test('should display custom error message', () => {
      const output = eventResultDisplay.displayError('自定义错误信息');

      expect(output).toBe('自定义错误信息');
    });

    test('should display default error message when no message provided', () => {
      const output = eventResultDisplay.displayError('');

      expect(output).toContain('❌ 无效的选择，请重新输入。');
    });

    test('should display default error message in English', () => {
      mockLocalizationService.getCurrentLanguage.mockReturnValue('en');
      
      const output = eventResultDisplay.displayError('');

      expect(output).toContain('❌ Invalid choice, please try again.');
    });
  });

  describe('Localization Integration', () => {
    test('should call LocalizationService.getInstance()', () => {
      expect(LocalizationService.getInstance).toHaveBeenCalled();
    });

    test('should call getTexts() for display', () => {
      const result: EventResult = {
        success: true,
        game_text: 'Test',
        time_cost: 1
      };
      
      eventResultDisplay.displayEventResult(result);
      
      expect(mockLocalizationService.getTexts).toHaveBeenCalled();
    });

    test('should call getResourceEmoji() for resource changes', () => {
      const result: EventResult = {
        success: true,
        game_text: 'Test',
        time_cost: 1,
        resource_changes: [
          { resource_id: 2, resource_name: '金钱', change: 100 }
        ]
      };
      
      eventResultDisplay.displayEventResult(result);
      
      expect(mockLocalizationService.getResourceEmoji).toHaveBeenCalledWith(2);
    });
  });
}); 