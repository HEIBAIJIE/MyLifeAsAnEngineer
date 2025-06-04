<template>
  <div v-if="show" class="status-modal-overlay">
    <div class="status-modal pixel-border" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title pixel-glow">👤 {{ t('characterStatus') }}</h3>
        <button class="pixel-button small close-btn" @click="$emit('close')">
          ✕
        </button>
      </div>
      
      <div class="modal-content">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useI18n } from '../utils/i18n'
import type { GameState } from '../types'

// Props
interface Props {
  show: boolean
  gameState?: GameState | null
  currentLanguage: string
}

const props = defineProps<Props>()

// Events
const emit = defineEmits<{
  'close': []
}>()

// 多语言支持 - 使用响应式引用
const { t } = useI18n(toRef(props, 'currentLanguage'))

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
</script>

<style scoped>
/* 状态弹窗样式 */
.status-modal-overlay {
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

.status-modal {
  background: rgba(0, 20, 0, 0.95);
  padding: clamp(20px, 3vw, 30px);
  max-width: clamp(350px, 50vw, 600px);
  max-height: 80vh;
  width: 90%;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(16px, 2.5vw, 24px);
  padding-bottom: clamp(8px, 1.2vw, 12px);
  border-bottom: 1px solid #004400;
}

.modal-title {
  color: var(--neon-yellow);
  font-size: var(--subtitle-font-size);
  text-shadow: 
    2px 2px 0px var(--background-black),
    0 0 var(--glow-size) currentColor;
}

.close-btn {
  min-width: clamp(24px, 3vw, 32px);
  padding: clamp(4px, 0.8vw, 8px);
  font-size: var(--ui-font-size);
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 2vw, 24px);
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

/* 响应式设计 */
@media (max-width: 768px) {
  .status-modal {
    max-width: 95%;
    max-height: 85vh;
    padding: clamp(15px, 2.5vw, 25px);
  }
}

@media (max-width: 480px) {
  .status-modal {
    max-width: 98%;
    max-height: 90vh;
    padding: clamp(12px, 2vw, 20px);
  }
  
  .modal-content {
    gap: clamp(12px, 1.5vw, 20px);
  }
}
</style> 