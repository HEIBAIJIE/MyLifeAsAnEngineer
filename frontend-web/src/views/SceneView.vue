<template>
  <div class="scene-view" :style="sceneBackgroundStyle">
    <!-- 顶部状态栏 -->
    <div class="scene-header pixel-status-bar">
      <div class="status-left">
        <div class="pixel-status-item">
          <span class="pixel-status-label">📍 位置:</span>
          <span class="pixel-status-value">{{ currentLocationName }}</span>
        </div>
        <div class="pixel-status-item">
          <span class="pixel-status-label">🕐 时间:</span>
          <span class="pixel-status-value">{{ currentTimeDisplay }}</span>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="pixel-button small" @click="$emit('save-game')">💾</button>
        <button class="pixel-button small" @click="$emit('load-game')">📁</button>
        <button class="pixel-button small" @click="$emit('show-inventory')">🎒</button>
        <button class="pixel-button small" @click="$emit('go-to-worldmap')">🗺️</button>
        <button class="pixel-button small" @click="$emit('go-to-title')">🏠</button>
      </div>
    </div>
    
    <!-- 主游戏区域 -->
    <div class="scene-content">
      <!-- 左侧：角色状态 -->
      <div class="character-panel pixel-border">
        <h3 class="panel-title">👤 角色状态</h3>
        
        <!-- 基础属性 -->
        <div class="stats-section">
          <h4 class="section-title">基础属性</h4>
          <div class="stats-grid">
            <div v-for="stat in basicStats" :key="stat.key" class="stat-item">
              <span class="stat-icon">{{ stat.icon }}</span>
              <span class="stat-name">{{ stat.name }}</span>
              <span class="stat-value" :class="getStatValueClass(stat.value)">
                {{ stat.value }}
              </span>
              <!-- 进度条 -->
              <div class="pixel-progress" v-if="stat.max">
                <div 
                  class="pixel-progress-bar" 
                  :style="{ width: `${(stat.value / stat.max) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 职业属性 -->
        <div class="stats-section">
          <h4 class="section-title">职业属性</h4>
          <div class="stats-grid">
            <div v-for="stat in careerStats" :key="stat.key" class="stat-item">
              <span class="stat-icon">{{ stat.icon }}</span>
              <span class="stat-name">{{ stat.name }}</span>
              <span class="stat-value" :class="getStatValueClass(stat.value)">
                {{ stat.value }}
              </span>
              <div class="pixel-progress" v-if="stat.max">
                <div 
                  class="pixel-progress-bar" 
                  :style="{ width: `${(stat.value / stat.max) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 哲学属性 -->
        <div class="stats-section">
          <h4 class="section-title">哲学属性</h4>
          <div class="stats-grid">
            <div v-for="stat in philosophyStats" :key="stat.key" class="stat-item">
              <span class="stat-icon">{{ stat.icon }}</span>
              <span class="stat-name">{{ stat.name }}</span>
              <span class="stat-value" :class="getStatValueClass(stat.value)">
                {{ stat.value }}
              </span>
              <div class="pixel-progress" v-if="stat.max">
                <div 
                  class="pixel-progress-bar" 
                  :style="{ width: `${(stat.value / stat.max) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧：交互区域 -->
      <div class="interaction-panel pixel-border">
        <!-- 实体选择模式 -->
        <div v-if="!selectedEntity" class="entities-section">
          <h3 class="panel-title">🎯 可交互实体</h3>
          
          <div class="entities-grid">
            <div 
              v-for="entity in availableEntities" 
              :key="entity.entity_id"
              class="entity-card pixel-card"
              :class="{ 
                'disabled': !entity.can_interact,
                'interactive': entity.can_interact 
              }"
              @click="selectEntity(entity)"
            >
              <div class="entity-icon">{{ getEntityIcon(entity.entity_name) }}</div>
              <div class="entity-info">
                <div class="entity-name">{{ entity.entity_name }}</div>
                <div class="entity-events-count pixel-text-small">
                  {{ entity.available_events_count }} 个可用事件
                </div>
              </div>
              <div class="interaction-hint" v-if="entity.can_interact">
                👆 点击交互
              </div>
              <div class="no-interaction" v-else>
                🚫 无法交互
              </div>
            </div>
          </div>
        </div>
        
        <!-- 事件选择模式 -->
        <div v-else class="events-section">
          <div class="events-header">
            <button class="pixel-button small" @click="backToEntities">
              ← 返回实体
            </button>
            <h3 class="panel-title">
              与 "{{ selectedEntity.entity_name }}" 交互
            </h3>
          </div>
          
          <div class="events-grid" v-if="entityEvents && entityEvents.length > 0">
            <div 
              v-for="event in entityEvents" 
              :key="event.event_id"
              class="event-card pixel-card"
              :class="{ 
                'disabled': !event.can_execute,
                'executable': event.can_execute 
              }"
            >
              <div class="event-info">
                <div class="event-name">{{ event.event_name_cn }}</div>
                <div class="event-details">
                  <span class="event-time pixel-text-small">
                    ⏱️ 耗时: {{ event.time_cost }} 小时
                  </span>
                  <span v-if="event.requirements" class="event-requirements pixel-text-small">
                    📋 要求: {{ event.requirements }}
                  </span>
                </div>
              </div>
              
              <button 
                v-if="event.can_execute"
                class="pixel-button small event-execute-btn"
                @click="executeEvent(event.event_id)"
              >
                执行
              </button>
              <div v-else class="cannot-execute pixel-text-error">
                无法执行
              </div>
            </div>
          </div>
          
          <div v-else class="no-events pixel-text-small">
            该实体暂无可用事件
          </div>
        </div>
      </div>
    </div>
    
    <!-- 场景装饰 -->
    <div class="scene-decoration">
      <div class="decoration-element" v-for="i in 5" :key="i"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GameState, Location, Entity, GameEvent } from '../types'
import { BackendAdapter } from '../services/BackendAdapter'

// Props
interface Props {
  gameState?: GameState | null
  currentLocation?: Location | null
  availableEntities?: Entity[]
}

const props = defineProps<Props>()

// Events
const emit = defineEmits<{
  'save-game': []
  'load-game': []
  'show-inventory': []
  'go-to-worldmap': []
  'go-to-title': []
  'execute-event': [eventId: number]
}>()

// 响应式数据
const selectedEntity = ref<Entity | null>(null)
const entityEvents = ref<GameEvent[]>([])

// 创建后端适配器实例（从全局获取）
const backend = (window as any).backendAdapter as BackendAdapter

// 计算属性
const currentLocationName = computed(() => {
  return props.currentLocation?.location_name || '未知位置'
})

const currentTimeDisplay = computed(() => {
  if (!props.gameState?.time_info) {
    return '时间未知'
  }
  
  const timeInfo = props.gameState.time_info
  
  // 如果后端已经提供了格式化的时间显示，直接使用
  if (timeInfo.time_display) {
    return timeInfo.time_display
  }
  
  // 否则基于小时数进行格式化
  if (typeof timeInfo.hour !== 'undefined') {
    const hour = timeInfo.hour
    return `${hour.toString().padStart(2, '0')}:00`
  }
  
  // 如果有current_time，计算小时数
  if (typeof timeInfo.current_time !== 'undefined') {
    const hour = Math.floor((timeInfo.current_time % 48) / 2)
    return `${hour.toString().padStart(2, '0')}:00`
  }
  
  return '时间未知'
})

const sceneBackgroundStyle = computed(() => {
  const locationId = props.currentLocation?.location_id || 3
  const backgrounds: Record<number, string> = {
    1: 'linear-gradient(135deg, #34495e, #2c3e50)', // 公司
    2: 'linear-gradient(135deg, #8e44ad, #9b59b6)', // 商店
    3: 'linear-gradient(135deg, #27ae60, #2ecc71)', // 家
    4: 'linear-gradient(135deg, #16a085, #1abc9c)', // 公园
    5: 'linear-gradient(135deg, #e67e22, #f39c12)', // 餐馆
    6: 'linear-gradient(135deg, #e74c3c, #c0392b)'  // 医院
  }
  return { background: backgrounds[locationId] || backgrounds[3] }
})

// 基础属性
const basicStats = computed(() => {
  const resources = props.gameState?.resources || {}
  console.log('Basic stats resources data:', resources)
  return [
    { key: 'money', icon: '💰', name: '金钱', value: resources[2] || 0, max: null },
    { key: 'health', icon: '❤️', name: '健康', value: resources[13] || 0, max: 100 },
    { key: 'fatigue', icon: '😴', name: '疲劳', value: resources[14] || 0, max: 100 },
    { key: 'hunger', icon: '🍽️', name: '饥饿', value: resources[15] || 0, max: 100 },
    { key: 'focus', icon: '🎯', name: '专注', value: resources[18] || 0, max: 100 },
    { key: 'mood', icon: '😊', name: '心情', value: resources[19] || 0, max: 100 }
  ]
})

// 职业属性
const careerStats = computed(() => {
  const resources = props.gameState?.resources || {}
  console.log('Career stats resources data:', resources)
  return [
    { key: 'skill', icon: '🔧', name: '技能', value: resources[20] || 0, max: 100 },
    { key: 'level', icon: '👔', name: '职级', value: resources[22] || 0, max: 10 },
    { key: 'project', icon: '📊', name: '项目', value: resources[23] || 0, max: 100 },
    { key: 'boss', icon: '😠', name: '老板', value: resources[21] || 0, max: 100 }
  ]
})

// 哲学属性
const philosophyStats = computed(() => {
  const resources = props.gameState?.resources || {}
  console.log('Philosophy stats resources data:', resources)
  return [
    { key: 'rational', icon: '🧠', name: '理性', value: resources[16] || 0, max: 100 },
    { key: 'emotional', icon: '💖', name: '感性', value: resources[17] || 0, max: 100 },
    { key: 'social', icon: '🤝', name: '社交', value: resources[70] || 0, max: 100 },
    { key: 'reputation', icon: '🏆', name: '声誉', value: resources[71] || 0, max: 100 },
    { key: 'insight', icon: '🤔', name: '感悟', value: resources[72] || 0, max: 100 }
  ]
})

// 方法
const getStatValueClass = (value: number) => {
  if (value >= 80) return 'stat-high'
  if (value >= 50) return 'stat-medium'
  if (value >= 20) return 'stat-low'
  return 'stat-critical'
}

const getEntityIcon = (entityName: string) => {
  const icons: Record<string, string> = {
    '老板': '👔',
    '同事1': '👨‍💻',
    '同事2': '👩‍💻',
    '同事3': '🧑‍💻',
    '电脑': '💻',
    '工作电脑': '💻',
    '手机': '📱',
    '走廊': '🚶',
    '厕所': '🚽',
    '自己': '🧑‍💼',
    '会议室': '🏢',
    '食堂': '🍽️',
    '售货员': '👨‍💼',
    '书架': '📚',
    '床': '🛏️',
    '冰箱': '❄️',
    '柜子': '📦'
  }
  return icons[entityName] || '❓'
}

const selectEntity = async (entity: Entity) => {
  if (!entity.can_interact) return
  
  selectedEntity.value = entity
  
  try {
    // 调用后端获取实体事件
    const eventsData = await backend.getEntityEvents(entity.entity_id)
    entityEvents.value = eventsData.available_events || []
  } catch (error) {
    console.error('Failed to get entity events:', error)
    // 如果获取失败，使用空数组
    entityEvents.value = []
  }
}

const backToEntities = () => {
  selectedEntity.value = null
  entityEvents.value = []
}

const executeEvent = (eventId: number) => {
  emit('execute-event', eventId)
}
</script>

<style scoped>
.scene-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.scene-header {
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.status-left {
  display: flex;
  gap: clamp(16px, 2vw, 24px);
}

.action-buttons {
  display: flex;
  gap: clamp(6px, 1vw, 12px);
}

.scene-content {
  flex: 1;
  display: flex;
  gap: clamp(12px, 2vw, 20px);
  padding: clamp(12px, 2vw, 20px);
  overflow: hidden;
}

.character-panel {
  width: clamp(250px, 25vw, 350px);
  background: rgba(0, 17, 0, 0.9);
  padding: clamp(12px, 2vw, 20px);
  overflow-y: auto;
}

.interaction-panel {
  flex: 1;
  background: rgba(0, 17, 0, 0.9);
  padding: clamp(12px, 2vw, 20px);
  overflow-y: auto;
}

.panel-title {
  color: #00ff00;
  font-size: var(--ui-font-size);
  margin-bottom: clamp(12px, 1.5vw, 20px);
  text-align: center;
  border-bottom: 1px solid #004400;
  padding-bottom: clamp(6px, 1vw, 10px);
}

.stats-section {
  margin-bottom: clamp(16px, 2vw, 24px);
}

.section-title {
  color: #ffff00;
  font-size: var(--small-font-size);
  margin-bottom: clamp(8px, 1.2vw, 16px);
  text-align: center;
}

.stats-grid {
  display: grid;
  gap: clamp(6px, 1vw, 12px);
}

.stat-item {
  display: grid;
  grid-template-columns: clamp(16px, 2vw, 24px) 1fr auto;
  grid-template-rows: auto auto;
  gap: clamp(3px, 0.5vw, 6px);
  align-items: center;
  padding: clamp(4px, 0.8vw, 8px);
  background: rgba(0, 34, 0, 0.5);
  border: 1px solid #004400;
}

.stat-icon {
  grid-row: 1 / 3;
  font-size: var(--ui-font-size);
  text-align: center;
}

.stat-name {
  font-size: var(--small-font-size);
  color: #aaffaa;
}

.stat-value {
  font-size: var(--small-font-size);
  text-align: right;
  font-weight: bold;
}

.stat-value.stat-high { color: #44ff44; }
.stat-value.stat-medium { color: #ffff44; }
.stat-value.stat-low { color: #ff8844; }
.stat-value.stat-critical { color: #ff4444; }

.pixel-progress {
  grid-column: 2 / 4;
  height: clamp(4px, 0.8vw, 8px);
  margin-top: clamp(2px, 0.3vw, 4px);
}

.entities-grid {
  display: grid;
  gap: clamp(8px, 1.5vw, 16px);
  grid-template-columns: repeat(auto-fit, minmax(clamp(180px, 25vw, 220px), 1fr));
}

.entity-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(12px, 2vw, 20px);
  text-align: center;
  min-height: clamp(100px, 15vw, 140px);
  justify-content: space-between;
}

.entity-card.interactive:hover {
  transform: translateY(-2px);
}

.entity-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.entity-icon {
  font-size: clamp(24px, 4vw, 48px);
  margin-bottom: clamp(6px, 1vw, 12px);
}

.entity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.entity-name {
  font-size: var(--ui-font-size);
  color: #00ff00;
  margin-bottom: clamp(3px, 0.5vw, 6px);
}

.entity-events-count {
  color: #aaffaa;
  font-size: var(--small-font-size);
}

.interaction-hint {
  color: #ffff00;
  font-size: var(--tiny-font-size);
  margin-top: clamp(6px, 1vw, 10px);
}

.no-interaction {
  color: #666;
  font-size: var(--tiny-font-size);
  margin-top: clamp(6px, 1vw, 10px);
}

.events-header {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.5vw, 16px);
  margin-bottom: clamp(12px, 2vw, 20px);
}

.events-grid {
  display: grid;
  gap: clamp(8px, 1.5vw, 16px);
}

.event-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(10px, 1.5vw, 16px);
}

.event-card.executable:hover {
  background: rgba(0, 68, 0, 0.7);
}

.event-card.disabled {
  opacity: 0.5;
}

.event-info {
  flex: 1;
}

.event-name {
  font-size: var(--ui-font-size);
  color: #00ff00;
  margin-bottom: clamp(3px, 0.5vw, 6px);
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: clamp(2px, 0.3vw, 4px);
}

.event-time {
  color: #aaffaa;
  font-size: var(--small-font-size);
}

.event-requirements {
  color: #ffaa00;
  font-size: var(--small-font-size);
}

.event-execute-btn {
  margin-left: clamp(8px, 1.2vw, 16px);
}

.cannot-execute {
  font-size: var(--small-font-size);
  margin-left: clamp(8px, 1.2vw, 16px);
}

.no-events {
  text-align: center;
  padding: clamp(16px, 2.5vw, 24px);
  color: #666;
  font-size: var(--ui-font-size);
}

.scene-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration-element {
  position: absolute;
  width: clamp(2px, 0.3vw, 4px);
  height: clamp(2px, 0.3vw, 4px);
  background: #00ff00;
  opacity: 0.2;
  animation: decoration-twinkle 3s infinite;
}

.decoration-element:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
.decoration-element:nth-child(2) { top: 40%; left: 90%; animation-delay: 0.6s; }
.decoration-element:nth-child(3) { top: 60%; left: 5%; animation-delay: 1.2s; }
.decoration-element:nth-child(4) { top: 80%; left: 85%; animation-delay: 1.8s; }
.decoration-element:nth-child(5) { top: 10%; left: 70%; animation-delay: 2.4s; }

@keyframes decoration-twinkle {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .character-panel {
    width: clamp(220px, 22vw, 280px);
  }
  
  .entities-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .scene-content {
    flex-direction: column;
    gap: clamp(8px, 1.5vw, 16px);
  }
  
  .character-panel {
    width: 100%;
    height: clamp(180px, 25vh, 240px);
  }
  
  .interaction-panel {
    flex: 1;
  }
  
  .status-left {
    flex-direction: column;
    gap: clamp(3px, 0.5vw, 6px);
  }
  
  .action-buttons {
    flex-wrap: wrap;
    gap: clamp(3px, 0.5vw, 6px);
  }
}

@media (max-width: 480px) {
  .scene-content {
    padding: clamp(6px, 1vw, 12px);
  }
  
  .character-panel,
  .interaction-panel {
    padding: clamp(6px, 1vw, 12px);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .entity-card {
    min-height: clamp(80px, 12vw, 120px);
    padding: clamp(6px, 1vw, 12px);
  }
  
  .entity-icon {
    font-size: clamp(20px, 3vw, 32px);
  }
}
</style> 