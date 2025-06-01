// Frontend-specific types
export interface GameState {
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

export interface AvailableEvent {
  event_id: number;
  event_name_cn: string;
  event_name_en: string;
  time_cost: number;
}

export interface EventResult {
  success: boolean;
  game_text?: string;
  time_cost: number;
  resource_changes?: Array<{
    resource_id: number;
    resource_name: string;
    change: number;
  }>;
  temporary_events?: Array<{
    event_name: string;
    description: string;
  }>;
  scheduled_tasks?: Array<{
    task_name: string;
    description: string;
  }>;
}

export interface InventoryItem {
  slot: number;
  item_name: string;
  quantity: number;
}

export interface LocationInfo {
  location_name: string;
  location_id: number;
}

export interface SaveData {
  save_data: string;
}

export interface SaveResult {
  success: boolean;
  saveData?: string;
  error?: string;
}

export interface LoadResult {
  success: boolean;
  error?: string;
}

export type Language = 'zh' | 'en';

export interface UITexts {
  gameStatus: string;
  time: string;
  location: string;
  weekend: string;
  workday: string;
  night: string;
  day: string;
  money: string;
  health: string;
  fatigue: string;
  hunger: string;
  rational: string;
  emotional: string;
  focus: string;
  mood: string;
  skill: string;
  jobLevel: string;
  project: string;
  boss: string;
  socialInfluence: string;
  techReputation: string;
  philosophyInsight: string;
  weekDays: string[];
  availableActions: string;
  currentSceneEvents: string;
  noEventsAvailable: string;
  quickActions: string;
  mediumActions: string;
  longActions: string;
  otherActions: string;
  save: string;
  load: string;
  inventory: string;
  help: string;
  quit: string;
  switchLang: string;
  hour: string;
  executing: string;
  estimatedTime: string;
  confirm: string;
  cancelled: string;
  success: string;
  failed: string;
  resourceChanges: string;
  tempEvents: string;
  scheduledTasks: string;
}

export interface GameCommand {
  type: string;
  params?: Record<string, any>;
  language?: Language;
}

export interface GameResponse {
  type: string;
  data?: any;
  error?: string;
} 