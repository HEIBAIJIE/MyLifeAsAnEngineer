// Resource types
export interface Resource {
  resource_id: number;
  resource_name: string;
  resource_type: 'basic' | 'inventory' | 'storage' | 'social' | 'achievement' | 'permanent' | 'system';
  initial_value: number;
  max_value: number;
  min_value: number;
  description: string;
}

// Event types
export interface Event {
  event_id: number;
  event_name: string;
  time_cost: number;
  location_requirement: number;
  level_requirement: number;
  min_condition?: string;
  max_condition?: string;
  condition_expression: string;
  fatigue_change?: number;
  health_change?: number;
  hunger_change?: number;
  rational_change?: number;
  emotional_change?: number;
  focus_change?: number;
  mood_change?: number;
  skill_change?: number;
  boss_dissatisfaction_change?: number;
  job_level_change?: number;
  project_progress_change?: number | string;
  money_change?: number;
  books_change?: number;
  colleague1_favor_change?: number;
  colleague1_skill_change?: number;
  colleague2_favor_change?: number;
  colleague2_skill_change?: number;
  colleague3_favor_change?: number;
  colleague3_skill_change?: number;
  social_influence_change?: number;
  tech_reputation_change?: number;
  philosophy_insight_change?: number;
  item_gained?: string;
  item_quantity?: number;
  permanent_effect_change?: string;
  text_id: number;
}

// Item types
export interface Item {
  item_id: number;
  item_name: string;
  item_type: 'food' | 'tool' | 'book' | 'other';
  price: number;
  storage_location: 'inventory' | 'refrigerator' | 'cabinet';
  fatigue_change?: number;
  health_change?: number;
  hunger_change?: number;
  rational_change?: number;
  emotional_change?: number;
  focus_change?: number;
  mood_change?: number;
  skill_change?: number;
  permanent_effect_type?: string;
  permanent_effect_value?: number;
  books_change?: number;
  description_cn: string;
  description_en: string;
}

// Entity types
export interface Entity {
  entity_id: number;
  entity_name: string;
  entity_type: 'person' | 'object' | 'facility';
  location: number;
  available_events: number[];
  interaction_requirements: string;
}

// Temporary event types
export interface TemporaryEvent {
  temp_event_id: number;
  event_name: string;
  trigger_condition: string;
  trigger_type: 'once' | 'repeatable';
  max_triggers: number;
  fatigue_change?: number;
  health_change?: number;
  hunger_change?: number;
  rational_change?: number;
  emotional_change?: number;
  focus_change?: number;
  mood_change?: number;
  skill_change?: number;
  boss_dissatisfaction_change?: number;
  job_level_change?: number;
  project_progress_change?: string;
  money_change?: number;
  books_change?: number;
  colleague1_favor_change?: number;
  colleague1_skill_change?: number;
  colleague2_favor_change?: number;
  colleague2_skill_change?: number;
  colleague3_favor_change?: number;
  colleague3_skill_change?: number;
  social_influence_change?: number;
  tech_reputation_change?: number;
  philosophy_insight_change?: number;
  ending_triggered?: number;
  text_id: number | string;
}

// Scheduled task types
export interface ScheduledTask {
  task_id: number;
  task_name: string;
  trigger_time: string;
  trigger_condition: string;
  is_active: boolean;
  repeat_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  repeat_interval: number;
  fatigue_change?: number;
  health_change?: number;
  hunger_change?: number;
  rational_change?: number;
  emotional_change?: number;
  focus_change?: number;
  mood_change?: number;
  skill_change?: number;
  boss_dissatisfaction_change?: number;
  job_level_change?: number;
  project_progress_change?: string;
  money_change?: string;
  books_change?: number;
  colleague1_favor_change?: number;
  colleague1_skill_change?: number;
  colleague2_favor_change?: number;
  colleague2_skill_change?: number;
  colleague3_favor_change?: number;
  colleague3_skill_change?: number;
  social_influence_change?: number;
  tech_reputation_change?: number;
  philosophy_insight_change?: number;
  text_id: number | string;
}

// Location types
export interface Location {
  location_id: number;
  location_name: string;
  description: string;
  available_entities: number[];
}

// Ending types
export interface Ending {
  ending_id: number;
  ending_name: string;
  ending_name_en: string;
  ending_type: 'failure' | 'achievement' | 'balance';
  trigger_condition: string;
  ending_description: string;
  ending_description_en: string;
  philosophy_message: string;
  philosophy_message_en: string;
}

// Game text types
export interface GameText {
  text_id: number;
  text_content: string;
  text_content_en: string;
}

// Command types
export type CommandType = 
  | 'execute_event' 
  | 'query_resource' 
  | 'query_location' 
  | 'query_available_events'
  | 'query_inventory'
  | 'use_item'
  | 'save_game'
  | 'load_game'
  | 'get_game_state'
  | 'get_time_info';

export interface Command {
  type: CommandType;
  params: Record<string, any>;
}

// Response types
export interface EventResult {
  success: boolean;
  event_id: number;
  event_name: string;
  text_id: number;
  text_content: string;
  time_consumed: number;
  resource_changes: Record<number, number>;
  temporary_events_triggered: TemporaryEventResult[];
  scheduled_tasks_triggered: ScheduledTaskResult[];
  ending_triggered?: Ending;
}

export interface TemporaryEventResult {
  temp_event_id: number;
  event_name: string;
  text_id: number | string;
  text_content: string;
  resource_changes: Record<number, number>;
  ending_triggered?: Ending;
}

export interface ScheduledTaskResult {
  task_id: number;
  task_name: string;
  text_id: number | string;
  text_content: string;
  resource_changes: Record<number, number>;
}

export interface Response {
  type: 'event_result' | 'query_result' | 'error' | 'game_saved' | 'game_loaded';
  data: any;
  error?: string;
}

// Game state
export interface GameState {
  resources: Record<number, number>;
  temporary_event_triggers: Record<number, number>;
  last_task_triggers: Record<number, number>;
  game_over: boolean;
  current_ending?: Ending;
}

// Time info
export interface TimeInfo {
  current_time: number;
  hour: number;
  day: number;
  day_of_week: number;
  is_weekend: boolean;
  is_workday: boolean;
  is_night: boolean;
} 