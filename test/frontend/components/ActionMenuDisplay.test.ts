import { ActionMenuDisplay } from '../../../src/frontend/components/ActionMenuDisplay';
import { LocalizationService } from '../../../src/frontend/services/LocalizationService';
import { AvailableEvent } from '../../../src/frontend/types';

// Mock the LocalizationService
jest.mock('../../../src/frontend/services/LocalizationService');

describe('ActionMenuDisplay', () => {
  let actionMenuDisplay: ActionMenuDisplay;
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
    confirm: '确认执行吗？(y/n): ',
    cancelled: '❌ 已取消操作',
    success: '✅ 事件执行成功！',
    failed: '❌ 事件执行失败:',
    resourceChanges: '📊 属性变化:',
    tempEvents: '🎲 触发临时事件:',
    scheduledTasks: '⏰ 触发定时任务:'
  };

  const mockEvents: AvailableEvent[] = [
    { event_id: 31, event_name: '工作', time_cost: 8 }, // Long action
    { event_id: 32, event_name: '休息', time_cost: 2 }, // Quick action
    { event_id: 33, event_name: '学习', time_cost: 4 }, // Medium action
    { event_id: 34, event_name: '吃饭', time_cost: 1 }, // Quick action
    { event_id: 35, event_name: '开会', time_cost: 3 }, // Medium action
    { event_id: 36, event_name: '睡觉', time_cost: 16 } // Long action
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockLocalizationService = {
      getInstance: jest.fn(),
      setLanguage: jest.fn(),
      getCurrentLanguage: jest.fn().mockReturnValue('zh'),
      getTexts: jest.fn().mockReturnValue(mockTexts),
      getText: jest.fn(),
      getResourceEmoji: jest.fn(),
      getWelcomeMessage: jest.fn(),
      getHelpMessage: jest.fn()
    } as any;

    (LocalizationService.getInstance as jest.Mock).mockReturnValue(mockLocalizationService);
    
    actionMenuDisplay = new ActionMenuDisplay();
  });

  describe('displayAvailableActions', () => {
    test('should display action menu with scene switching options', () => {
      const output = actionMenuDisplay.displayAvailableActions(mockEvents);
      
      expect(output).toContain('可选操作');
      expect(output).toContain('场景切换:');
      expect(output).toContain('[1] 公司');
      expect(output).toContain('[2] 商店');
      expect(output).toContain('[3] 家');
      expect(output).toContain('[4] 公园');
      expect(output).toContain('[5] 餐馆');
      expect(output).toContain('[6] 医院');
    });

    test('should categorize events by time cost', () => {
      const output = actionMenuDisplay.displayAvailableActions(mockEvents);
      
      // Quick actions (≤1 hour, time_cost ≤ 2)
      expect(output).toContain('快速行动 (≤1小时):');
      expect(output).toContain('[7] 休息 (1小时)'); // time_cost 2 * 0.5 = 1
      expect(output).toContain('[8] 吃饭 (0.5小时)'); // time_cost 1 * 0.5 = 0.5
      
      // Medium actions (1-2.5 hours, 2 < time_cost ≤ 5)
      expect(output).toContain('中等行动 (1-2.5小时):');
      expect(output).toContain('[9] 学习 (2小时)'); // time_cost 4 * 0.5 = 2
      expect(output).toContain('[10] 开会 (1.5小时)'); // time_cost 3 * 0.5 = 1.5
      
      // Long actions (>2.5 hours, time_cost > 5)
      expect(output).toContain('长时间行动 (>2.5小时):');
      expect(output).toContain('[11] 工作 (4小时)'); // time_cost 8 * 0.5 = 4
      expect(output).toContain('[12] 睡觉 (8小时)'); // time_cost 16 * 0.5 = 8
    });

    test('should display system commands', () => {
      const output = actionMenuDisplay.displayAvailableActions(mockEvents);
      
      expect(output).toContain('其他操作:');
      expect(output).toContain('[s] 存档');
      expect(output).toContain('[l] 读档');
      expect(output).toContain('[i] 查看物品栏');
      expect(output).toContain('[h] 帮助');
      expect(output).toContain('[q] 退出');
      expect(output).toContain('[lang] 切换语言');
    });

    test('should display no events message when no events available', () => {
      const output = actionMenuDisplay.displayAvailableActions([]);
      
      expect(output).toContain('当前场景暂无可用事件');
      expect(output).not.toContain('快速行动');
      expect(output).not.toContain('中等行动');
      expect(output).not.toContain('长时间行动');
    });

    test('should limit events display to prevent overflow', () => {
      // Create many events to test limits
      const manyEvents: AvailableEvent[] = [];
      for (let i = 0; i < 20; i++) {
        manyEvents.push({ event_id: i + 100, event_name: `事件${i}`, time_cost: 2 });
      }
      
      const output = actionMenuDisplay.displayAvailableActions(manyEvents);
      
      // Should only show first 5 quick actions
      expect(output).toContain('[7] 事件0');
      expect(output).toContain('[11] 事件4');
      expect(output).not.toContain('[12] 事件5'); // Should not show 6th quick action
    });

    test('should handle mixed event categories correctly', () => {
      const mixedEvents: AvailableEvent[] = [
        { event_id: 1, event_name: '快速1', time_cost: 1 },
        { event_id: 2, event_name: '长时间1', time_cost: 10 },
        { event_id: 3, event_name: '中等1', time_cost: 3 },
        { event_id: 4, event_name: '快速2', time_cost: 2 }
      ];
      
      const output = actionMenuDisplay.displayAvailableActions(mixedEvents);
      
      expect(output).toContain('快速行动');
      expect(output).toContain('[7] 快速1');
      expect(output).toContain('[8] 快速2');
      
      expect(output).toContain('中等行动');
      expect(output).toContain('[9] 中等1');
      
      expect(output).toContain('长时间行动');
      expect(output).toContain('[10] 长时间1');
    });
  });

  describe('getEventByIndex', () => {
    test('should return correct event for valid index', () => {
      const event = actionMenuDisplay.getEventByIndex(mockEvents, 7);
      expect(event).toEqual(mockEvents[0]); // Index 7 maps to array index 0
      
      const event2 = actionMenuDisplay.getEventByIndex(mockEvents, 9);
      expect(event2).toEqual(mockEvents[2]); // Index 9 maps to array index 2
    });

    test('should return null for invalid index', () => {
      const event = actionMenuDisplay.getEventByIndex(mockEvents, 6); // Too low
      expect(event).toBeNull();
      
      const event2 = actionMenuDisplay.getEventByIndex(mockEvents, 20); // Too high
      expect(event2).toBeNull();
    });

    test('should return null for empty events array', () => {
      const event = actionMenuDisplay.getEventByIndex([], 7);
      expect(event).toBeNull();
    });
  });

  describe('isLocationCommand', () => {
    test('should return location ID for valid location commands', () => {
      expect(actionMenuDisplay.isLocationCommand('1')).toBe(1);
      expect(actionMenuDisplay.isLocationCommand('2')).toBe(2);
      expect(actionMenuDisplay.isLocationCommand('3')).toBe(3);
      expect(actionMenuDisplay.isLocationCommand('4')).toBe(4);
      expect(actionMenuDisplay.isLocationCommand('5')).toBe(5);
      expect(actionMenuDisplay.isLocationCommand('6')).toBe(6);
    });

    test('should return null for invalid location commands', () => {
      expect(actionMenuDisplay.isLocationCommand('0')).toBeNull();
      expect(actionMenuDisplay.isLocationCommand('7')).toBeNull();
      expect(actionMenuDisplay.isLocationCommand('a')).toBeNull();
      expect(actionMenuDisplay.isLocationCommand('')).toBeNull();
    });
  });

  describe('isEventCommand', () => {
    test('should return event index for valid event commands', () => {
      expect(actionMenuDisplay.isEventCommand('7')).toBe(7);
      expect(actionMenuDisplay.isEventCommand('10')).toBe(10);
      expect(actionMenuDisplay.isEventCommand('15')).toBe(15);
    });

    test('should return null for invalid event commands', () => {
      expect(actionMenuDisplay.isEventCommand('6')).toBeNull(); // Below 7
      expect(actionMenuDisplay.isEventCommand('a')).toBeNull();
      expect(actionMenuDisplay.isEventCommand('')).toBeNull();
      expect(actionMenuDisplay.isEventCommand('abc')).toBeNull();
    });
  });

  describe('isSystemCommand', () => {
    test('should return system command for valid commands', () => {
      expect(actionMenuDisplay.isSystemCommand('s')).toBe('s');
      expect(actionMenuDisplay.isSystemCommand('l')).toBe('l');
      expect(actionMenuDisplay.isSystemCommand('i')).toBe('i');
      expect(actionMenuDisplay.isSystemCommand('h')).toBe('h');
      expect(actionMenuDisplay.isSystemCommand('q')).toBe('q');
      expect(actionMenuDisplay.isSystemCommand('lang')).toBe('lang');
    });

    test('should handle case insensitive commands', () => {
      expect(actionMenuDisplay.isSystemCommand('S')).toBe('s');
      expect(actionMenuDisplay.isSystemCommand('L')).toBe('l');
      expect(actionMenuDisplay.isSystemCommand('LANG')).toBe('lang');
    });

    test('should return null for invalid system commands', () => {
      expect(actionMenuDisplay.isSystemCommand('x')).toBeNull();
      expect(actionMenuDisplay.isSystemCommand('1')).toBeNull();
      expect(actionMenuDisplay.isSystemCommand('')).toBeNull();
      expect(actionMenuDisplay.isSystemCommand('save')).toBeNull();
    });
  });

  describe('Localization Integration', () => {
    test('should call LocalizationService.getInstance()', () => {
      expect(LocalizationService.getInstance).toHaveBeenCalled();
    });

    test('should call getTexts() for display', () => {
      actionMenuDisplay.displayAvailableActions(mockEvents);
      
      expect(mockLocalizationService.getTexts).toHaveBeenCalled();
    });

    test('should use localized texts in output', () => {
      const output = actionMenuDisplay.displayAvailableActions(mockEvents);
      
      expect(output).toContain(mockTexts.availableActions);
      expect(output).toContain(mockTexts.sceneSwitch);
      expect(output).toContain(mockTexts.quickActions);
      expect(output).toContain(mockTexts.mediumActions);
      expect(output).toContain(mockTexts.longActions);
      expect(output).toContain(mockTexts.otherActions);
    });
  });
}); 