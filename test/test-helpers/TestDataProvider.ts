import { Resource, Event, Item, Entity, TemporaryEvent, ScheduledTask, Location, Ending, GameText, GameState } from '../../src/types';

export class TestDataProvider {
  static getBasicResources(): Resource[] {
    return [
      { resource_id: 1, resource_name: '时间', resource_name_en: 'Time', resource_type: 'system', initial_value: 0, max_value: 1440, min_value: 0, description: '当前时间' },
      { resource_id: 2, resource_name: '金钱', resource_name_en: 'Money', resource_type: 'basic', initial_value: 1000, max_value: 999999, min_value: 0, description: '拥有的金钱' },
      { resource_id: 13, resource_name: '健康', resource_name_en: 'Health', resource_type: 'basic', initial_value: 100, max_value: 100, min_value: 0, description: '身体健康状况' },
      { resource_id: 14, resource_name: '疲劳', resource_name_en: 'Fatigue', resource_type: 'basic', initial_value: 0, max_value: 100, min_value: 0, description: '疲劳程度' },
      { resource_id: 15, resource_name: '饥饿', resource_name_en: 'Hunger', resource_type: 'basic', initial_value: 0, max_value: 100, min_value: 0, description: '饥饿程度' },
      { resource_id: 18, resource_name: '专注力', resource_name_en: 'Focus', resource_type: 'basic', initial_value: 100, max_value: 100, min_value: 0, description: '专注力' },
      { resource_id: 20, resource_name: '技能', resource_name_en: 'Skill', resource_type: 'achievement', initial_value: 10, max_value: 100, min_value: 0, description: '技能水平' },
      { resource_id: 61, resource_name: '当前位置', resource_name_en: 'Current Location', resource_type: 'system', initial_value: 1, max_value: 10, min_value: 1, description: '当前所在位置' }
    ];
  }

  static getBasicEvents(): Event[] {
    return [
      {
        event_id: 1,
        event_name_cn: '工作',
        event_name_en: 'Work',
        time_cost: 60,
        condition_expression: 'always',
        location_requirement: 1,
        level_requirement: 0,
        text_id: 1,
        fatigue_change: 10,
        focus_change: -20,
        skill_change: 1,
        money_change: 100
      },
      {
        event_id: 2,
        event_name_cn: '休息',
        event_name_en: 'Rest',
        time_cost: 30,
        condition_expression: 'always',
        location_requirement: 1,
        level_requirement: 0,
        text_id: 2,
        fatigue_change: -20,
        health_change: 5
      },
      {
        event_id: 3,
        event_name_cn: '学习',
        event_name_en: 'Study',
        time_cost: 120,
        condition_expression: 'focus >= 30',
        location_requirement: 1,
        level_requirement: 0,
        text_id: 3,
        focus_change: -30,
        skill_change: 5,
        fatigue_change: 15
      }
    ];
  }

  static getBasicLocations(): Location[] {
    return [
      {
        location_id: 1,
        location_name: '办公室',
        description: '工作的地方',
        available_entities: [1, 2]
      },
      {
        location_id: 2,
        location_name: '家',
        description: '休息的地方',
        available_entities: [3]
      }
    ];
  }

  static getBasicEntities(): Entity[] {
    return [
      {
        entity_id: 1,
        entity_name: '电脑',
        entity_name_en: 'Computer',
        entity_type: 'object',
        location: 1,
        available_events: [1, 3],
        interaction_requirements: 'always'
      },
      {
        entity_id: 2,
        entity_name: '老板',
        entity_name_en: 'Boss',
        entity_type: 'person',
        location: 1,
        available_events: [4],
        interaction_requirements: 'skill >= 20'
      }
    ];
  }

  static getBasicGameTexts(): Map<number, GameText> {
    const textsMap = new Map<number, GameText>();
    [
      { text_id: 1, text_content: '你专心工作了一个小时', text_content_en: 'You worked hard for an hour' },
      { text_id: 2, text_content: '你休息了一下', text_content_en: 'You took a rest' },
      { text_id: 3, text_content: '你学习了新知识', text_content_en: 'You learned something new' }
    ].forEach(text => textsMap.set(text.text_id, text));
    return textsMap;
  }

  static getBasicTemporaryEvents(): TemporaryEvent[] {
    return [
      {
        temp_event_id: 1,
        event_name_cn: '加班通知',
        event_name_en: 'Overtime Notice',
        trigger_condition: 'time >= 540', // 9:00 AM
        trigger_type: 'once',
        max_triggers: 1,
        text_id: 10,
        fatigue_change: 5,
        boss_dissatisfaction_change: -2
      }
    ];
  }

  static getBasicScheduledTasks(): ScheduledTask[] {
    return [
      {
        task_id: 1,
        task_name: '每日签到',
        task_name_en: 'Daily Check-in',
        trigger_time: 'time[hour] == 8', // Use format that ConditionParser can understand
        trigger_condition: 'time == 480', // 8:00 AM
        is_active: true,
        repeat_type: 'daily',
        repeat_interval: 1,
        text_id: 20,
        money_change: '50'
      }
    ];
  }

  static getBasicEndings(): Ending[] {
    return [
      {
        ending_id: 1,
        ending_name: '过劳死',
        ending_name_en: 'Death by Overwork',
        ending_type: 'failure',
        trigger_condition: 'fatigue >= 100',
        ending_description: '因过度劳累而死亡',
        ending_description_en: 'Died from overwork',
        philosophy_message: '工作与生活的平衡很重要',
        philosophy_message_en: 'Work-life balance is important',
      },
      {
        ending_id: 2,
        ending_name: '升职成功',
        ending_name_en: 'Promotion Success',
        ending_type: 'achievement',
        trigger_condition: 'skill >= 80 && boss_dissatisfaction <= 10',
        ending_description: '成功获得升职',
        ending_description_en: 'Successfully got promoted',
        philosophy_message: '努力会有回报',
        philosophy_message_en: 'Hard work pays off',
      }
    ];
  }

  static getBasicGameState(): GameState {
    return {
      resources: {
        1: 480, // time - 8:00 AM
        2: 1000, // money
        13: 100, // health
        14: 0, // fatigue
        15: 0, // hunger
        18: 100, // focus
        20: 10, // skill
        61: 1 // current location
      },
      temporary_event_triggers: {},
      last_task_triggers: {},
      game_over: false,
      current_ending: undefined
    };
  }

  static createMockGameState(overrides: Partial<{
    time: number;
    money: number;
    health: number;
    fatigue: number;
    focus: number;
    skill: number;
    location: number;
    gameOver: boolean;
  }>): GameState {
    const baseState = this.getBasicGameState();
    const resources = { ...baseState.resources };
    
    if (overrides.time !== undefined) resources[1] = overrides.time;
    if (overrides.money !== undefined) resources[2] = overrides.money;
    if (overrides.health !== undefined) resources[13] = overrides.health;
    if (overrides.fatigue !== undefined) resources[14] = overrides.fatigue;
    if (overrides.focus !== undefined) resources[18] = overrides.focus;
    if (overrides.skill !== undefined) resources[20] = overrides.skill;
    if (overrides.location !== undefined) resources[61] = overrides.location;

    return {
      ...baseState,
      resources,
      game_over: overrides.gameOver || false
    };
  }
} 