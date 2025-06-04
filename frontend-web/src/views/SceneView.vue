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
        <button class="pixel-button small" @click="showResourcesModal = true" :title="t('characterStatus')">
          📊 <span class="btn-text">{{ t('status') }}</span>
        </button>
        <button class="pixel-button small" @click="$emit('go-to-worldmap')" :title="t('worldMap')">
          🗺️ <span class="btn-text">{{ t('worldMap') }}</span>
        </button>
        <button class="pixel-button small" @click="goToTitle" :title="t('home')">
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
      <!-- 交互区域 - 现在占满整个宽度，去掉背景框 -->
      <div class="interaction-panel full-width transparent">
        <!-- 实体选择模式 -->
        <div v-if="!selectedEntity" class="entities-section">
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
              <div class="no-interaction" v-if="!entity.can_interact">
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
    
    <!-- 状态弹窗组件 -->
    <StatusModal 
      :show="showResourcesModal"
      :game-state="gameState"
      :current-language="currentLanguage"
      @close="showResourcesModal = false"
    />
    
    <!-- 退出确认对话框 -->
    <div v-if="showExitConfirm" class="exit-confirm-overlay">
      <div class="exit-confirm-dialog pixel-border">
        <div class="confirm-header">
          <h3 class="confirm-title pixel-glow">{{ t('confirmExit') }}</h3>
        </div>
        <div class="confirm-content">
          <p class="confirm-message">{{ t('exitMessage') }}</p>
          <p class="save-tip">{{ t('autoSaveTip') }}</p>
        </div>
        <div class="confirm-actions">
          <button class="pixel-button" @click="handleExitCancel">
            {{ t('cancel') }}
          </button>
          <button class="pixel-button primary" @click="handleExitConfirm">
            {{ t('confirmAndSave') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef, watch, onMounted } from 'vue'
import { useI18n } from '../utils/i18n'
import type { GameState, Location, Entity, GameEvent } from '../types'
import { BackendAdapter } from '../services/BackendAdapter'
import { playButtonClickSound } from '../services/AudioService'
import StatusModal from '../components/StatusModal.vue'

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
// 添加资源弹窗控制
const showResourcesModal = ref(false)

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
    return props.currentLanguage === 'en' ? 'Time Unknown' : '时间未知'
  }
  
  const timeInfo = props.gameState.time_info
  
  // 如果后端已经提供了格式化的时间显示，直接使用
  if (timeInfo.time_display && timeInfo.time_display.includes('月') || timeInfo.time_display?.includes('AM') || timeInfo.time_display?.includes('PM')) {
    return timeInfo.time_display
  }
  
  // 计算详细的日期时间信息
  let currentTime = 0
  if (typeof timeInfo.current_time !== 'undefined') {
    currentTime = timeInfo.current_time
  } else if (typeof timeInfo.hour !== 'undefined') {
    currentTime = timeInfo.hour * 2 // 转换为半小时单位
  }
  
  // 计算天数（从某个起始点开始）
  const totalHalfHours = currentTime
  const dayIndex = Math.floor(totalHalfHours / 48) // 一天48个半小时
  const todayHalfHours = totalHalfHours % 48
  const hour = Math.floor(todayHalfHours / 2)
  const isHalfHour = todayHalfHours % 2 === 1
  const minute = isHalfHour ? 30 : 0
  
  if (props.currentLanguage === 'en') {
    // 英文格式：September 15 Monday, 9:30 AM
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December']
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    // 假设从9月开始，dayIndex 0 对应周一
    const month = months[8 + Math.floor(dayIndex / 30) % 12] // 从9月开始
    const day = (dayIndex % 30) + 1 // 1-30日
    const weekday = weekdays[(dayIndex + 1) % 7] // 假设第0天是周一
    
    // 12小时制
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const ampm = hour < 12 ? 'AM' : 'PM'
    const timeStr = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`
    
    return `${month} ${day} ${weekday}, ${timeStr}`
  } else {
    // 中文格式：9月15日 星期一，上午9:30
    const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    
    const month = months[(8 + Math.floor(dayIndex / 30)) % 12] // 从9月开始
    const day = (dayIndex % 30) + 1
    const weekday = weekdays[(dayIndex + 1) % 7]
    
    const ampm = hour < 12 ? '上午' : '下午'
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const timeStr = `${ampm}${hour12}:${minute.toString().padStart(2, '0')}`
    
    return `${month}月${day}日 ${weekday}，${timeStr}`
  }
})

const sceneBackgroundStyle = computed(() => {
  const locationId = props.currentLocation?.location_id || 3
  const backgroundImages: Record<number, string> = {
    1: '/static/company.jpg',    // 公司
    2: '/static/shop.jpg',       // 商店
    3: '/static/home.jpg',       // 家
    4: '/static/park.jpg',       // 公园
    5: '/static/restaurant.jpg', // 餐馆
    6: '/static/hospital.jpg'    // 医院
  }
  
  const imageUrl = backgroundImages[locationId] || backgroundImages[3]
  
  return {
    backgroundImage: `
      radial-gradient(circle at 25% 25%, rgba(0, 255, 0, 0.1) 0%, transparent 30%),
      radial-gradient(circle at 75% 75%, rgba(0, 255, 0, 0.15) 0%, transparent 30%),
      radial-gradient(circle at 50% 50%, rgba(10, 10, 10, 0.8) 0%, transparent 40%),
      linear-gradient(rgba(10, 10, 10, 0.6), rgba(10, 10, 10, 0.7)),
      url('${imageUrl}')
    `,
    backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%, cover',
    backgroundPosition: 'center, center, center, center, center',
    backgroundRepeat: 'no-repeat, no-repeat, no-repeat, no-repeat, no-repeat',
    backgroundAttachment: 'fixed, fixed, fixed, fixed, fixed'
  }
})

// 方法
const getEntityIcon = (entityName: string) => {
  const icons: Record<string, string> = {
    // 中文实体
    'David': '👨‍💻',
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
    'Robert': '👔',
    'Sarah': '👩‍💻',
    'Mike': '🧑‍💻',
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
  
  // 播放点击音效
  playButtonClickSound(0.3)
  
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
    'David': { zh: 'David', en: 'David' },
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
    'Robert': { zh: 'Robert', en: 'Robert' },
    'Sarah': { zh: 'Sarah', en: 'Sarah' },
    'Mike': { zh: 'Mike', en: 'Mike' },
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

// 添加确认对话框状态
const showExitConfirm = ref(false)

// 添加退出确认方法
const confirmExit = () => {
  showExitConfirm.value = true
}

const handleExitConfirm = async () => {
  try {
    // 通过后端正确保存游戏状态
    if (backend && backend.initialized) {
      const saveResult = await backend.saveGame()
      if (saveResult.success && saveResult.saveData) {
        await navigator.clipboard.writeText(saveResult.saveData)
        console.log('Game state saved to clipboard (proper format)')
      } else {
        console.warn('Failed to save game state:', saveResult.error)
      }
    } else {
      console.warn('Backend not initialized, cannot save game state')
    }
    
    // 发送回到主界面事件
    emit('go-to-title')
  } catch (error) {
    console.error('Failed to save to clipboard:', error)
    // 即使保存失败，也允许退出
    emit('go-to-title')
  }
  showExitConfirm.value = false
}

const handleExitCancel = () => {
  showExitConfirm.value = false
}

// 修改回到主界面的方法
const goToTitle = () => {
  confirmExit()
}

// 添加背景图片更新方法
const updateBackgroundImage = () => {
  const locationId = props.currentLocation?.location_id || 3
  const backgroundImages: Record<number, string> = {
    1: '/static/company.jpg',    // 公司
    2: '/static/shop.jpg',       // 商店
    3: '/static/home.jpg',       // 家
    4: '/static/park.jpg',       // 公园
    5: '/static/restaurant.jpg', // 餐馆
    6: '/static/hospital.jpg'    // 医院
  }
  
  const imageUrl = backgroundImages[locationId] || backgroundImages[3]
  
  // 动态设置CSS变量
  const sceneElement = document.querySelector('.scene-view') as HTMLElement
  if (sceneElement) {
    sceneElement.style.setProperty('--scene-background-image', `url('${imageUrl}')`)
  }
}

// 监听位置变化
watch(() => props.currentLocation?.location_id, () => {
  updateBackgroundImage()
}, { immediate: true })

// 组件挂载时设置背景
onMounted(() => {
  updateBackgroundImage()
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

/* 添加背景图片的模糊效果 */
.scene-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: var(--scene-background-image, url('/static/home.jpg'));
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(2px) brightness(0.3) contrast(1.1);
  z-index: 0;
  opacity: 0.7;
}

/* 添加额外的背景纹理层 */
.scene-view::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 30% 20%, rgba(0, 255, 0, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 70% 80%, rgba(0, 255, 255, 0.03) 0%, transparent 40%),
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 50px,
      rgba(0, 255, 0, 0.01) 50px,
      rgba(0, 255, 0, 0.01) 52px
    );
  z-index: 1;
  pointer-events: none;
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
  min-height: 0; /* 重要：确保flex子元素可以收缩 */
}

.interaction-panel {
  background: rgba(0, 17, 0, 0.9);
  padding: clamp(12px, 2vw, 20px);
  overflow-x: hidden;
  overflow-y: auto;
  /* 确保在移动端有正确的滚动行为 */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 255, 0, 0.3) transparent;
}

/* 添加自定义滚动条样式 */
.interaction-panel::-webkit-scrollbar {
  width: 6px;
}

.interaction-panel::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.interaction-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 0, 0.3);
  border-radius: 3px;
}

.interaction-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 0, 0.5);
}

.interaction-panel.transparent {
  background: rgba(0, 17, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.1);
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.05);
  backdrop-filter: blur(1px);
}

.interaction-panel.full-width {
  width: 100%;
  flex: 1;
}

.panel-title {
  color: #00ff00;
  font-size: var(--ui-font-size);
  margin-bottom: clamp(12px, 1.5vw, 20px);
  text-align: center;
  border-bottom: 1px solid #004400;
  padding-bottom: clamp(6px, 1vw, 10px);
  background: rgba(0, 0, 0, 0.8);
  padding: clamp(8px, 1.2vw, 16px);
  border-radius: 4px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
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
  background: rgba(0, 20, 0, 0.85);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(0, 255, 0, 0.3);
}

.entity-card.interactive:hover {
  transform: translateY(-2px);
  background: rgba(0, 40, 0, 0.9);
  border-color: rgba(0, 255, 0, 0.6);
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
  background: rgba(0, 0, 0, 0.7);
  padding: clamp(8px, 1.2vw, 16px);
  border-radius: 4px;
  backdrop-filter: blur(4px);
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
  background: rgba(0, 20, 0, 0.85);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(0, 255, 0, 0.3);
}

.event-card.executable:hover {
  background: rgba(0, 68, 0, 0.9);
  border-color: rgba(0, 255, 0, 0.6);
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
  .entities-grid {
    grid-template-columns: repeat(auto-fit, minmax(clamp(160px, 22vw, 200px), 1fr));
  }
}

@media (max-width: 768px) {
  .scene-view {
    height: 100vh;
    height: 100dvh; /* 动态视口高度，更适合移动端 */
  }

  .scene-header {
    flex-shrink: 0; /* 确保头部不被压缩 */
  }

  .scene-content {
    padding: clamp(8px, 1.5vw, 16px);
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  
  .interaction-panel {
    padding: clamp(8px, 1.5vw, 16px);
    /* 确保在移动端可以滚动 */
    max-height: 100%;
    overflow-y: auto;
  }
  
  .entities-grid {
    grid-template-columns: repeat(auto-fit, minmax(clamp(140px, 20vw, 180px), 1fr));
    /* 添加底部边距以确保最后的元素可见 */
    padding-bottom: clamp(20px, 4vw, 40px);
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
  .scene-view {
    height: 100vh;
    height: 100dvh; /* 动态视口高度 */
  }

  .scene-content {
    padding: clamp(6px, 1vw, 12px);
    flex: 1;
    min-height: 0;
  }
  
  .interaction-panel {
    padding: clamp(6px, 1vw, 12px);
    /* 移动端专用滚动优化 */
    max-height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  .entities-grid {
    grid-template-columns: 1fr;
    /* 增加底部边距确保内容可见 */
    padding-bottom: clamp(30px, 6vw, 60px);
    gap: clamp(12px, 2.5vw, 20px);
  }
  
  .entity-card {
    min-height: clamp(80px, 12vw, 120px);
    padding: clamp(6px, 1vw, 12px);
  }
  
  .entity-icon {
    font-size: clamp(20px, 3vw, 32px);
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .language-selector-inline .lang-btn {
    min-width: clamp(20px, 3vw, 28px);
    padding: clamp(2px, 0.4vw, 4px) clamp(3px, 0.6vw, 6px);
    font-size: clamp(6px, 1.2vw, 8px);
  }

  /* 事件部分也需要底部边距 */
  .events-grid {
    padding-bottom: clamp(30px, 6vw, 60px);
  }

  .events-section {
    padding-bottom: clamp(20px, 4vw, 40px);
  }
}

/* 添加安全区域支持 */
@supports (padding: max(0px)) {
  .scene-header {
    padding-left: max(8px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
    padding-top: max(8px, env(safe-area-inset-top));
  }

  .scene-content {
    padding-left: max(clamp(12px, 2vw, 20px), env(safe-area-inset-left));
    padding-right: max(clamp(12px, 2vw, 20px), env(safe-area-inset-right));
    padding-bottom: max(clamp(12px, 2vw, 20px), env(safe-area-inset-bottom));
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

/* 退出确认对话框样式 */
.exit-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.exit-confirm-dialog {
  background: rgba(0, 20, 0, 0.95);
  padding: clamp(20px, 3vw, 40px);
  max-width: clamp(300px, 40vw, 450px);
  width: 90%;
  text-align: center;
}

.confirm-header {
  margin-bottom: clamp(16px, 2.5vw, 24px);
}

.confirm-title {
  color: var(--neon-yellow);
  font-size: var(--subtitle-font-size);
  text-shadow: 
    2px 2px 0px var(--background-black),
    0 0 var(--glow-size) currentColor;
}

.confirm-content {
  margin-bottom: clamp(20px, 3vw, 30px);
}

.confirm-message {
  color: var(--matrix-light-green);
  font-size: var(--ui-font-size);
  margin-bottom: clamp(8px, 1.2vw, 16px);
  line-height: 1.5;
}

.save-tip {
  color: var(--neon-cyan);
  font-size: var(--small-font-size);
  opacity: 0.8;
  line-height: 1.4;
}

.confirm-actions {
  display: flex;
  gap: clamp(12px, 2vw, 20px);
  justify-content: center;
}

.confirm-actions .pixel-button {
  padding: clamp(10px, 1.5vw, 16px) clamp(16px, 2.5vw, 24px);
  min-width: clamp(80px, 12vw, 120px);
}
</style> 