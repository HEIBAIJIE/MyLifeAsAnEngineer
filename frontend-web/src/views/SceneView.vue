<template>
  <div class="scene-view" :style="sceneBackgroundStyle">
    <!-- 顶部状态栏 -->
    <div class="scene-header pixel-status-bar">
      <div class="status-left">
        <div class="pixel-status-item">
          <span class="pixel-status-label">📍 {{ t('location') }}:</span>
          <span class="pixel-status-value">{{ currentLocationName }}</span>
        </div>
        <div class="pixel-status-item">
          <span class="pixel-status-label">🕐 {{ t('time') }}:</span>
          <span class="pixel-status-value">{{ currentTimeDisplay }}</span>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="pixel-button small" @click="$emit('save-game')" :title="t('save')">
          💾 <span class="btn-text">{{ t('save') }}</span>
        </button>
        <button class="pixel-button small" @click="$emit('load-game')" :title="t('load')">
          📁 <span class="btn-text">{{ t('load') }}</span>
        </button>
        <button class="pixel-button small" @click="$emit('show-inventory')" :title="t('inventory')">
          🎒 <span class="btn-text">{{ t('inventory') }}</span>
        </button>
        <button class="pixel-button small" @click="$emit('go-to-worldmap')" :title="t('worldMap')">
          🗺️ <span class="btn-text">{{ t('worldMap') }}</span>
        </button>
        <button class="pixel-button small" @click="$emit('go-to-title')" :title="t('home')">
          🏠 <span class="btn-text">{{ t('home') }}</span>
        </button>
        <!-- 语言选择器 -->
        <div class="language-selector-inline">
          <button 
            class="pixel-button small lang-btn"
            :class="{ active: currentLanguage === 'zh' }"
            @click="switchLanguage('zh')"
            :title="currentLanguage === 'zh' ? 'Switch to English' : '切换为中文'"
          >
            中
          </button>
          <button 
            class="pixel-button small lang-btn"
            :class="{ active: currentLanguage === 'en' }"
            @click="switchLanguage('en')"
            :title="currentLanguage === 'zh' ? 'Switch to English' : '切换为中文'"
          >
            EN
          </button>
        </div>
      </div>
    </div>
    
    <!-- 主游戏区域 -->
    <div class="scene-content">
      <!-- 左侧：角色状态 -->
      <div class="character-panel pixel-border">
        <h3 class="panel-title">👤 {{ t('characterStatus') }}</h3>
        
        <!-- 基础属性 -->
        <div class="stats-section">
          <h4 class="section-title">{{ t('basicStats') }}</h4>
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
          <h4 class="section-title">{{ t('careerStats') }}</h4>
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
          <h4 class="section-title">{{ t('philosophyStats') }}</h4>
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
          <h3 class="panel-title">{{ t('availableEntities') }}</h3>
          
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
                <div class="entity-name">{{ getTranslatedEntityName(entity.entity_name) }}</div>
                <div class="entity-description pixel-text-small">
                  {{ getEntityDescription(entity) }}
                </div>
              </div>
              <div class="interaction-hint" v-if="entity.can_interact">
                👆 {{ t('clickToInteract') }}
              </div>
              <div class="no-interaction" v-else>
                🚫 {{ t('cannotInteract') }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 事件选择模式 -->
        <div v-else class="events-section">
          <div class="events-header">
            <button class="pixel-button small" @click="backToEntities">
              ← {{ t('returnToEntities') }}
            </button>
            <h3 class="panel-title">
              {{ t('interactWith') }} "{{ getTranslatedEntityName(selectedEntity.entity_name) }}"
            </h3>
          </div>
          
          <div class="events-grid" v-if="filteredEntityEvents && filteredEntityEvents.length > 0">
            <div 
              v-for="event in filteredEntityEvents" 
              :key="event.event_id"
              class="event-card pixel-card executable"
            >
              <div class="event-info">
                <div class="event-name">{{ getEventName(event) }}</div>
                <div class="event-details">
                  <span class="event-time pixel-text-small">
                    ⏱️ {{ t('timeCost') }}: {{ event.time_cost * 0.5 }} {{ t('hours') }}
                  </span>
                  <span v-if="event.requirements" class="event-requirements pixel-text-small">
                    📋 {{ t('requirements') }}: {{ event.requirements }}
                  </span>
                </div>
              </div>
              
              <button 
                class="pixel-button small event-execute-btn"
                @click="executeEvent(event.event_id)"
              >
                {{ t('execute') }}
              </button>
            </div>
          </div>
          
          <div v-else class="no-events pixel-text-small">
            {{ t('noEvents') }}
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
import { ref, computed, toRef } from 'vue'
import { useI18n } from '../utils/i18n'
import type { GameState, Location, Entity, GameEvent } from '../types'
import { BackendAdapter } from '../services/BackendAdapter'

// Props
interface Props {
  gameState?: GameState | null
  currentLocation?: Location | null
  availableEntities?: Entity[]
  currentLanguage: string
}

const props = defineProps<Props>()

// 多语言支持 - 使用响应式引用
const { t } = useI18n(toRef(props, 'currentLanguage'))

// Events
const emit = defineEmits<{
  'save-game': []
  'load-game': []
  'show-inventory': []
  'go-to-worldmap': []
  'go-to-title': []
  'execute-event': [eventId: number]
  'language-change': [language: string]
}>()

// 响应式数据
const selectedEntity = ref<Entity | null>(null)
const entityEvents = ref<GameEvent[]>([])

// 创建后端适配器实例（从全局获取）
const backend = (window as any).backendAdapter as BackendAdapter

// 计算属性
const currentLocationName = computed(() => {
  // 首先尝试使用从后端获取的位置名称
  if (props.currentLocation?.location_name) {
    // 如果后端返回的是中文名称但当前是英文模式，进行翻译
    const locationId = props.currentLocation?.location_id
    if (props.currentLanguage === 'en' && locationId) {
      const locationNames: Record<number, { zh: string, en: string }> = {
        1: { zh: '公司', en: 'Company' },
        2: { zh: '商店', en: 'Store' },
        3: { zh: '家', en: 'Home' },
        4: { zh: '公园', en: 'Park' },
        5: { zh: '餐馆', en: 'Restaurant' },
        6: { zh: '医院', en: 'Hospital' }
      }
      
      // 如果后端返回的是中文名称且存在对应的英文翻译，使用英文翻译
      if (locationNames[locationId] && props.currentLocation.location_name === locationNames[locationId].zh) {
        return locationNames[locationId].en
      }
    }
    return props.currentLocation.location_name
  }
  
  // 如果没有，使用多语言映射
  const locationId = props.currentLocation?.location_id
  const locationNames: Record<number, { zh: string, en: string }> = {
    1: { zh: '公司', en: 'Company' },
    2: { zh: '商店', en: 'Store' },
    3: { zh: '家', en: 'Home' },
    4: { zh: '公园', en: 'Park' },
    5: { zh: '餐馆', en: 'Restaurant' },
    6: { zh: '医院', en: 'Hospital' }
  }
  
  if (locationId && locationNames[locationId]) {
    const lang = props.currentLanguage === 'en' ? 'en' : 'zh'
    return locationNames[locationId][lang]
  }
  
  return props.currentLanguage === 'en' ? 'Unknown Location' : '未知位置'
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
  
  // 否则基于时间数据进行格式化
  if (typeof timeInfo.current_time !== 'undefined') {
    // current_time是半小时为单位，每2个单位为1小时
    const totalHalfHours = timeInfo.current_time % 48  // 一天48个半小时
    const hour = Math.floor(totalHalfHours / 2)
    const isHalfHour = totalHalfHours % 2 === 1
    const minute = isHalfHour ? 30 : 0
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }
  
  // 如果有hour字段，使用hour
  if (typeof timeInfo.hour !== 'undefined') {
    const hour = timeInfo.hour
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
    { key: 'money', icon: '💰', name: t('money').replace('💰 ', ''), value: resources[2] || 0, max: null },
    { key: 'health', icon: '❤️', name: t('health').replace('❤️ ', ''), value: resources[13] || 0, max: 100 },
    { key: 'fatigue', icon: '😴', name: t('fatigue').replace('😴 ', ''), value: resources[14] || 0, max: 100 },
    { key: 'hunger', icon: '🍽️', name: t('hunger').replace('🍽️ ', ''), value: resources[15] || 0, max: 100 },
    { key: 'focus', icon: '🎯', name: t('focus').replace('🎯 ', ''), value: resources[18] || 0, max: 100 },
    { key: 'mood', icon: '😊', name: t('mood').replace('😊 ', ''), value: resources[19] || 0, max: 100 }
  ]
})

// 职业属性
const careerStats = computed(() => {
  const resources = props.gameState?.resources || {}
  console.log('Career stats resources data:', resources)
  return [
    { key: 'skill', icon: '🔧', name: t('skill').replace('🔧 ', ''), value: resources[20] || 0, max: 100 },
    { key: 'level', icon: '👔', name: t('jobLevel').replace('👔 ', ''), value: resources[22] || 0, max: 10 },
    { key: 'project', icon: '📊', name: t('project').replace('📊 ', ''), value: resources[23] || 0, max: 100 },
    { key: 'boss', icon: '😠', name: t('boss').replace('😠 ', ''), value: resources[21] || 0, max: 100 }
  ]
})

// 哲学属性
const philosophyStats = computed(() => {
  const resources = props.gameState?.resources || {}
  console.log('Philosophy stats resources data:', resources)
  return [
    { key: 'rational', icon: '🧠', name: t('rational').replace('🧠 ', ''), value: resources[16] || 0, max: 100 },
    { key: 'emotional', icon: '💖', name: t('emotional').replace('💖 ', ''), value: resources[17] || 0, max: 100 },
    { key: 'social', icon: '🤝', name: t('social').replace('🤝 ', ''), value: resources[70] || 0, max: 100 },
    { key: 'reputation', icon: '🏆', name: t('reputation').replace('🏆 ', ''), value: resources[71] || 0, max: 100 },
    { key: 'insight', icon: '🤔', name: t('insight').replace('🤔 ', ''), value: resources[72] || 0, max: 100 }
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
    // 中文实体
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
    '柜子': '📦',
    // 英文实体
    'Boss': '👔',
    'Colleague1': '👨‍💻',
    'Colleague2': '👩‍💻',
    'Colleague3': '🧑‍💻',
    'Computer': '💻',
    'Work Computer': '💻',
    'Phone': '📱',
    'Hallway': '🚶',
    'Restroom': '🚽',
    'Self': '🧑‍💼',
    'Meeting Room': '🏢',
    'Cafeteria': '🍽️',
    'Salesperson': '👨‍💼',
    'Bookshelf': '📚',
    'Bed': '🛏️',
    'Refrigerator': '❄️',
    'Cabinet': '📦'
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

const getEventsCountText = (count: number) => {
  if (props.currentLanguage === 'en') {
    return count === 1 ? 'event available' : 'events available'
  } else {
    return '个可用事件'
  }
}

const getEventName = (event: GameEvent) => {
  if (props.currentLanguage === 'en') {
    return event.event_name_en || event.event_name_cn || 'Unknown Event'
  } else {
    return event.event_name_cn || event.event_name_en || '未知事件'
  }
}

const switchLanguage = (language: string) => {
  if (language !== props.currentLanguage) {
    emit('language-change', language)
  }
}

const getTranslatedEntityName = (entityName: string) => {
  const entityTranslations: Record<string, { zh: string, en: string }> = {
    // 中文到英文的映射
    '老板': { zh: '老板', en: 'Boss' },
    '同事1': { zh: '同事1', en: 'Colleague1' },
    '同事2': { zh: '同事2', en: 'Colleague2' },
    '同事3': { zh: '同事3', en: 'Colleague3' },
    '电脑': { zh: '电脑', en: 'Computer' },
    '工作电脑': { zh: '工作电脑', en: 'Work Computer' },
    '手机': { zh: '手机', en: 'Phone' },
    '走廊': { zh: '走廊', en: 'Hallway' },
    '厕所': { zh: '厕所', en: 'Restroom' },
    '自己': { zh: '自己', en: 'Self' },
    '会议室': { zh: '会议室', en: 'Meeting Room' },
    '食堂': { zh: '食堂', en: 'Cafeteria' },
    '售货员': { zh: '售货员', en: 'Salesperson' },
    '书架': { zh: '书架', en: 'Bookshelf' },
    '床': { zh: '床', en: 'Bed' },
    '冰箱': { zh: '冰箱', en: 'Refrigerator' },
    '柜子': { zh: '柜子', en: 'Cabinet' },
    // 英文到中文的映射
    'Boss': { zh: '老板', en: 'Boss' },
    'Colleague1': { zh: '同事1', en: 'Colleague1' },
    'Colleague2': { zh: '同事2', en: 'Colleague2' },
    'Colleague3': { zh: '同事3', en: 'Colleague3' },
    'Computer': { zh: '电脑', en: 'Computer' },
    'Work Computer': { zh: '工作电脑', en: 'Work Computer' },
    'Phone': { zh: '手机', en: 'Phone' },
    'Hallway': { zh: '走廊', en: 'Hallway' },
    'Restroom': { zh: '厕所', en: 'Restroom' },
    'Self': { zh: '自己', en: 'Self' },
    'Meeting Room': { zh: '会议室', en: 'Meeting Room' },
    'Cafeteria': { zh: '食堂', en: 'Cafeteria' },
    'Salesperson': { zh: '售货员', en: 'Salesperson' },
    'Bookshelf': { zh: '书架', en: 'Bookshelf' },
    'Bed': { zh: '床', en: 'Bed' },
    'Refrigerator': { zh: '冰箱', en: 'Refrigerator' },
    'Cabinet': { zh: '柜子', en: 'Cabinet' }
  }
  
  const translation = entityTranslations[entityName]
  if (translation) {
    const lang = props.currentLanguage === 'en' ? 'en' : 'zh'
    return translation[lang]
  }
  
  return entityName
}

const getEntityDescription = (entity: Entity) => {
  // 使用实体的description字段，根据当前语言选择合适的描述
  if (props.currentLanguage === 'en') {
    return entity.description_en || entity.description || 'No description available'
  } else {
    return entity.description || entity.description_en || '暂无描述'
  }
}

// 过滤出可以执行的事件
const filteredEntityEvents = computed(() => {
  return entityEvents.value.filter(event => event.can_execute)
})
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
  overflow-x: hidden;
  overflow-y: auto;
}

.interaction-panel {
  flex: 1;
  background: rgba(0, 17, 0, 0.9);
  padding: clamp(12px, 2vw, 20px);
  overflow-x: hidden;
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

/* 实体选择和事件选择区域的稳定容器 */
.entities-section,
.events-section {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden; /* 确保内容不会溢出 */
}

.entities-grid {
  display: grid;
  gap: clamp(8px, 1.5vw, 16px);
  grid-template-columns: repeat(auto-fit, minmax(clamp(180px, 25vw, 220px), 1fr));
  width: 100%;
  box-sizing: border-box;
}

.entity-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(12px, 2vw, 20px);
  text-align: center;
  min-height: clamp(100px, 15vw, 140px);
  justify-content: space-between;
  transition: transform 0.2s ease;
  box-sizing: border-box;
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
  transition: none;
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

.entity-description {
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

/* 内联语言选择器样式 */
.language-selector-inline {
  display: flex;
  gap: clamp(2px, 0.4vw, 4px);
}

.language-selector-inline .lang-btn {
  min-width: clamp(28px, 4vw, 36px);
  padding: clamp(4px, 0.8vw, 8px) clamp(6px, 1vw, 10px);
  font-size: var(--small-font-size);
}

.language-selector-inline .lang-btn.active {
  background: rgba(0, 120, 0, 0.8);
  border-color: var(--terminal-green);
  color: var(--terminal-green);
  box-shadow: 
    0 0 var(--glow-size) var(--terminal-green),
    inset 0 0 calc(var(--glow-size) / 2) rgba(0, 255, 0, 0.2);
}

/* 按钮文字样式 */
.btn-text {
  font-size: var(--tiny-font-size);
  margin-left: clamp(2px, 0.4vw, 4px);
}

/* 响应式按钮文字 */
@media (max-width: 768px) {
  .btn-text {
    display: none; /* 在小屏幕上隐藏文字，只显示图标 */
  }
  
  .language-selector-inline {
    gap: clamp(1px, 0.2vw, 2px);
  }
  
  .language-selector-inline .lang-btn {
    min-width: clamp(24px, 3.5vw, 32px);
    padding: clamp(3px, 0.6vw, 6px) clamp(4px, 0.8vw, 8px);
  }
}

@media (max-width: 480px) {
  .action-buttons {
    justify-content: center;
  }
  
  .language-selector-inline .lang-btn {
    min-width: clamp(20px, 3vw, 28px);
    padding: clamp(2px, 0.4vw, 4px) clamp(3px, 0.6vw, 6px);
    font-size: clamp(6px, 1.2vw, 8px);
  }
}
</style> 