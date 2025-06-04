<template>
  <div class="worldmap-view">
    <!-- 像素化背景 -->
    <div class="pixel-background"></div>
    
    <!-- 地图标题 -->
    <div class="map-header">
      <h1 class="map-title pixel-glow">🗺️ {{ t('worldMapTitle') }}</h1>
      <div class="current-status">
        <span class="pixel-text">{{ t('currentLocation') }}: {{ currentLocationName }}</span>
        <span class="pixel-text">{{ timeDisplay }}</span>
      </div>
    </div>

    <!-- 地图网格 -->
    <div class="locations-grid">
      <div 
        v-for="location in locations" 
        :key="location.id"
        class="location-card pixel-border"
        :class="{ 
          'current-location': location.id === currentLocationId,
          'available': location.id !== currentLocationId 
        }"
        @click="travelTo(location.id)"
      >
        <!-- 位置图标 -->
        <div class="location-icon">
          {{ location.icon }}
        </div>
        
        <!-- 位置信息 -->
        <div class="location-info">
          <h3 class="location-name">{{ getLocationName(location) }}</h3>
          <p class="location-description">{{ getLocationDescription(location) }}</p>
        </div>
        
        <!-- 状态标记 -->
        <div class="location-status">
          <span v-if="location.id === currentLocationId" class="current-marker pixel-glow">
            {{ t('currentLocationMarker') }}
          </span>
          <button 
            v-else 
            class="travel-btn pixel-button"
            @click.stop="travelTo(location.id)"
          >
            {{ t('travelTo') }}
          </button>
        </div>
        
        <!-- 装饰性像素效果 -->
        <div class="card-decoration">
          <div class="pixel-dot" v-for="i in 4" :key="i"></div>
        </div>
      </div>
    </div>

    <!-- 底部控制栏 -->
    <div class="bottom-controls">
      <button class="pixel-button large" @click="goToCurrentScene">
        🏃 {{ t('enterScene') }}
      </button>
      <button class="pixel-button large" @click="goToTitle">
        🏠 {{ t('returnToHome') }}
      </button>
    </div>

    <!-- 装饰性元素 -->
    <div class="map-decoration">
      <div class="floating-pixel" v-for="i in 12" :key="i"></div>
    </div>

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
import { computed, ref } from 'vue'
import { useI18n } from '../utils/i18n'
import type { Location, GameState } from '../types'

// Props
interface Props {
  currentLocation?: Location | null
  gameState?: GameState | null
  currentLanguage: string
}

const props = defineProps<Props>()

// 多语言支持
const { t } = useI18n(props.currentLanguage)

// Events  
const emit = defineEmits<{
  'travel-to': [locationId: number]
  'go-to-scene': []
  'go-to-title': []
}>()

// 硬编码的地图位置信息 - 现在支持双语
const locations = [
  {
    id: 1,
    nameKey: 'company' as keyof typeof import('../utils/i18n').zhTexts,
    descKey: 'companyDesc' as keyof typeof import('../utils/i18n').zhTexts,
    icon: '🏢'
  },
  {
    id: 2, 
    nameKey: 'store' as keyof typeof import('../utils/i18n').zhTexts,
    descKey: 'storeDesc' as keyof typeof import('../utils/i18n').zhTexts,
    icon: '🏪'
  },
  {
    id: 3,
    nameKey: 'homeLocation' as keyof typeof import('../utils/i18n').zhTexts,
    descKey: 'homeDesc' as keyof typeof import('../utils/i18n').zhTexts,
    icon: '🏠'
  },
  {
    id: 4,
    nameKey: 'park' as keyof typeof import('../utils/i18n').zhTexts,
    descKey: 'parkDesc' as keyof typeof import('../utils/i18n').zhTexts,
    icon: '🌳'
  },
  {
    id: 5,
    nameKey: 'restaurant' as keyof typeof import('../utils/i18n').zhTexts,
    descKey: 'restaurantDesc' as keyof typeof import('../utils/i18n').zhTexts,
    icon: '🍽️'
  },
  {
    id: 6,
    nameKey: 'hospital' as keyof typeof import('../utils/i18n').zhTexts,
    descKey: 'hospitalDesc' as keyof typeof import('../utils/i18n').zhTexts,
    icon: '🏥'
  }
]

// 计算属性
const currentLocationId = computed(() => {
  return props.currentLocation?.location_id || 3
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
    const backend = (window as any).backendAdapter
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

const currentLocationName = computed(() => {
  const location = locations.find(loc => loc.id === currentLocationId.value)
  return location ? t(location.nameKey) : t('currentLocation')
})

const timeDisplay = computed(() => {
  if (!props.gameState?.time_info) {
    return t('loading')
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
  
  return t('loading')
})

// 方法
const getLocationName = (location: any) => {
  return t(location.nameKey)
}

const getLocationDescription = (location: any) => {
  return t(location.descKey)
}

const travelTo = (locationId: number) => {
  if (locationId !== currentLocationId.value) {
    emit('travel-to', locationId)
  }
}

const goToCurrentScene = () => {
  emit('go-to-scene')
}
</script>

<style scoped>
.worldmap-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: 
    radial-gradient(circle at 25% 25%, rgba(0, 255, 0, 0.1) 0%, transparent 30%),
    radial-gradient(circle at 75% 75%, rgba(0, 255, 0, 0.15) 0%, transparent 30%),
    radial-gradient(circle at 50% 50%, rgba(10, 10, 10, 0.8) 0%, transparent 40%),
    linear-gradient(rgba(10, 10, 10, 0.6), rgba(10, 10, 10, 0.7)),
    url('/static/map.jpg');
  background-size: 
    100% 100%,
    100% 100%,
    100% 100%,
    100% 100%,
    cover;
  background-position: 
    center,
    center,
    center,
    center,
    center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

/* 添加背景图片的模糊效果 */
.worldmap-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('/static/map.jpg') center/cover no-repeat;
  filter: blur(3px) brightness(0.4) contrast(1.2);
  z-index: 0;
  opacity: 0.6;
}

/* 添加额外的背景纹理层 */
.worldmap-view::after {
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

.pixel-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 6px,
      rgba(0, 255, 0, 0.02) 6px,
      rgba(0, 255, 0, 0.02) 12px
    ),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 6px,
      rgba(0, 255, 0, 0.02) 6px,
      rgba(0, 255, 0, 0.02) 12px
    );
  z-index: 1;
}

.map-header {
  z-index: 2;
  padding: clamp(16px, 2.5vw, 32px) clamp(20px, 3vw, 48px);
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  flex-shrink: 0; /* 确保头部不被压缩 */
}

.map-title {
  font-size: var(--title-font-size);
  margin-bottom: clamp(12px, 1.5vw, 24px);
  color: #00ffff;
  text-shadow: 2px 2px 0px #000, 0 0 10px #00ffff;
}

.current-status {
  display: flex;
  justify-content: center;
  gap: clamp(20px, 3vw, 48px);
  opacity: 0.8;
}

.current-status .pixel-text {
  font-size: var(--ui-font-size);
  color: #cccccc;
  text-shadow: 1px 1px 0px #000;
}

.locations-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(16px, 2.5vw, 32px);
  padding: clamp(20px, 3vw, 48px);
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  /* 确保在移动端可以滚动 */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 0; /* 重要：确保flex子元素可以收缩 */
}

/* 添加自定义滚动条样式 */
.locations-grid::-webkit-scrollbar {
  width: 6px;
}

.locations-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.locations-grid::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 0, 0.3);
  border-radius: 3px;
}

.locations-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 0, 0.5);
}

.location-card {
  background: rgba(0, 20, 0, 0.9);
  padding: clamp(16px, 2.5vw, 32px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: clamp(140px, 20vw, 200px);
  /* 确保内容合理分布 */
  justify-content: space-between;
  box-sizing: border-box;
}

.location-card.available:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 0 #004400, 0 0 20px #00ff00;
  background: rgba(0, 30, 0, 0.95);
}

.location-card.current-location {
  background: rgba(0, 40, 20, 0.95);
  box-shadow: 0 0 15px #00ff00;
}

.location-icon {
  font-size: clamp(32px, 5vw, 64px);
  margin-bottom: clamp(8px, 1.5vw, 16px);
  filter: drop-shadow(2px 2px 0px #000);
  flex-shrink: 0;
}

.location-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;
}

.location-name {
  font-size: var(--ui-font-size);
  margin-bottom: clamp(6px, 1vw, 12px);
  color: #00ffff;
  text-shadow: 1px 1px 0px #000;
}

.location-description {
  font-size: var(--small-font-size);
  color: #cccccc;
  margin-bottom: clamp(12px, 1.5vw, 20px);
  line-height: 1.4;
  text-shadow: 1px 1px 0px #000;
  flex: 1;
}

.location-status {
  /* 移除 margin-top: auto，使用flex布局来控制位置 */
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: clamp(8px, 1.2vw, 16px);
}

.current-marker {
  color: #ffff00;
  font-size: var(--ui-font-size);
  font-weight: bold;
  text-shadow: 1px 1px 0px #000;
  padding: clamp(6px, 1vw, 12px) clamp(12px, 1.5vw, 20px);
  background: rgba(255, 255, 0, 0.1);
  border: 2px solid #ffff00;
  border-radius: 0;
  animation: pixel-glow 1.5s infinite;
  display: inline-block;
  white-space: nowrap;
}

.travel-btn {
  font-size: var(--button-font-size);
  padding: clamp(8px, 1.2vw, 16px) clamp(16px, 2vw, 24px);
  min-width: clamp(80px, 12vw, 120px);
  white-space: nowrap;
}

.card-decoration {
  position: absolute;
  top: clamp(6px, 1vw, 12px);
  right: clamp(6px, 1vw, 12px);
  display: flex;
  gap: clamp(2px, 0.3vw, 4px);
}

.pixel-dot {
  width: clamp(2px, 0.5vw, 6px);
  height: clamp(2px, 0.5vw, 6px);
  background: #00ff00;
  opacity: 0.6;
  animation: pixel-blink 2s infinite;
}

.pixel-dot:nth-child(2) {
  animation-delay: 0.5s;
}

.pixel-dot:nth-child(3) {
  animation-delay: 1s;
}

.pixel-dot:nth-child(4) {
  animation-delay: 1.5s;
}

.bottom-controls {
  z-index: 2;
  padding: clamp(16px, 2.5vw, 32px);
  display: flex;
  justify-content: center;
  gap: clamp(16px, 2.5vw, 32px);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  flex-shrink: 0; /* 确保底部控制栏不被压缩 */
}

.bottom-controls .pixel-button {
  padding: clamp(12px, 1.8vw, 24px) clamp(20px, 3vw, 40px);
  font-size: var(--button-font-size);
  min-width: clamp(140px, 20vw, 200px);
}

.map-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-pixel {
  position: absolute;
  width: clamp(2px, 0.4vw, 6px);
  height: clamp(2px, 0.4vw, 6px);
  background: #00ff00;
  opacity: 0.3;
  animation: float-around 10s infinite linear;
}

.floating-pixel:nth-child(odd) {
  background: #00ffff;
}

.floating-pixel:nth-child(1) { top: 10%; left: 5%; animation-duration: 12s; }
.floating-pixel:nth-child(2) { top: 20%; left: 90%; animation-duration: 8s; }
.floating-pixel:nth-child(3) { top: 30%; left: 15%; animation-duration: 15s; }
.floating-pixel:nth-child(4) { top: 50%; left: 85%; animation-duration: 11s; }
.floating-pixel:nth-child(5) { top: 70%; left: 25%; animation-duration: 9s; }
.floating-pixel:nth-child(6) { top: 80%; left: 75%; animation-duration: 13s; }
.floating-pixel:nth-child(7) { top: 15%; left: 50%; animation-duration: 10s; }
.floating-pixel:nth-child(8) { top: 45%; left: 10%; animation-duration: 14s; }
.floating-pixel:nth-child(9) { top: 65%; left: 95%; animation-duration: 7s; }
.floating-pixel:nth-child(10) { top: 85%; left: 40%; animation-duration: 16s; }
.floating-pixel:nth-child(11) { top: 25%; left: 70%; animation-duration: 12s; }
.floating-pixel:nth-child(12) { top: 55%; left: 60%; animation-duration: 9s; }

@keyframes float-around {
  0% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(90deg); }
  50% { transform: translateY(0px) rotate(180deg); }
  75% { transform: translateY(10px) rotate(270deg); }
  100% { transform: translateY(0px) rotate(360deg); }
}

@keyframes pixel-blink {
  0%, 50% { opacity: 0.6; }
  25%, 75% { opacity: 1; }
}

/* 大屏幕优化 */
@media (min-width: 1920px) {
  .locations-grid {
    max-width: 1400px;
  }
  
  .location-card {
    min-height: clamp(160px, 22vw, 240px);
  }
  
  .location-icon {
    font-size: clamp(48px, 6vw, 80px);
  }
}

@media (min-width: 2560px) {
  .locations-grid {
    max-width: 1600px;
  }
  
  .location-card {
    min-height: clamp(180px, 25vw, 280px);
  }
  
  .location-icon {
    font-size: clamp(56px, 7vw, 96px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .worldmap-view {
    height: 100vh;
    height: 100dvh; /* 动态视口高度，更适合移动端 */
  }

  .map-header {
    padding: clamp(12px, 2vw, 24px) clamp(16px, 2.5vw, 32px);
  }

  .locations-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(12px, 2vw, 20px);
    padding: clamp(16px, 2.5vw, 24px);
    /* 确保有足够的底部空间 */
    padding-bottom: clamp(24px, 4vw, 40px);
    /* 优化移动端滚动 */
    overflow-y: auto;
    max-height: 100%;
  }
  
  .location-card {
    min-height: clamp(140px, 22vw, 180px);
    padding: clamp(12px, 2vw, 20px);
    /* 确保内容正确对齐 */
    justify-content: space-between;
  }
  
  .location-icon {
    font-size: clamp(24px, 4vw, 40px);
    margin-bottom: clamp(6px, 1vw, 12px);
  }

  .location-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .location-description {
    margin-bottom: clamp(8px, 1.2vw, 16px);
  }

  .location-status {
    margin-top: clamp(6px, 1vw, 12px);
  }
  
  .bottom-controls {
    flex-direction: column;
    gap: clamp(8px, 1.5vw, 16px);
    padding: clamp(12px, 2vw, 24px);
  }
  
  .bottom-controls .pixel-button {
    width: 100%;
    min-width: auto;
  }
  
  .current-status {
    flex-direction: column;
    gap: clamp(8px, 1.5vw, 16px);
  }
}

@media (max-width: 480px) {
  .worldmap-view {
    height: 100vh;
    height: 100dvh; /* 动态视口高度 */
  }

  .map-header {
    padding: clamp(8px, 1.5vw, 16px) clamp(12px, 2vw, 20px);
  }

  .map-title {
    font-size: clamp(24px, 5vw, 32px);
    margin-bottom: clamp(8px, 1.5vw, 16px);
  }

  .locations-grid {
    grid-template-columns: 1fr;
    gap: clamp(8px, 1.5vw, 16px);
    padding: clamp(12px, 2vw, 20px);
    /* 增加底部边距确保所有内容可见 */
    padding-bottom: clamp(40px, 8vw, 80px);
    /* 移动端滚动优化 */
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  .location-card {
    min-height: clamp(120px, 18vw, 160px);
    padding: clamp(10px, 1.5vw, 16px);
    /* 重要：确保卡片布局在小屏幕上正确显示 */
    justify-content: space-between;
    gap: clamp(4px, 0.8vw, 8px);
  }

  .location-icon {
    font-size: clamp(20px, 3.5vw, 32px);
    margin-bottom: clamp(4px, 0.8vw, 8px);
  }

  .location-info {
    flex: 1;
    min-height: 0;
  }

  .location-name {
    font-size: clamp(14px, 2.8vw, 18px);
    margin-bottom: clamp(4px, 0.8vw, 8px);
  }

  .location-description {
    font-size: clamp(11px, 2.2vw, 14px);
    margin-bottom: clamp(6px, 1.2vw, 10px);
    line-height: 1.3;
  }

  .location-status {
    margin-top: clamp(4px, 0.8vw, 8px);
    flex-shrink: 0;
  }

  .current-marker {
    font-size: clamp(12px, 2.4vw, 16px);
    padding: clamp(4px, 0.8vw, 8px) clamp(8px, 1.5vw, 12px);
  }

  .travel-btn {
    font-size: clamp(12px, 2.4vw, 16px);
    padding: clamp(6px, 1.2vw, 10px) clamp(12px, 2.4vw, 16px);
    min-width: clamp(60px, 12vw, 100px);
  }

  .bottom-controls {
    padding: clamp(8px, 1.5vw, 16px);
    gap: clamp(6px, 1.2vw, 12px);
  }

  .bottom-controls .pixel-button {
    padding: clamp(8px, 1.5vw, 12px) clamp(12px, 2.4vw, 20px);
    font-size: clamp(12px, 2.4vw, 16px);
    min-width: auto;
  }

  .current-status .pixel-text {
    font-size: clamp(12px, 2.4vw, 16px);
  }
}

/* 添加安全区域支持 */
@supports (padding: max(0px)) {
  .map-header {
    padding-left: max(clamp(20px, 3vw, 48px), env(safe-area-inset-left));
    padding-right: max(clamp(20px, 3vw, 48px), env(safe-area-inset-right));
    padding-top: max(clamp(16px, 2.5vw, 32px), env(safe-area-inset-top));
  }

  .locations-grid {
    padding-left: max(clamp(20px, 3vw, 48px), env(safe-area-inset-left));
    padding-right: max(clamp(20px, 3vw, 48px), env(safe-area-inset-right));
  }

  .bottom-controls {
    padding-left: max(clamp(16px, 2.5vw, 32px), env(safe-area-inset-left));
    padding-right: max(clamp(16px, 2.5vw, 32px), env(safe-area-inset-right));
    padding-bottom: max(clamp(16px, 2.5vw, 32px), env(safe-area-inset-bottom));
  }
}

/* 优化超小屏幕（iPhone SE等） */
@media (max-width: 375px) {
  .locations-grid {
    gap: clamp(6px, 1.2vw, 12px);
    padding: clamp(8px, 1.5vw, 16px);
    padding-bottom: clamp(50px, 10vw, 100px);
  }

  .location-card {
    min-height: clamp(90px, 14vw, 120px);
    padding: clamp(8px, 1.2vw, 12px);
  }

  .location-icon {
    font-size: clamp(18px, 3vw, 28px);
  }

  .location-name {
    font-size: clamp(12px, 2.5vw, 16px);
  }

  .location-description {
    font-size: clamp(10px, 2vw, 12px);
  }
}

/* 退出确认对话框样式 */
.exit-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.exit-confirm-dialog {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  max-width: 80%;
  width: 300px;
  text-align: center;
}

.confirm-header {
  margin-bottom: 10px;
}

.confirm-title {
  font-size: 1.5rem;
}

.confirm-content {
  margin-bottom: 20px;
}

.confirm-message {
  margin-bottom: 10px;
}

.save-tip {
  font-size: var(--small-font-size);
  color: #cccccc;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.pixel-button {
  padding: 12px 20px;
  font-size: var(--button-font-size);
  min-width: 140px;
  background: #00ff00;
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pixel-button:hover {
  background: #00cc00;
}

.pixel-button.primary {
  background: #ffff00;
}
</style> 