<template>
  <div class="worldmap-view">
    <!-- 像素化背景 -->
    <div class="pixel-background"></div>
    
    <!-- 地图标题 -->
    <div class="map-header">
      <h1 class="map-title pixel-glow">🗺️ 游戏世界</h1>
      <div class="current-status">
        <span class="pixel-text">当前位置: {{ currentLocationName }}</span>
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
          <h3 class="location-name">{{ location.name }}</h3>
          <p class="location-description">{{ location.description }}</p>
        </div>
        
        <!-- 状态标记 -->
        <div class="location-status">
          <span v-if="location.id === currentLocationId" class="current-marker pixel-glow">
            当前位置
          </span>
          <button 
            v-else 
            class="travel-btn pixel-button"
            @click.stop="travelTo(location.id)"
          >
            前往
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
        🏃 进入场景
      </button>
      <button class="pixel-button large" @click="$emit('go-to-title')">
        🏠 返回主页
      </button>
    </div>

    <!-- 装饰性元素 -->
    <div class="map-decoration">
      <div class="floating-pixel" v-for="i in 12" :key="i"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Location, GameState } from '../types'

// Props
interface Props {
  currentLocation?: Location | null
  gameState?: GameState | null
}

const props = defineProps<Props>()

// Events  
const emit = defineEmits<{
  'travel-to': [locationId: number]
  'go-to-scene': []
  'go-to-title': []
}>()

// 硬编码的地图位置信息
const locations = [
  {
    id: 1,
    name: '公司',
    description: '工作和奋斗的地方',
    icon: '🏢'
  },
  {
    id: 2, 
    name: '商店',
    description: '购买各种物品',
    icon: '🏪'
  },
  {
    id: 3,
    name: '家',
    description: '温馨的休息场所', 
    icon: '🏠'
  },
  {
    id: 4,
    name: '公园',
    description: '锻炼身体和思考',
    icon: '🌳'
  },
  {
    id: 5,
    name: '餐馆', 
    description: '享用美食的地方',
    icon: '🍽️'
  },
  {
    id: 6,
    name: '医院',
    description: '治疗和恢复健康',
    icon: '🏥'
  }
]

// 计算属性
const currentLocationId = computed(() => {
  return props.currentLocation?.location_id || 3
})

const currentLocationName = computed(() => {
  const location = locations.find(loc => loc.id === currentLocationId.value)
  return location?.name || '未知位置'
})

const timeDisplay = computed(() => {
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

// 方法
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
  background: 
    radial-gradient(circle at 20% 30%, #001a1a 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, #001100 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, #000022 0%, transparent 50%),
    #000;
  position: relative;
  overflow: hidden;
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
}

.location-status {
  margin-top: auto;
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
}

.travel-btn {
  font-size: var(--button-font-size);
  padding: clamp(8px, 1.2vw, 16px) clamp(16px, 2vw, 24px);
  min-width: clamp(80px, 12vw, 120px);
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
  .locations-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(12px, 2vw, 20px);
    padding: clamp(16px, 2.5vw, 24px);
  }
  
  .location-card {
    min-height: clamp(120px, 18vw, 160px);
    padding: clamp(12px, 2vw, 20px);
  }
  
  .location-icon {
    font-size: clamp(24px, 4vw, 40px);
  }
  
  .bottom-controls {
    flex-direction: column;
    gap: clamp(8px, 1.5vw, 16px);
  }
  
  .bottom-controls .pixel-button {
    width: 100%;
  }
  
  .current-status {
    flex-direction: column;
    gap: clamp(8px, 1.5vw, 16px);
  }
}

@media (max-width: 480px) {
  .locations-grid {
    grid-template-columns: 1fr;
    gap: clamp(8px, 1.5vw, 16px);
    padding: clamp(12px, 2vw, 20px);
  }
  
  .location-card {
    min-height: clamp(100px, 15vw, 140px);
  }
}
</style> 