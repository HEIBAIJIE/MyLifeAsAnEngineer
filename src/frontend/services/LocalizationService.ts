import { Language, UITexts } from '../types';

export class LocalizationService {
  private static instance: LocalizationService;
  private currentLanguage: Language = 'zh';

  private texts: Record<Language, UITexts> = {
    zh: {
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
    },
    en: {
      gameStatus: 'Game Status',
      time: 'Time',
      location: 'Location',
      weekend: 'Weekend',
      workday: 'Workday',
      night: 'Night',
      day: 'Day',
      money: 'Money',
      health: 'Health',
      fatigue: 'Fatigue',
      hunger: 'Hunger',
      rational: 'Rational',
      emotional: 'Emotional',
      focus: 'Focus',
      mood: 'Mood',
      skill: 'Skill',
      jobLevel: 'Job Level',
      project: 'Project',
      boss: 'Boss',
      socialInfluence: 'Social Influence',
      techReputation: 'Tech Reputation',
      philosophyInsight: 'Philosophy Insight',
      weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      availableActions: 'Available Actions',
      currentSceneEvents: 'Available Events in Current Scene:',
      noEventsAvailable: 'No events available in current scene',
      quickActions: 'Quick Actions (≤1 hour):',
      mediumActions: 'Medium Actions (1-2.5 hours):',
      longActions: 'Long Actions (>2.5 hours):',
      otherActions: 'Other Actions:',
      save: 'Save',
      load: 'Load',
      inventory: 'Inventory',
      help: 'Help',
      quit: 'Quit',
      switchLang: 'Switch Language',
      hour: 'hour',
      executing: '🎯 Executing Event:',
      estimatedTime: '⏰ Estimated Time Cost:',
      confirm: 'Confirm execution? (y/n): ',
      cancelled: '❌ Operation cancelled',
      success: '✅ Event executed successfully!',
      failed: '❌ Event execution failed:',
      resourceChanges: '📊 Resource Changes:',
      tempEvents: '🎲 Temporary Events Triggered:',
      scheduledTasks: '⏰ Scheduled Tasks Triggered:'
    }
  };

  static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  getTexts(): UITexts {
    return this.texts[this.currentLanguage];
  }

  getText(key: keyof UITexts): string | string[] {
    return this.texts[this.currentLanguage][key];
  }

  getResourceEmoji(resourceId: number): string {
    const emojiMap: { [key: number]: string } = {
      2: '💰', // 金钱
      13: '❤️', // 健康
      14: '😴', // 疲劳
      15: '🍽️', // 饥饿
      16: '🧠', // 理性
      17: '💖', // 感性
      18: '🎯', // 专注
      19: '😊', // 心情
      20: '🔧', // 专业技能
      21: '😠', // 老板不满
      22: '👔', // 职级
      23: '📊', // 项目进度
      70: '🤝', // 社交影响力
      71: '🏆', // 技术声誉
      72: '🤔'  // 哲学感悟
    };
    return emojiMap[resourceId] || '📈';
  }

  getWelcomeMessage(): string {
    if (this.currentLanguage === 'zh') {
      return `╔══════════════════════════════════════════════════════════════╗
║                    My Life As An Engineer                    ║
║                      命令行游戏界面                          ║
╚══════════════════════════════════════════════════════════════╝

欢迎来到《我的工程师生活》！
在这个游戏中，你将扮演一名工程师，体验真实的职场生活。
通过感性和理性两条路径，探索生活的本质和意义。
`;
    } else {
      return `╔══════════════════════════════════════════════════════════════╗
║                    My Life As An Engineer                    ║
║                    Command Line Interface                    ║
╚══════════════════════════════════════════════════════════════╝

Welcome to "My Life As An Engineer"!
In this game, you will play as an engineer and experience real workplace life.
Explore the essence and meaning of life through emotional and rational paths.
`;
    }
  }

  getHelpMessage(): string {
    if (this.currentLanguage === 'zh') {
      return `┌─────────────────────────────────────────────────────────────┐
│                        游戏帮助                             │
├─────────────────────────────────────────────────────────────┤
│ 游戏目标:                                                   │
│   通过工程师的视角体验生活，在感性和理性之间找到平衡        │
│                                                             │
│ 基本操作:                                                   │
│   - 数字1+: 执行对应的事件                                  │
│   - s: 保存游戏进度                                         │
│   - l: 读取游戏进度                                         │
│   - i: 查看物品栏                                           │
│   - h: 显示帮助                                             │
│   - q: 退出游戏                                             │
│   - lang: 切换语言                                          │
│                                                             │
│ 游戏机制:                                                   │
│   - 时间系统: 每天48个时间单元，每个单元30分钟              │
│   - 工作日/周末: 影响可用事件                               │
│   - 感性/理性: 影响专注力消耗和事件效果                     │
│   - 疲劳/饥饿: 需要通过休息和进食来恢复                     │
│   - 场景切换: 通过事件中的场景切换选项来改变位置            │
└─────────────────────────────────────────────────────────────┘`;
    } else {
      return `┌─────────────────────────────────────────────────────────────┐
│                        Game Help                            │
├─────────────────────────────────────────────────────────────┤
│ Game Objective:                                             │
│   Experience life as an engineer, finding balance between  │
│   emotional and rational paths                              │
│                                                             │
│ Basic Controls:                                             │
│   - Numbers 1+: Execute corresponding events               │
│   - s: Save game progress                                   │
│   - l: Load game progress                                   │
│   - i: View inventory                                       │
│   - h: Show help                                            │
│   - q: Quit game                                            │
│   - lang: Switch language                                   │
│                                                             │
│ Game Mechanics:                                             │
│   - Time system: 48 time units per day, 30 minutes each    │
│   - Workday/Weekend: Affects available events              │
│   - Emotional/Rational: Affects focus consumption & effects │
│   - Fatigue/Hunger: Need rest and food to recover          │
│   - Scene switching: Change location through scene events  │
└─────────────────────────────────────────────────────────────┘`;
    }
  }
} 