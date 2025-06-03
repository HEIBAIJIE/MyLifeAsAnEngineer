<template>
  <div class="loading-overlay">
    <div class="loading-container pixel-border">
      <div class="loading-header">
        <div class="terminal-line">
          <span class="terminal-bracket">[</span>
          <span class="loading-title pixel-glow chinese-pixel">系统初始化</span>
          <span class="terminal-bracket">]</span>
        </div>
        <div class="scan-line"></div>
      </div>
      
      <div class="loading-content">
        <!-- 矩阵雨背景 -->
        <div class="matrix-rain">
          <div v-for="i in 20" :key="i" class="matrix-column" :style="{ left: `${i * 5}%`, animationDelay: `${i * 0.1}s` }">
            <span v-for="j in 10" :key="j" class="matrix-char">{{ getRandomChar() }}</span>
          </div>
        </div>
        
        <!-- 主要内容 -->
        <div class="loading-main">
          <!-- 当前状态 -->
          <div class="loading-status">
            <div class="status-icon">
              <div class="terminal-cursor"></div>
            </div>
            <div class="status-text chinese-pixel">{{ currentStatus }}</div>
          </div>
          
          <!-- 进度条 -->
          <div class="progress-container">
            <div class="progress-bar pixel-border">
              <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
              <div class="progress-text">{{ Math.round(progress) }}%</div>
            </div>
          </div>
          
          <!-- 详细步骤 -->
          <div class="loading-steps">
            <div 
              v-for="(step, index) in loadingSteps" 
              :key="index"
              class="loading-step"
              :class="{
                'completed': step.completed,
                'current': step.current,
                'pending': !step.completed && !step.current
              }"
            >
              <div class="step-indicator">
                <span v-if="step.completed" class="step-icon">✓</span>
                <span v-else-if="step.current" class="step-spinner">◐</span>
                <span v-else class="step-pending">○</span>
              </div>
              <div class="step-text chinese-pixel">{{ step.text }}</div>
              <div v-if="step.current" class="step-dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </div>
          
          <!-- 系统信息 -->
          <div class="system-info">
            <div class="info-line">
              <span class="info-label">&gt;</span>
              <span class="info-text chinese-pixel">正在加载游戏引擎...</span>
            </div>
            <div class="info-line">
              <span class="info-label">&gt;</span>
              <span class="info-text chinese-pixel">初始化数据管理器...</span>
            </div>
            <div class="info-line">
              <span class="info-label">&gt;</span>
              <span class="info-text chinese-pixel">建立后端连接...</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 提示信息 -->
      <div class="loading-footer">
        <div class="loading-tip">
          <span class="tip-icon">💡</span>
          <span class="tip-text chinese-pixel">首次启动需要加载游戏资源，请稍候...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  visible: boolean
  progress: number
  currentStep: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  progress: 0,
  currentStep: '正在初始化...'
})

// 响应式数据
const matrixChars = ['0', '1', 'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', '数', '据', '加', '载']

// 计算属性
const currentStatus = computed(() => props.currentStep)

const loadingSteps = computed(() => [
  {
    text: '加载游戏引擎脚本',
    completed: props.progress > 20,
    current: props.progress >= 0 && props.progress <= 20
  },
  {
    text: '初始化后端适配器',
    completed: props.progress > 40,
    current: props.progress > 20 && props.progress <= 40
  },
  {
    text: '连接游戏引擎',
    completed: props.progress > 60,
    current: props.progress > 40 && props.progress <= 60
  },
  {
    text: '加载游戏数据',
    completed: props.progress > 80,
    current: props.progress > 60 && props.progress <= 80
  },
  {
    text: '准备游戏界面',
    completed: props.progress >= 100,
    current: props.progress > 80 && props.progress < 100
  }
])

// 方法
const getRandomChar = () => {
  return matrixChars[Math.floor(Math.random() * matrixChars.length)]
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at center, rgba(0, 40, 0, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(10px);
}

.loading-container {
  background: var(--panel-black);
  padding: clamp(32px, 4vw, 48px);
  max-width: 600px;
  width: 90%;
  position: relative;
  overflow: hidden;
}

/* 矩阵雨背景 */
.matrix-rain {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: 0.1;
  z-index: -1;
}

.matrix-column {
  position: absolute;
  top: -100%;
  width: 20px;
  height: 200%;
  animation: matrix-fall 4s linear infinite;
}

.matrix-char {
  display: block;
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(8px, 1vw, 12px);
  color: var(--terminal-green);
  text-shadow: 0 0 calc(var(--glow-size) / 4) currentColor;
  margin: 2px 0;
  animation: matrix-char-flicker 0.5s ease-in-out infinite alternate;
}

@keyframes matrix-fall {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

@keyframes matrix-char-flicker {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

/* 头部 */
.loading-header {
  text-align: center;
  margin-bottom: clamp(24px, 3vw, 36px);
}

.terminal-line {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(8px, 1vw, 12px);
}

.terminal-bracket {
  color: var(--matrix-dark-green);
  font-family: 'Press Start 2P', monospace;
  font-size: var(--ui-font-size);
  text-shadow: 0 0 calc(var(--glow-size) / 2) currentColor;
}

.loading-title {
  font-size: var(--subtitle-font-size);
  color: var(--neon-cyan);
  text-shadow: 
    2px 2px 0px var(--background-black), 
    0 0 var(--glow-size) currentColor;
}

.scan-line {
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--terminal-green),
    var(--matrix-green),
    var(--terminal-green),
    transparent
  );
  margin-top: clamp(8px, 1vw, 12px);
  animation: scan-sweep 2s linear infinite;
}

@keyframes scan-sweep {
  0% { opacity: 0.3; transform: scaleX(0.5); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.3; transform: scaleX(0.5); }
}

/* 主要内容 */
.loading-main {
  position: relative;
  z-index: 1;
}

/* 当前状态 */
.loading-status {
  display: flex;
  align-items: center;
  gap: clamp(12px, 1.5vw, 18px);
  margin-bottom: clamp(20px, 2.5vw, 30px);
  padding: clamp(12px, 1.5vw, 18px);
  background: rgba(0, 30, 0, 0.8);
  border-left: 3px solid var(--terminal-green);
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.terminal-cursor {
  width: clamp(8px, 1vw, 12px);
  height: clamp(16px, 2vw, 24px);
  background: var(--terminal-green);
  animation: cursor-blink 1s ease-in-out infinite;
  box-shadow: 0 0 calc(var(--glow-size) / 2) var(--terminal-green);
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.status-text {
  font-size: var(--ui-font-size);
  color: var(--matrix-light-green);
  text-shadow: 
    1px 1px 0px var(--background-black),
    0 0 calc(var(--glow-size) / 4) currentColor;
}

/* 进度条 */
.progress-container {
  margin-bottom: clamp(24px, 3vw, 36px);
}

.progress-bar {
  height: clamp(20px, 2.5vw, 32px);
  background: rgba(0, 0, 0, 0.8);
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--matrix-green),
    var(--terminal-green),
    var(--matrix-light-green),
    var(--terminal-green),
    var(--matrix-green)
  );
  background-size: 200% 100%;
  animation: progress-flow 2s linear infinite;
  transition: width 0.3s ease;
  box-shadow: 
    0 0 calc(var(--glow-size) / 2) var(--matrix-green),
    inset 0 0 calc(var(--glow-size) / 4) var(--terminal-green);
}

@keyframes progress-flow {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Press Start 2P', monospace;
  font-size: var(--ui-font-size);
  color: var(--background-black);
  font-weight: bold;
  z-index: 2;
  text-shadow: none;
}

/* 加载步骤 */
.loading-steps {
  margin-bottom: clamp(20px, 2.5vw, 30px);
}

.loading-step {
  display: flex;
  align-items: center;
  gap: clamp(10px, 1.2vw, 16px);
  padding: clamp(8px, 1vw, 12px);
  margin-bottom: clamp(6px, 0.8vw, 10px);
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.loading-step.completed {
  background: rgba(0, 40, 0, 0.6);
  border-left: 3px solid var(--terminal-green);
}

.loading-step.current {
  background: rgba(0, 60, 0, 0.8);
  border-left: 3px solid var(--neon-yellow);
  box-shadow: 0 0 calc(var(--glow-size) / 2) var(--neon-yellow);
}

.loading-step.pending {
  background: rgba(0, 0, 0, 0.2);
  border-left: 3px solid var(--matrix-dark-green);
}

.step-indicator {
  width: clamp(16px, 2vw, 24px);
  height: clamp(16px, 2vw, 24px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-icon {
  color: var(--terminal-green);
  font-size: var(--ui-font-size);
  text-shadow: 0 0 calc(var(--glow-size) / 2) currentColor;
}

.step-spinner {
  color: var(--neon-yellow);
  font-size: var(--ui-font-size);
  animation: spinner-rotate 1s linear infinite;
  text-shadow: 0 0 calc(var(--glow-size) / 2) currentColor;
}

@keyframes spinner-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.step-pending {
  color: var(--matrix-dark-green);
  font-size: var(--ui-font-size);
  opacity: 0.5;
}

.step-text {
  flex: 1;
  font-size: var(--ui-font-size);
  color: var(--matrix-light-green);
  text-shadow: 
    1px 1px 0px var(--background-black),
    0 0 calc(var(--glow-size) / 4) currentColor;
}

.loading-step.completed .step-text {
  color: var(--terminal-green);
}

.loading-step.current .step-text {
  color: var(--neon-yellow);
}

.step-dots {
  display: flex;
  gap: clamp(3px, 0.5vw, 6px);
}

.dot {
  width: clamp(4px, 0.6vw, 8px);
  height: clamp(4px, 0.6vw, 8px);
  background: var(--neon-yellow);
  animation: dot-pulse 1.5s ease-in-out infinite;
}

.dot:nth-child(2) { animation-delay: 0.3s; }
.dot:nth-child(3) { animation-delay: 0.6s; }

@keyframes dot-pulse {
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
}

/* 系统信息 */
.system-info {
  background: rgba(0, 0, 0, 0.5);
  padding: clamp(12px, 1.5vw, 18px);
  border: 1px solid var(--border-green);
  font-family: 'Source Code Pro', monospace;
}

.info-line {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1vw, 12px);
  margin-bottom: clamp(4px, 0.6vw, 8px);
}

.info-label {
  color: var(--terminal-green);
  font-size: var(--small-font-size);
  text-shadow: 0 0 calc(var(--glow-size) / 4) currentColor;
}

.info-text {
  font-size: var(--small-font-size);
  color: var(--matrix-dark-green);
  text-shadow: 
    1px 1px 0px var(--background-black),
    0 0 calc(var(--glow-size) / 4) currentColor;
  animation: text-scroll 3s linear infinite;
}

@keyframes text-scroll {
  0%, 90% { opacity: 0.7; }
  95% { opacity: 1; }
  100% { opacity: 0.7; }
}

/* 底部 */
.loading-footer {
  text-align: center;
  margin-top: clamp(20px, 2.5vw, 30px);
}

.loading-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 1vw, 12px);
  padding: clamp(8px, 1vw, 12px);
  background: rgba(0, 20, 0, 0.5);
  border: 1px solid var(--border-green);
}

.tip-icon {
  font-size: var(--ui-font-size);
  filter: drop-shadow(0 0 calc(var(--glow-size) / 4) #ffff00);
}

.tip-text {
  font-size: var(--small-font-size);
  color: var(--matrix-light-green);
  text-shadow: 
    1px 1px 0px var(--background-black),
    0 0 calc(var(--glow-size) / 4) currentColor;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-container {
    padding: clamp(20px, 3vw, 32px);
    width: 95%;
  }
  
  .loading-step {
    gap: clamp(6px, 1vw, 12px);
  }
  
  .matrix-char {
    font-size: clamp(6px, 0.8vw, 10px);
  }
}

@media (max-width: 480px) {
  .terminal-line {
    flex-direction: column;
    gap: clamp(4px, 0.8vw, 8px);
  }
  
  .loading-status {
    flex-direction: column;
    text-align: center;
    gap: clamp(6px, 1vw, 10px);
  }
  
  .info-line {
    flex-direction: column;
    text-align: center;
    gap: clamp(4px, 0.6vw, 8px);
  }
  
  .loading-tip {
    flex-direction: column;
    gap: clamp(4px, 0.6vw, 8px);
  }
}
</style> 