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
    success: '✅ 事件执行成功！',
    failed: '❌ 事件执行失败:',
    resourceChanges: '📊 属性变化:',
    tempEvents: '🎲 触发临时事件:',
    scheduledTasks: '⏰ 触发定时任务:'
  };

  const mockEvents: AvailableEvent[] = [
    { event_id: 31, event_name_cn: '工作', event_name_en: 'Work', time_cost: 8 }, // Long action
    { event_id: 32, event_name_cn: '休息', event_name_en: 'Rest', time_cost: 2 }, // Quick action
    { event_id: 33, event_name_cn: '学习', event_name_en: 'Study', time_cost: 4 }, // Medium action
    { event_id: 34, event_name_cn: '吃饭', event_name_en: 'Eat', time_cost: 1 }, // Quick action
    { event_id: 35, event_name_cn: '开会', event_name_en: 'Meeting', time_cost: 3 }, // Medium action
    { event_id: 36, event_name_cn: '睡觉', event_name_en: 'Sleep', time_cost: 16 } // Long action
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
      getHelpMessage: jest.fn()
    } as any;

    (LocalizationService.getInstance as jest.Mock).mockReturnValue(mockLocalizationService);
    
    actionMenuDisplay = new ActionMenuDisplay();
  });

  describe('displayAvailableActions', () => {
    test('should display action menu without scene switching options', () => {
      const output = actionMenuDisplay.displayAvailableActions(mockEvents);
      
      expect(output).toContain('可选操作');
      expect(output).not.toContain('场景切换:');
      expect(output).not.toContain('[1] 公司');
      expect(output).not.toContain('[2] 商店');
    });

    test('should categorize events by time cost starting from index 1', () => {
      const output = actionMenuDisplay.displayAvailableActions(mockEvents);
      
      // Quick actions (≤1 hour, time_cost ≤ 2)
      expect(output).toContain('快速行动 (≤1小时):');
      expect(output).toContain('[1] 休息 (1小时)'); // time_cost 2 * 0.5 = 1
      expect(output).toContain('[2] 吃饭 (0.5小时)'); // time_cost 1 * 0.5 = 0.5
      
      // Medium actions (1-2.5 hours, 2 < time_cost ≤ 5)
      expect(output).toContain('中等行动 (1-2.5小时):');
      expect(output).toContain('[3] 学习 (2小时)'); // time_cost 4 * 0.5 = 2
      expect(output).toContain('[4] 开会 (1.5小时)'); // time_cost 3 * 0.5 = 1.5
      
      // Long actions (>2.5 hours, time_cost > 5)
      expect(output).toContain('长时间行动 (>2.5小时):');
      expect(output).toContain('[5] 工作 (4小时)'); // time_cost 8 * 0.5 = 4
      expect(output).toContain('[6] 睡觉 (8小时)'); // time_cost 16 * 0.5 = 8
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
        manyEvents.push({ event_id: i + 100, event_name_cn: `事件${i}`, event_name_en: `Event${i}`, time_cost: 2 });
      }
      
      const output = actionMenuDisplay.displayAvailableActions(manyEvents);
      
      // Should only show first 5 quick actions
      expect(output).toContain('[1] 事件0');
      expect(output).toContain('[5] 事件4');
      expect(output).not.toContain('[6] 事件5'); // Should not show 6th quick action
    });

    test('should handle mixed event categories correctly', () => {
      const mixedEvents: AvailableEvent[] = [
        { event_id: 1, event_name_cn: '快速1', event_name_en: 'Quick1', time_cost: 1 },
        { event_id: 2, event_name_cn: '长时间1', event_name_en: 'Long1', time_cost: 10 },
        { event_id: 3, event_name_cn: '中等1', event_name_en: 'Medium1', time_cost: 3 },
        { event_id: 4, event_name_cn: '快速2', event_name_en: 'Quick2', time_cost: 2 }
      ];
      
      const output = actionMenuDisplay.displayAvailableActions(mixedEvents);
      
      expect(output).toContain('快速行动');
      expect(output).toContain('[1] 快速1');
      expect(output).toContain('[2] 快速2');
      
      expect(output).toContain('中等行动');
      expect(output).toContain('[3] 中等1');
      
      expect(output).toContain('长时间行动');
      expect(output).toContain('[4] 长时间1');
    });
  });

  describe('getEventByIndex', () => {
    test('should return correct event for valid index based on display order', () => {
      // displayAvailableActions populates the internal displayedEvents list
      actionMenuDisplay.displayAvailableActions(mockEvents);
      
      // Quick actions first
      // mockEvents[1] is '休息' (time_cost: 2)
      // mockEvents[3] is '吃饭' (time_cost: 1)
      // Displayed order for quick: 休息 (index 1), 吃饭 (index 2)
      let event = actionMenuDisplay.getEventByIndex(1);
      expect(event).toEqual(mockEvents.find(e => e.event_id === 32)); // 休息
      
      event = actionMenuDisplay.getEventByIndex(2);
      expect(event).toEqual(mockEvents.find(e => e.event_id === 34)); // 吃饭

      // Medium actions next
      // mockEvents[2] is '学习' (time_cost: 4)
      // mockEvents[4] is '开会' (time_cost: 3)
      // Displayed order for medium: 学习 (index 3), 开会 (index 4)
      event = actionMenuDisplay.getEventByIndex(3);
      expect(event).toEqual(mockEvents.find(e => e.event_id === 33)); // 学习
      
      event = actionMenuDisplay.getEventByIndex(4);
      expect(event).toEqual(mockEvents.find(e => e.event_id === 35)); // 开会

      // Long actions last
      // mockEvents[0] is '工作' (time_cost: 8)
      // mockEvents[5] is '睡觉' (time_cost: 16)
      // Displayed order for long: 工作 (index 5), 睡觉 (index 6)
      event = actionMenuDisplay.getEventByIndex(5);
      expect(event).toEqual(mockEvents.find(e => e.event_id === 31)); // 工作

      event = actionMenuDisplay.getEventByIndex(6);
      expect(event).toEqual(mockEvents.find(e => e.event_id === 36)); // 睡觉
    });

    test('should return null for invalid index (too low)', () => {
      actionMenuDisplay.displayAvailableActions(mockEvents);
      const event = actionMenuDisplay.getEventByIndex(0); // Index 0 is for locations
      expect(event).toBeNull();
    });

    test('should return null for invalid index (too high)', () => {
      actionMenuDisplay.displayAvailableActions(mockEvents);
      // Total 6 events displayed, so max index is 1 + 6 - 1 = 6
      const event = actionMenuDisplay.getEventByIndex(7); 
      expect(event).toBeNull();
    });
    
    test('should return null for invalid index (non-numeric string)', () => {
      actionMenuDisplay.displayAvailableActions(mockEvents);
      // @ts-expect-error testing invalid input
      const event = actionMenuDisplay.getEventByIndex('abc');
      expect(event).toBeNull();
    });

    test('should return null if getEventByIndex is called before displayAvailableActions for an empty list', () => {
      actionMenuDisplay.displayAvailableActions([]); // Pass empty array
      const event = actionMenuDisplay.getEventByIndex(1);
      expect(event).toBeNull();
    });

    test('should return null if getEventByIndex is called before displayAvailableActions when events exist but display is not yet called', () => {
      // NOTE: This test relies on the internal state not being populated if displayAvailableActions isn't called.
      // If actionMenuDisplay is re-instantiated per test (which it is via beforeEach),
      // displayedEvents would be empty.
      const event = actionMenuDisplay.getEventByIndex(1);
      expect(event).toBeNull();
    });

    test('should correctly handle limits on displayed events', () => {
      const manyQuickEvents: AvailableEvent[] = [];
      for (let i = 0; i < 7; i++) { // 7 quick events
        manyQuickEvents.push({ event_id: 100 + i, event_name_cn: `快${i}`, event_name_en: `Q${i}`, time_cost: 1 });
      }
      const fewMediumEvents: AvailableEvent[] = [
        { event_id: 200, event_name_cn: '中1', event_name_en: 'M1', time_cost: 3 }
      ];
      
      const allTestEvents = [...manyQuickEvents, ...fewMediumEvents];
      actionMenuDisplay.displayAvailableActions(allTestEvents);

      // Quick actions are sliced to 5. Indices 1-5.
      let event = actionMenuDisplay.getEventByIndex(1); //快0
      expect(event?.event_id).toBe(100);
      event = actionMenuDisplay.getEventByIndex(5); //快4
      expect(event?.event_id).toBe(104);
      
      // Index 6 should be the first medium event if quick events were not sliced,
      // but since quick events are sliced to 5, index 6 is the first medium event
      event = actionMenuDisplay.getEventByIndex(6); //中1
      expect(event?.event_id).toBe(200);

      // Index 7 should be null as there's only 1 medium event and 5 quick events displayed (total 6 events)
      event = actionMenuDisplay.getEventByIndex(7);
      expect(event).toBeNull();
    });
  });

  describe('isLocationCommand', () => {
    test('should return null for all inputs since location switching is removed', () => {
      expect(actionMenuDisplay.isLocationCommand('1')).toBeNull();
      expect(actionMenuDisplay.isLocationCommand('2')).toBeNull();
      expect(actionMenuDisplay.isLocationCommand('3')).toBeNull();
      expect(actionMenuDisplay.isLocationCommand('4')).toBeNull();
      expect(actionMenuDisplay.isLocationCommand('5')).toBeNull();
      expect(actionMenuDisplay.isLocationCommand('6')).toBeNull();
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
      expect(actionMenuDisplay.isEventCommand('1')).toBe(1);
      expect(actionMenuDisplay.isEventCommand('4')).toBe(4);
      expect(actionMenuDisplay.isEventCommand('15')).toBe(15);
    });

    test('should return null for invalid event commands', () => {
      expect(actionMenuDisplay.isEventCommand('0')).toBeNull(); // Below 1
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
      expect(output).toContain(mockTexts.quickActions);
      expect(output).toContain(mockTexts.mediumActions);
      expect(output).toContain(mockTexts.longActions);
      expect(output).toContain(mockTexts.otherActions);
    });
  });
}); 