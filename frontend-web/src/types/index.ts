// 游戏状态类型
export interface GameState {
  resources: Record<number, number>
  game_over: boolean
  time_info: TimeInfo
  ending_data?: EndingData
}

// 时间信息
export interface TimeInfo {
  current_time: number
  time: number
  time_display: string
  hour: number
  day: number
  day_of_week: number
  is_weekend: boolean
  is_workday: boolean
  is_night: boolean
}

// 位置信息
export interface Location {
  location_id: number
  location_name: string
  location_description: string
}

// 实体信息
export interface Entity {
  entity_id: number
  entity_name: string
  can_interact: boolean
  available_events_count: number
}

// 事件信息
export interface GameEvent {
  event_id: number
  event_name_cn: string
  event_name_en: string
  time_cost: number
  can_execute: boolean
  requirements?: string
}

// 事件执行结果
export interface EventResult {
  success: boolean
  event_id: number
  game_text: string
  time_cost: number
  resource_changes: ResourceChange[]
  temporary_events: TemporaryEvent[]
  scheduled_tasks: ScheduledTask[]
}

// 资源变化
export interface ResourceChange {
  resource_id: number
  resource_name: string
  change: number | null
  new_value: number
}

// 临时事件
export interface TemporaryEvent {
  event_name: string
  description: string
}

// 计划任务
export interface ScheduledTask {
  task_name: string
  description: string
}

// 物品信息
export interface Inventory {
  slot: number
  item_id: number
  item_name: string
  quantity: number
  description?: string
}

// 结局数据
export interface EndingData {
  ending_id: number
  title: string
  description: string
  image_path?: string
}

// 后端响应
export interface BackendResponse<T = any> {
  type: string
  success: boolean
  data?: T
  error?: string
}

// 地图位置
export interface MapLocation {
  id: number
  name: string
  name_en: string
  description: string
  description_en: string
  icon: string
  background: string
} 