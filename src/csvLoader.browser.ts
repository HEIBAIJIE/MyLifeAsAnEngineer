import {
  Resource,
  Event,
  Item,
  Entity,
  TemporaryEvent,
  ScheduledTask,
  Location,
  Ending,
  GameText
} from './types';

// 浏览器版本的CSVLoader，使用预加载的数据
export class CSVLoader {
  private gameData: any;

  constructor() {
    // 在浏览器环境中，我们将使用预定义的游戏数据
    this.gameData = this.getDefaultGameData();
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  private getDefaultGameData() {
    return {
      resources: [
        { resource_id: 1, resource_name: '金钱', initial_value: 1000 },
        { resource_id: 2, resource_name: '健康', initial_value: 100 },
        { resource_id: 3, resource_name: '疲劳', initial_value: 0 },
        { resource_id: 4, resource_name: '饥饿', initial_value: 0 },
        { resource_id: 5, resource_name: '理性', initial_value: 50 },
        { resource_id: 6, resource_name: '感性', initial_value: 50 },
        { resource_id: 7, resource_name: '专注', initial_value: 50 },
        { resource_id: 8, resource_name: '心情', initial_value: 50 },
        { resource_id: 9, resource_name: '技能', initial_value: 1 },
        { resource_id: 10, resource_name: '职级', initial_value: 1 },
        { resource_id: 23, resource_name: '项目', initial_value: 0 },
        { resource_id: 24, resource_name: '老板', initial_value: 0 },
        { resource_id: 25, resource_name: '社交', initial_value: 0 },
        { resource_id: 26, resource_name: '声誉', initial_value: 0 },
        { resource_id: 27, resource_name: '感悟', initial_value: 0 },
        { resource_id: 61, resource_name: '位置', initial_value: 3 }
      ],
      events: [
        // 旅行事件 (1-30)
        { event_id: 1, event_name_cn: '前往公司', event_name_en: 'Go to Company', time_cost: 1, location_requirement: 2, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=1', text_id: 1001 },
        { event_id: 2, event_name_cn: '前往商店', event_name_en: 'Go to Store', time_cost: 1, location_requirement: 1, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=2', text_id: 1002 },
        { event_id: 3, event_name_cn: '前往家', event_name_en: 'Go to Home', time_cost: 1, location_requirement: 1, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=3', text_id: 1003 },
        { event_id: 4, event_name_cn: '前往公园', event_name_en: 'Go to Park', time_cost: 1, location_requirement: 1, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=4', text_id: 1004 },
        { event_id: 5, event_name_cn: '前往餐馆', event_name_en: 'Go to Restaurant', time_cost: 1, location_requirement: 1, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=5', text_id: 1005 },
        { event_id: 6, event_name_cn: '前往医院', event_name_en: 'Go to Hospital', time_cost: 1, location_requirement: 1, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=6', text_id: 1006 },
        { event_id: 7, event_name_cn: '前往公司', event_name_en: 'Go to Company', time_cost: 1, location_requirement: 3, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=1', text_id: 1007 },
        { event_id: 8, event_name_cn: '前往商店', event_name_en: 'Go to Store', time_cost: 1, location_requirement: 3, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=2', text_id: 1008 },
        { event_id: 9, event_name_cn: '前往家', event_name_en: 'Go to Home', time_cost: 1, location_requirement: 2, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=3', text_id: 1009 },
        { event_id: 10, event_name_cn: '前往公园', event_name_en: 'Go to Park', time_cost: 1, location_requirement: 2, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=4', text_id: 1010 },
        { event_id: 11, event_name_cn: '前往餐馆', event_name_en: 'Go to Restaurant', time_cost: 1, location_requirement: 2, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=5', text_id: 1011 },
        { event_id: 12, event_name_cn: '前往医院', event_name_en: 'Go to Hospital', time_cost: 1, location_requirement: 2, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=6', text_id: 1012 },
        { event_id: 13, event_name_cn: '前往公司', event_name_en: 'Go to Company', time_cost: 1, location_requirement: 4, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=1', text_id: 1013 },
        { event_id: 14, event_name_cn: '前往商店', event_name_en: 'Go to Store', time_cost: 1, location_requirement: 4, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=2', text_id: 1014 },
        { event_id: 15, event_name_cn: '前往家', event_name_en: 'Go to Home', time_cost: 1, location_requirement: 4, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=3', text_id: 1015 },
        { event_id: 16, event_name_cn: '前往公园', event_name_en: 'Go to Park', time_cost: 1, location_requirement: 3, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=4', text_id: 1016 },
        { event_id: 17, event_name_cn: '前往餐馆', event_name_en: 'Go to Restaurant', time_cost: 1, location_requirement: 3, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=5', text_id: 1017 },
        { event_id: 18, event_name_cn: '前往医院', event_name_en: 'Go to Hospital', time_cost: 1, location_requirement: 3, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=6', text_id: 1018 },
        { event_id: 19, event_name_cn: '前往公司', event_name_en: 'Go to Company', time_cost: 1, location_requirement: 5, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=1', text_id: 1019 },
        { event_id: 20, event_name_cn: '前往商店', event_name_en: 'Go to Store', time_cost: 1, location_requirement: 5, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=2', text_id: 1020 },
        { event_id: 21, event_name_cn: '前往家', event_name_en: 'Go to Home', time_cost: 1, location_requirement: 5, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=3', text_id: 1021 },
        { event_id: 22, event_name_cn: '前往公园', event_name_en: 'Go to Park', time_cost: 1, location_requirement: 5, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=4', text_id: 1022 },
        { event_id: 23, event_name_cn: '前往餐馆', event_name_en: 'Go to Restaurant', time_cost: 1, location_requirement: 4, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=5', text_id: 1023 },
        { event_id: 24, event_name_cn: '前往医院', event_name_en: 'Go to Hospital', time_cost: 1, location_requirement: 4, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=6', text_id: 1024 },
        { event_id: 25, event_name_cn: '前往公司', event_name_en: 'Go to Company', time_cost: 1, location_requirement: 6, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=1', text_id: 1025 },
        { event_id: 26, event_name_cn: '前往商店', event_name_en: 'Go to Store', time_cost: 1, location_requirement: 6, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=2', text_id: 1026 },
        { event_id: 27, event_name_cn: '前往家', event_name_en: 'Go to Home', time_cost: 1, location_requirement: 6, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=3', text_id: 1027 },
        { event_id: 28, event_name_cn: '前往公园', event_name_en: 'Go to Park', time_cost: 1, location_requirement: 6, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=4', text_id: 1028 },
        { event_id: 29, event_name_cn: '前往餐馆', event_name_en: 'Go to Restaurant', time_cost: 1, location_requirement: 6, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=5', text_id: 1029 },
        { event_id: 30, event_name_cn: '前往医院', event_name_en: 'Go to Hospital', time_cost: 1, location_requirement: 5, level_requirement: 0, condition_expression: 'always', permanent_effect_change: 'set[61]=6', text_id: 1030 },
        
        // 原有的其他事件
        {
          event_id: 101,
          event_name_cn: '睡觉',
          event_name_en: 'Sleep',
          time_cost: 8,
          location_requirement: 3,
          level_requirement: 0,
          condition_expression: 'always',
          health_change: 20,
          fatigue_change: -50,
          mood_change: 10,
          text_id: 1001
        },
        {
          event_id: 102,
          event_name_cn: '吃饭',
          event_name_en: 'Eat',
          time_cost: 1,
          location_requirement: 0,
          level_requirement: 0,
          condition_expression: 'always',
          hunger_change: -30,
          mood_change: 5,
          text_id: 1002
        },
        {
          event_id: 103,
          event_name_cn: '去公司',
          event_name_en: 'Go to Company',
          time_cost: 1,
          location_requirement: 3,
          level_requirement: 0,
          condition_expression: 'always',
          permanent_effect_change: 'set[61]=1',
          text_id: 1003
        },
        {
          event_id: 104,
          event_name_cn: '回家',
          event_name_en: 'Go Home',
          time_cost: 1,
          location_requirement: 0,
          level_requirement: 0,
          condition_expression: 'resource[61]!=3',
          permanent_effect_change: 'set[61]=3',
          text_id: 1004
        },
        {
          event_id: 201,
          event_name_cn: '学习编程',
          event_name_en: 'Study Programming',
          time_cost: 2,
          location_requirement: 3,
          level_requirement: 0,
          condition_expression: 'always',
          skill_change: 1,
          focus_change: -10,
          fatigue_change: 10,
          text_id: 1005
        },
        {
          event_id: 202,
          event_name_cn: '看视频',
          event_name_en: 'Watch Videos',
          time_cost: 1,
          location_requirement: 3,
          level_requirement: 0,
          condition_expression: 'always',
          mood_change: 10,
          fatigue_change: 5,
          text_id: 1006
        },
        {
          event_id: 301,
          event_name_cn: '刷社交媒体',
          event_name_en: 'Browse Social Media',
          time_cost: 1,
          location_requirement: 0,
          level_requirement: 0,
          condition_expression: 'always',
          mood_change: 5,
          fatigue_change: 5,
          text_id: 1007
        },
        {
          event_id: 401,
          event_name_cn: '汇报工作',
          event_name_en: 'Report Work',
          time_cost: 1,
          location_requirement: 1,
          level_requirement: 0,
          condition_expression: 'always',
          boss_dissatisfaction_change: 5,
          fatigue_change: 10,
          text_id: 1008
        },
        {
          event_id: 501,
          event_name_cn: '写代码',
          event_name_en: 'Write Code',
          time_cost: 2,
          location_requirement: 1,
          level_requirement: 0,
          condition_expression: 'always',
          skill_change: 1,
          project_progress_change: 5,
          fatigue_change: 15,
          text_id: 1009
        }
      ],
      entities: [
        {
          entity_id: 1,
          entity_name: '自己',
          entity_name_en: 'Self',
          entity_type: 'person',
          location: 3,
          available_events: [101, 102, 103, 104],
          interaction_requirements: 'always'
        },
        {
          entity_id: 2,
          entity_name: '电脑',
          entity_name_en: 'Computer',
          entity_type: 'object',
          location: 3,
          available_events: [201, 202],
          interaction_requirements: 'location==3'
        },
        {
          entity_id: 3,
          entity_name: '手机',
          entity_name_en: 'Phone',
          entity_type: 'object',
          location: 3,
          available_events: [301],
          interaction_requirements: 'always'
        },
        {
          entity_id: 11,
          entity_name: '老板',
          entity_name_en: 'Boss',
          entity_type: 'person',
          location: 1,
          available_events: [401],
          interaction_requirements: 'location==1'
        },
        {
          entity_id: 12,
          entity_name: '同事1',
          entity_name_en: 'Colleague 1',
          entity_type: 'person',
          location: 1,
          available_events: [],
          interaction_requirements: 'location==1'
        },
        {
          entity_id: 13,
          entity_name: '工作电脑',
          entity_name_en: 'Work Computer',
          entity_type: 'object',
          location: 1,
          available_events: [501],
          interaction_requirements: 'location==1'
        }
      ],
      locations: [
        {
          location_id: 1,
          location_name: '公司',
          location_name_en: 'Company',
          available_entities: [11, 12, 13]
        },
        {
          location_id: 2,
          location_name: '商店',
          location_name_en: 'Store',
          available_entities: []
        },
        {
          location_id: 3,
          location_name: '家',
          location_name_en: 'Home',
          available_entities: [1, 2, 3]
        },
        {
          location_id: 4,
          location_name: '公园',
          location_name_en: 'Park',
          available_entities: []
        },
        {
          location_id: 5,
          location_name: '餐馆',
          location_name_en: 'Restaurant',
          available_entities: []
        },
        {
          location_id: 6,
          location_name: '医院',
          location_name_en: 'Hospital',
          available_entities: []
        }
      ],
      gameTexts: [
        { text_id: 1001, text_content_cn: '你睡了一觉，感觉精神多了。', text_content_en: 'You slept and feel more energetic.' },
        { text_id: 1002, text_content_cn: '你吃了一顿饭，饥饿感减少了。', text_content_en: 'You had a meal and feel less hungry.' },
        { text_id: 1003, text_content_cn: '你来到了公司。', text_content_en: 'You arrived at the company.' },
        { text_id: 1004, text_content_cn: '你回到了家。', text_content_en: 'You returned home.' },
        { text_id: 1005, text_content_cn: '你学习了编程，技能有所提升。', text_content_en: 'You studied programming and improved your skills.' },
        { text_id: 1006, text_content_cn: '你看了一些视频，心情变好了。', text_content_en: 'You watched some videos and feel better.' },
        { text_id: 1007, text_content_cn: '你刷了一会儿社交媒体。', text_content_en: 'You browsed social media for a while.' },
        { text_id: 1008, text_content_cn: '你向老板汇报了工作进度。', text_content_en: 'You reported your work progress to the boss.' },
        { text_id: 1009, text_content_cn: '你写了一些代码，项目有所进展。', text_content_en: 'You wrote some code and made progress on the project.' }
      ],
      items: [],
      temporaryEvents: [],
      scheduledTasks: [],
      endings: []
    };
  }

  loadResources(): Resource[] {
    return this.gameData.resources;
  }

  loadEvents(): Event[] {
    return this.gameData.events.map((event: any) => {
      // Convert string event IDs that include scene transitions
      if (typeof event.event_id === 'string' && (event.event_id as string).includes('-')) {
        const [from, to] = (event.event_id as string).split('-').map(Number);
        event.event_id = from * 100 + to;
      }
      return event;
    });
  }

  loadItems(): Item[] {
    return this.gameData.items;
  }

  loadEntities(): Entity[] {
    return this.gameData.entities.map((rawEntity: any) => {
      const entity: Entity = {
        entity_id: rawEntity.entity_id,
        entity_name: rawEntity.entity_name,
        entity_name_en: rawEntity.entity_name_en,
        entity_type: rawEntity.entity_type,
        location: rawEntity.location,
        available_events: rawEntity.available_events || [],
        interaction_requirements: rawEntity.interaction_requirements || 'always'
      };
      return entity;
    });
  }

  loadTemporaryEvents(): TemporaryEvent[] {
    return this.gameData.temporaryEvents;
  }

  loadScheduledTasks(): ScheduledTask[] {
    return this.gameData.scheduledTasks;
  }

  loadLocations(): Location[] {
    return this.gameData.locations.map((location: any) => {
      if (typeof location.available_entities === 'string') {
        location.available_entities = (location.available_entities as string)
          .split(';')
          .map(e => parseInt(e.trim()))
          .filter(e => !isNaN(e));
      }
      return location;
    });
  }

  loadEndings(): Ending[] {
    return this.gameData.endings;
  }

  loadGameTexts(): Map<number, GameText> {
    const textsMap = new Map<number, GameText>();
    this.gameData.gameTexts.forEach((text: GameText) => {
      textsMap.set(text.text_id, text);
    });
    return textsMap;
  }

  // Helper method to load all data at once
  loadAllData() {
    return {
      resources: this.loadResources(),
      events: this.loadEvents(),
      items: this.loadItems(),
      entities: this.loadEntities(),
      temporaryEvents: this.loadTemporaryEvents(),
      scheduledTasks: this.loadScheduledTasks(),
      locations: this.loadLocations(),
      endings: this.loadEndings(),
      gameTexts: this.loadGameTexts()
    };
  }
} 