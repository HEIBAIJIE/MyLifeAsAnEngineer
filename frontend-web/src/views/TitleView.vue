<template>
  <div class="title-view">
    <!-- 矩阵扫描背景 -->
    <div class="matrix-background"></div>
    
    <!-- 数据流装饰 -->
    <div class="data-streams">
      <div class="data-stream" v-for="i in 8" :key="i"></div>
    </div>
    
    <!-- 主标题区域 -->
    <div class="title-container">
      <div class="pixel-border title-box">
        <!-- 终端启动提示 -->
        <div class="terminal-header">
          <span class="terminal-prompt">{{ t('systemInitialized') }}</span>
          <span class="cursor-blink">█</span>
        </div>
        
        <!-- 游戏标题 -->
        <h1 class="game-title pixel-glow">
          <span class="title-line chinese-pixel">{{ t('gameTitle') }}</span>
          <span class="subtitle-line english-pixel">{{ t('gameSubtitle') }}</span>
        </h1>
        
        <!-- 游戏描述 - 改为更沉浸的表达 -->
        <div class="game-description">
          <p class="pixel-text-subtitle chinese-pixel">
            {{ t('gameDescription1') }}
          </p>
          <p class="pixel-text-subtitle chinese-pixel">
            {{ t('gameDescription2') }}
          </p>
        </div>
        
        <!-- 菜单按钮 -->
        <div class="menu-buttons">
          <button 
            class="pixel-button large menu-btn"
            @click="$emit('new-game')"
          >
            <span class="btn-prefix">&gt;</span> 
            <span class="chinese-pixel">{{ t('newGame') }}</span>
            <span class="btn-suffix">&lt;</span>
          </button>
          
          <button 
            class="pixel-button large menu-btn"
            @click="$emit('load-game')"
          >
            <span class="btn-prefix">&gt;</span>
            <span class="chinese-pixel">{{ t('loadGame') }}</span>
            <span class="btn-suffix">&lt;</span>
          </button>
          
          <button 
            class="pixel-button large menu-btn"
            @click="$emit('exit-game')"
          >
            <span class="btn-prefix">&gt;</span>
            <span class="chinese-pixel">{{ t('exitGame') }}</span>
            <span class="btn-suffix">&lt;</span>
          </button>
        </div>
        
        <!-- 语言选择器 -->
        <div class="language-selector-title">
          <div class="lang-label pixel-text-small">{{ currentLanguage === 'zh' ? 'Language / 语言' : 'Language / 语言' }}</div>
          <div class="lang-buttons">
            <button 
              class="pixel-button small lang-btn"
              :class="{ active: currentLanguage === 'zh' }"
              @click="switchLanguage('zh')"
            >
              中文
            </button>
            <button 
              class="pixel-button small lang-btn"
              :class="{ active: currentLanguage === 'en' }"
              @click="switchLanguage('en')"
            >
              English
            </button>
          </div>
        </div>
        
        <!-- 版权信息 - 改为更有科技感的表达 -->
        <div class="credits">
          <p class="pixel-text-small english-pixel">
            &lt;/&gt; {{ t('poweredBy') }} &lt;/&gt;
          </p>
          <p class="pixel-text-small chinese-pixel">
            {{ t('version') }}
          </p>
        </div>
        
        <!-- 终端底部提示 -->
        <div class="terminal-footer">
          <span class="terminal-prompt">{{ t('awaitingInput') }}</span>
          <span class="cursor-blink">█</span>
        </div>
      </div>
    </div>
    
    <!-- 浮动代码装饰 -->
    <div class="floating-code">
      <div class="code-fragment" v-for="i in 12" :key="i">
        {{ getRandomCode() }}
      </div>
    </div>
    
    <!-- 矩阵雨效果 -->
    <div class="matrix-rain">
      <div class="rain-column" v-for="i in 20" :key="i">
        <span v-for="j in 10" :key="j" class="rain-char">{{ getRandomChar() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useI18n } from '../utils/i18n'

// Props
interface Props {
  currentLanguage: string
}

const props = defineProps<Props>()

// 多语言支持 - 使用响应式语言引用
const { t } = useI18n(toRef(props, 'currentLanguage'))

// 定义事件
const emit = defineEmits<{
  'new-game': []
  'load-game': []
  'exit-game': []
  'language-change': [language: string]
}>()

// 语言切换方法
const switchLanguage = (language: string) => {
  if (language !== props.currentLanguage) {
    emit('language-change', language)
  }
}

// 随机代码片段
const codeSamples = [
  'if (life.isEmpty())', 
  'while (working)', 
  'console.log("debug");',
  'function solve()',
  'return happiness;',
  'catch (error)',
  'async await',
  'let dreams = [];',
  'const reality = 42;',
  'git commit -m "life"',
  'npm install hope',
  'sudo rm -rf stress'
]

// 随机矩阵字符
const matrixChars = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  '工', '程', '师', '生', '活', '代', '码', '调', '试', '算',
  '法', '数', '据', '系', '统', '网', '络', '服', '务', '器'
]

const getRandomCode = () => {
  return codeSamples[Math.floor(Math.random() * codeSamples.length)]
}

const getRandomChar = () => {
  return matrixChars[Math.floor(Math.random() * matrixChars.length)]
}
</script>

<style scoped>
.title-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: 
    radial-gradient(circle at 25% 25%, var(--shadow-green) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, var(--border-green) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, var(--panel-black) 0%, transparent 70%),
    var(--background-black);
  overflow: hidden;
}

/* 矩阵扫描背景 */
.matrix-background {
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
  animation: matrix-drift 10s linear infinite;
}

@keyframes matrix-drift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(12px, 12px); }
}

/* 数据流装饰 */
.data-streams {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.data-stream {
  position: absolute;
  width: 2px;
  height: 100px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--terminal-green),
    var(--matrix-green),
    transparent
  );
  animation: data-flow 4s linear infinite;
}

.data-stream:nth-child(1) { left: 10%; animation-delay: 0s; }
.data-stream:nth-child(2) { left: 20%; animation-delay: 0.5s; }
.data-stream:nth-child(3) { left: 30%; animation-delay: 1s; }
.data-stream:nth-child(4) { left: 40%; animation-delay: 1.5s; }
.data-stream:nth-child(5) { left: 50%; animation-delay: 2s; }
.data-stream:nth-child(6) { left: 60%; animation-delay: 2.5s; }
.data-stream:nth-child(7) { left: 70%; animation-delay: 3s; }
.data-stream:nth-child(8) { left: 80%; animation-delay: 3.5s; }

/* 主容器 */
.title-container {
  z-index: 10;
  max-width: 700px;
  width: 90%;
  padding: 20px;
}

.title-box {
  padding: clamp(30px, 4vw, 50px);
  text-align: center;
  position: relative;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(5px);
}

/* 终端提示 */
.terminal-header, .terminal-footer {
  font-size: var(--small-font-size);
  color: var(--matrix-dark-green);
  margin: clamp(8px, 1vw, 15px) 0;
  font-family: 'Source Code Pro', monospace;
}

.terminal-prompt {
  text-shadow: 0 0 calc(var(--glow-size) / 2) currentColor;
}

.cursor-blink {
  animation: cursor-blink 1s infinite;
  color: var(--terminal-green);
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 游戏标题 */
.game-title {
  margin: clamp(20px, 3vw, 40px) 0;
  position: relative;
}

.title-line {
  display: block;
  font-size: var(--title-font-size);
  color: var(--neon-cyan);
  text-shadow: 
    2px 2px 0px var(--background-black), 
    0 0 calc(var(--glow-size) * 1.5) currentColor;
  margin-bottom: clamp(10px, 1.5vw, 20px);
  animation: matrix-glow 3s infinite;
}

.subtitle-line {
  display: block;
  font-size: var(--subtitle-font-size);
  color: var(--neon-yellow);
  text-shadow: 
    1px 1px 0px var(--background-black),
    0 0 var(--glow-size) currentColor;
  opacity: 0.9;
}

/* 游戏描述 */
.game-description {
  margin: clamp(20px, 3vw, 35px) 0;
  line-height: 1.8;
}

.game-description p {
  margin: clamp(6px, 1vw, 12px) 0;
  color: var(--terminal-green);
  opacity: 0.9;
}

/* 菜单按钮 */
.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: clamp(15px, 2.5vw, 25px);
  margin: clamp(25px, 4vw, 45px) 0;
}

.menu-btn {
  position: relative;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  display: flex;
  gap: clamp(8px, 1.2vw, 15px);
}

.btn-prefix, .btn-suffix {
  color: var(--matrix-dark-green);
  font-family: 'Press Start 2P', monospace;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.menu-btn:hover .btn-prefix,
.menu-btn:hover .btn-suffix {
  color: var(--terminal-green);
  opacity: 1;
  animation: bracket-pulse 0.5s ease infinite alternate;
}

@keyframes bracket-pulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

.menu-btn:hover {
  transform: translateY(calc(-1 * var(--pixel-size)));
}

/* 语言选择器 */
.language-selector-title {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: clamp(10px, 1.5vw, 20px) 0;
}

.lang-label {
  margin-right: clamp(10px, 1.5vw, 20px);
}

.lang-buttons {
  display: flex;
  gap: clamp(5px, 0.8vw, 10px);
}

.lang-btn {
  padding: clamp(5px, 0.8vw, 10px) clamp(10px, 1.5vw, 20px);
  background: none;
  border: 1px solid var(--matrix-dark-green);
  color: var(--matrix-dark-green);
  font-family: 'Press Start 2P', monospace;
  font-size: var(--small-font-size);
  cursor: pointer;
  transition: all 0.3s ease;
}

.lang-btn.active {
  background: var(--matrix-dark-green);
  color: var(--terminal-green);
}

/* 版权信息 */
.credits {
  border-top: 1px solid var(--border-green);
  padding-top: clamp(20px, 2.5vw, 30px);
  opacity: 0.8;
}

.credits p {
  margin: clamp(4px, 0.8vw, 8px) 0;
  color: var(--matrix-dark-green);
}

/* 浮动代码装饰 */
.floating-code {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
}

.code-fragment {
  position: absolute;
  font-family: 'Source Code Pro', monospace;
  font-size: var(--tiny-font-size);
  color: var(--matrix-dark-green);
  opacity: 0.3;
  animation: float-code 15s linear infinite;
  text-shadow: 0 0 calc(var(--glow-size) / 2) currentColor;
}

.code-fragment:nth-child(1) { top: 10%; left: 5%; animation-delay: 0s; }
.code-fragment:nth-child(2) { top: 20%; left: 85%; animation-delay: 2s; }
.code-fragment:nth-child(3) { top: 30%; left: 10%; animation-delay: 4s; }
.code-fragment:nth-child(4) { top: 40%; left: 90%; animation-delay: 6s; }
.code-fragment:nth-child(5) { top: 50%; left: 5%; animation-delay: 8s; }
.code-fragment:nth-child(6) { top: 60%; left: 85%; animation-delay: 10s; }
.code-fragment:nth-child(7) { top: 70%; left: 15%; animation-delay: 12s; }
.code-fragment:nth-child(8) { top: 80%; left: 80%; animation-delay: 14s; }
.code-fragment:nth-child(9) { top: 15%; left: 50%; animation-delay: 1s; }
.code-fragment:nth-child(10) { top: 35%; left: 55%; animation-delay: 3s; }
.code-fragment:nth-child(11) { top: 55%; left: 45%; animation-delay: 5s; }
.code-fragment:nth-child(12) { top: 75%; left: 40%; animation-delay: 7s; }

@keyframes float-code {
  0% { 
    transform: translateY(0px) rotate(0deg); 
    opacity: 0; 
  }
  10% { 
    opacity: 0.3; 
  }
  90% { 
    opacity: 0.3; 
  }
  100% { 
    transform: translateY(-20px) rotate(2deg); 
    opacity: 0; 
  }
}

/* 矩阵雨效果 */
.matrix-rain {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  opacity: 0.15;
}

.rain-column {
  position: absolute;
  top: -100px;
  display: flex;
  flex-direction: column;
  animation: matrix-fall 8s linear infinite;
  font-family: 'Source Code Pro', monospace;
  font-size: var(--small-font-size);
}

.rain-column:nth-child(odd) {
  animation-duration: 10s;
}

.rain-column:nth-child(1) { left: 5%; animation-delay: 0s; }
.rain-column:nth-child(2) { left: 10%; animation-delay: 1s; }
.rain-column:nth-child(3) { left: 15%; animation-delay: 2s; }
.rain-column:nth-child(4) { left: 20%; animation-delay: 3s; }
.rain-column:nth-child(5) { left: 25%; animation-delay: 4s; }
.rain-column:nth-child(6) { left: 30%; animation-delay: 5s; }
.rain-column:nth-child(7) { left: 35%; animation-delay: 6s; }
.rain-column:nth-child(8) { left: 40%; animation-delay: 7s; }
.rain-column:nth-child(9) { left: 45%; animation-delay: 0.5s; }
.rain-column:nth-child(10) { left: 50%; animation-delay: 1.5s; }
.rain-column:nth-child(11) { left: 55%; animation-delay: 2.5s; }
.rain-column:nth-child(12) { left: 60%; animation-delay: 3.5s; }
.rain-column:nth-child(13) { left: 65%; animation-delay: 4.5s; }
.rain-column:nth-child(14) { left: 70%; animation-delay: 5.5s; }
.rain-column:nth-child(15) { left: 75%; animation-delay: 6.5s; }
.rain-column:nth-child(16) { left: 80%; animation-delay: 7.5s; }
.rain-column:nth-child(17) { left: 85%; animation-delay: 1.2s; }
.rain-column:nth-child(18) { left: 90%; animation-delay: 2.2s; }
.rain-column:nth-child(19) { left: 95%; animation-delay: 3.2s; }
.rain-column:nth-child(20) { left: 2%; animation-delay: 4.2s; }

.rain-char {
  color: var(--matrix-green);
  text-shadow: 0 0 calc(var(--glow-size) / 2) currentColor;
  margin: 2px 0;
  opacity: 0.8;
}

.rain-char:first-child {
  color: var(--terminal-green);
  text-shadow: 0 0 var(--glow-size) currentColor;
  opacity: 1;
}

@keyframes matrix-fall {
  0% { transform: translateY(-100px); }
  100% { transform: translateY(calc(100vh + 100px)); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .title-box {
    padding: clamp(20px, 3vw, 35px);
  }
  
  .floating-code {
    display: none; /* 在小屏幕上隐藏浮动代码 */
  }
  
  .matrix-rain {
    opacity: 0.1; /* 减少矩阵雨的透明度 */
  }
  
  .menu-btn {
    gap: clamp(6px, 1vw, 10px);
  }
}

@media (max-width: 480px) {
  .data-streams {
    display: none; /* 在很小的屏幕上隐藏数据流 */
  }
  
  .matrix-rain .rain-column:nth-child(even) {
    display: none; /* 减少矩阵雨列数 */
  }
}

/* 大屏幕优化 */
@media (min-width: 1920px) {
  .title-container {
    max-width: 900px;
  }
  
  .title-box {
    padding: clamp(50px, 5vw, 70px);
  }
}
</style> 