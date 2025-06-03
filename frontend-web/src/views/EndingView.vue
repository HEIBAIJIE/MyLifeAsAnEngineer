<template>
  <div class="ending-view">
    <!-- 背景动画 -->
    <div class="ending-background">
      <div class="background-particles">
        <div 
          v-for="i in 30" 
          :key="i" 
          class="particle"
          :style="getParticleStyle(i)"
        ></div>
      </div>
    </div>
    
    <!-- 结局内容 -->
    <div class="ending-container pixel-border">
      <!-- 结局标题 -->
      <div class="ending-header">
        <h1 class="ending-title pixel-glow">
          {{ endingTitle }}
        </h1>
        <div class="ending-type">
          {{ getEndingTypeText() }}
        </div>
      </div>
      
      <!-- 结局图像区域 -->
      <div class="ending-image-container">
        <div class="ending-image">
          <div class="pixel-art-frame">
            <!-- 像素艺术图像 -->
            <div class="ending-icon" :class="getEndingIconClass()">
              {{ getEndingIcon() }}
            </div>
            
            <!-- 装饰性元素 -->
            <div class="image-decorations">
              <div 
                v-for="i in 8" 
                :key="i" 
                class="decoration-spark"
                :style="getDecorationStyle(i)"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 结局描述 -->
      <div class="ending-description">
        <div class="description-text">
          <p class="ending-content">{{ endingDescription }}</p>
        </div>
        
        <!-- 统计信息 -->
        <div class="ending-stats" v-if="showStats">
          <h4 class="stats-title">📊 最终统计</h4>
          <div class="stats-grid">
            <div class="stat-row">
              <span class="stat-label">🕐 游戏时长:</span>
              <span class="stat-value">{{ gameTimeSpent }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">🎯 主要成就:</span>
              <span class="stat-value">{{ mainAchievement }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">📈 最高属性:</span>
              <span class="stat-value">{{ highestStat }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="ending-actions">
        <button 
          class="pixel-button large"
          @click="$emit('restart-game')"
        >
          🔄 重新开始
        </button>
        
        <button 
          class="pixel-button large"
          @click="$emit('go-to-title')"
        >
          🏠 返回主菜单
        </button>
      </div>
      
      <!-- 感谢文字 -->
      <div class="credits">
        <p class="credit-text pixel-text-small">
          感谢您体验《工程师日记》
        </p>
        <p class="credit-text pixel-text-small">
          每一次选择都塑造了独特的人生故事
        </p>
      </div>
    </div>
    
    <!-- 装饰性效果 -->
    <div class="ending-effects">
      <div class="pulse-rings">
        <div class="pulse-ring" v-for="i in 3" :key="i"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EndingData } from '../types'

// Props
interface Props {
  endingData?: EndingData | null
}

const props = defineProps<Props>()

// Events
defineEmits<{
  'restart-game': []
  'go-to-title': []
}>()

// 计算属性
const endingTitle = computed(() => {
  return props.endingData?.title || '游戏结束'
})

const endingDescription = computed(() => {
  return props.endingData?.description || '感谢您的游玩！'
})

const showStats = computed(() => {
  return props.endingData?.ending_id !== undefined
})

const gameTimeSpent = computed(() => {
  // 这里应该从游戏状态计算实际游戏时长
  return '约 2 小时'
})

const mainAchievement = computed(() => {
  // 根据结局ID返回主要成就
  const achievements: Record<number, string> = {
    1: '工作狂魔',
    2: '技术专家',
    3: '平衡大师',
    4: '社交达人',
    5: '哲学思考者',
    6: '理性至上',
    7: '感性生活',
    8: '财富自由',
    9: '管理精英',
    10: '人生智者'
  }
  return achievements[props.endingData?.ending_id || 0] || '工程师之路'
})

const highestStat = computed(() => {
  // 这里应该从游戏状态获取最高属性
  return '理性 (85)'
})

// 方法
const getEndingTypeText = () => {
  if (!props.endingData) return ''
  
  const endingId = props.endingData.ending_id
  if (endingId >= 1 && endingId <= 5) return '❌ 失败结局'
  if (endingId >= 6 && endingId <= 10) return '🏆 成就结局'
  if (endingId >= 11 && endingId <= 13) return '⭐ 平衡结局'
  return '🎮 特殊结局'
}

const getEndingIcon = () => {
  if (!props.endingData) return '🎮'
  
  const icons: Record<number, string> = {
    1: '💀', // 过劳死
    2: '🏥', // 病重不治
    3: '🍽️', // 饥饿而死
    4: '👔', // 被解雇
    5: '🏠', // 无家可归
    6: '🧠', // 理性巅峰
    7: '💖', // 感性升华
    8: '🔧', // 技术专家
    9: '🤝', // 社交达人
    10: '🤔', // 人生智者
    11: '⚖️', // 平衡人生
    12: '💰', // 财富自由
    13: '👑'  // 管理精英
  }
  return icons[props.endingData.ending_id] || '🎮'
}

const getEndingIconClass = () => {
  if (!props.endingData) return 'neutral'
  
  const endingId = props.endingData.ending_id
  if (endingId >= 1 && endingId <= 5) return 'failure'
  if (endingId >= 6 && endingId <= 10) return 'achievement'
  if (endingId >= 11 && endingId <= 13) return 'balance'
  return 'special'
}

const getParticleStyle = (_index: number) => {
  const size = Math.random() * 4 + 2
  const duration = Math.random() * 3 + 2
  const delay = Math.random() * 2
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  }
}

const getDecorationStyle = (index: number) => {
  const angle = (index / 8) * 360
  const distance = 40 + Math.random() * 20
  const size = Math.random() * 3 + 1
  
  return {
    transform: `rotate(${angle}deg) translateX(${distance}px)`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${index * 0.2}s`
  }
}
</script>

<style scoped>
.ending-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: 
    radial-gradient(circle at 50% 50%, #002200 0%, #000000 70%),
    linear-gradient(45deg, #001100 25%, transparent 25%),
    linear-gradient(-45deg, #001100 25%, transparent 25%);
  background-size: 100% 100%, 20px 20px, 20px 20px;
  overflow: hidden;
}

.ending-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.background-particles {
  position: relative;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  background: #00ff00;
  border-radius: 50%;
  opacity: 0.3;
  animation: float-particle linear infinite;
}

@keyframes float-particle {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.3;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-20px) rotate(360deg);
    opacity: 0;
  }
}

.ending-container {
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  background: rgba(0, 17, 0, 0.95);
  padding: 30px;
  text-align: center;
  position: relative;
  z-index: 10;
  overflow-y: auto;
}

.ending-header {
  margin-bottom: 30px;
}

.ending-title {
  font-size: 24px;
  color: #00ffff;
  margin-bottom: 10px;
  text-shadow: 2px 2px 0px #000, 0 0 15px #00ffff;
}

.ending-type {
  font-size: 12px;
  color: #ffff00;
  text-shadow: 1px 1px 0px #000;
}

.ending-image-container {
  margin-bottom: 30px;
}

.ending-image {
  display: flex;
  justify-content: center;
}

.pixel-art-frame {
  position: relative;
  width: 200px;
  height: 200px;
  border: 4px solid #00ff00;
  background: 
    linear-gradient(45deg, #001100 25%, transparent 25%),
    linear-gradient(-45deg, #001100 25%, transparent 25%);
  background-size: 20px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ending-icon {
  font-size: 80px;
  position: relative;
  z-index: 2;
  animation: icon-glow 2s ease-in-out infinite;
}

.ending-icon.failure {
  color: #ff4444;
  text-shadow: 0 0 10px #ff4444;
}

.ending-icon.achievement {
  color: #44ff44;
  text-shadow: 0 0 10px #44ff44;
}

.ending-icon.balance {
  color: #ffff44;
  text-shadow: 0 0 10px #ffff44;
}

.ending-icon.special {
  color: #ff44ff;
  text-shadow: 0 0 10px #ff44ff;
}

.ending-icon.neutral {
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00;
}

@keyframes icon-glow {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.image-decorations {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.decoration-spark {
  position: absolute;
  background: #00ff00;
  border-radius: 50%;
  opacity: 0.6;
  animation: spark-twinkle 1s infinite;
}

@keyframes spark-twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.5);
  }
}

.ending-description {
  margin-bottom: 30px;
}

.description-text {
  margin-bottom: 20px;
}

.ending-content {
  font-size: 12px;
  color: #aaffaa;
  line-height: 1.6;
  text-shadow: 1px 1px 0px #000;
  margin-bottom: 0;
}

.ending-stats {
  border: 2px solid #004400;
  padding: 16px;
  background: rgba(0, 34, 0, 0.5);
}

.stats-title {
  color: #ffff00;
  font-size: 10px;
  margin-bottom: 12px;
}

.stats-grid {
  display: grid;
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #004400;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 8px;
  color: #aaffaa;
}

.stat-value {
  font-size: 8px;
  color: #00ff00;
  font-weight: bold;
}

.ending-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 20px;
}

.ending-actions .pixel-button {
  min-width: 150px;
}

.credits {
  border-top: 1px solid #004400;
  padding-top: 16px;
  opacity: 0.7;
}

.credit-text {
  margin: 4px 0;
}

.ending-effects {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  pointer-events: none;
}

.pulse-rings {
  position: relative;
  width: 300px;
  height: 300px;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 2px solid #00ff00;
  border-radius: 50%;
  opacity: 0;
  animation: pulse-ring 3s ease-out infinite;
}

.pulse-ring:nth-child(2) {
  animation-delay: 1s;
}

.pulse-ring:nth-child(3) {
  animation-delay: 2s;
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ending-container {
    padding: 20px;
    width: 95%;
  }
  
  .ending-title {
    font-size: 18px;
  }
  
  .pixel-art-frame {
    width: 150px;
    height: 150px;
  }
  
  .ending-icon {
    font-size: 60px;
  }
  
  .ending-actions {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .ending-actions .pixel-button {
    min-width: 200px;
  }
}

@media (max-width: 480px) {
  .ending-container {
    padding: 16px;
  }
  
  .ending-title {
    font-size: 14px;
  }
  
  .ending-type {
    font-size: 10px;
  }
  
  .pixel-art-frame {
    width: 120px;
    height: 120px;
  }
  
  .ending-icon {
    font-size: 40px;
  }
  
  .ending-content {
    font-size: 10px;
  }
  
  .ending-actions .pixel-button {
    min-width: 150px;
    font-size: 8px;
    padding: 12px 16px;
  }
}
</style> 