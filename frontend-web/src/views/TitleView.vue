<template>
  <div class="title-view">
    <!-- 像素化背景 -->
    <div class="pixel-background"></div>
    
    <!-- 主标题区域 -->
    <div class="title-container">
      <div class="pixel-border title-box">
        <!-- 游戏标题 -->
        <h1 class="game-title pixel-glow">
          <span class="title-line">我的工程师生活</span>
          <span class="subtitle-line">My Life As An Engineer</span>
        </h1>
        
        <!-- 副标题描述 -->
        <div class="game-description">
          <p class="pixel-text-subtitle">
            在重复的工作生活中发现自我
          </p>
          <p class="pixel-text-subtitle">
            探索理性与感性的哲学之路
          </p>
        </div>
        
        <!-- 菜单按钮 -->
        <div class="menu-buttons">
          <button 
            class="pixel-button large"
            @click="$emit('new-game')"
          >
            🎮 开始新游戏
          </button>
          
          <button 
            class="pixel-button large"
            @click="$emit('load-game')"
          >
            💾 读取存档
          </button>
          
          <button 
            class="pixel-button large"
            @click="$emit('exit-game')"
          >
            🚪 退出游戏
          </button>
        </div>
        
        <!-- 版权信息 -->
        <div class="credits">
          <p class="pixel-text-small">
            基于哲学思辨的工程师生活模拟
          </p>
          <p class="pixel-text-small">
            Powered by TypeScript & Vue3
          </p>
        </div>
      </div>
    </div>
    
    <!-- 装饰性像素元素 -->
    <div class="decorative-pixels">
      <div class="pixel-dots">
        <div class="pixel-dot" v-for="i in 20" :key="i"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义事件
defineEmits<{
  'new-game': []
  'load-game': []
  'exit-game': []
}>()
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
    radial-gradient(circle at 20% 80%, #003300 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, #001100 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, #002200 0%, transparent 50%),
    #000;
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
      transparent 4px,
      rgba(0, 255, 0, 0.03) 4px,
      rgba(0, 255, 0, 0.03) 8px
    ),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 4px,
      rgba(0, 255, 0, 0.03) 4px,
      rgba(0, 255, 0, 0.03) 8px
    );
  z-index: 1;
}

.title-container {
  z-index: 2;
  max-width: 600px;
  width: 90%;
  padding: 20px;
}

.title-box {
  padding: 40px;
  text-align: center;
  position: relative;
  background: rgba(0, 17, 0, 0.9);
}

.game-title {
  margin-bottom: 30px;
}

.title-line {
  display: block;
  font-size: 20px;
  color: #00ffff;
  text-shadow: 2px 2px 0px #000, 0 0 10px #00ffff;
  margin-bottom: 10px;
  animation: pixel-glow 3s infinite;
}

.subtitle-line {
  display: block;
  font-size: 12px;
  color: #ffff00;
  text-shadow: 1px 1px 0px #000;
  opacity: 0.8;
}

.game-description {
  margin-bottom: 40px;
  line-height: 1.6;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}

.menu-buttons .pixel-button {
  transition: all 0.2s ease;
}

.menu-buttons .pixel-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 0 #004400, 0 0 15px #00ff00;
}

.credits {
  border-top: 1px solid #004400;
  padding-top: 20px;
  opacity: 0.7;
}

.decorative-pixels {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.pixel-dots {
  position: relative;
  width: 100%;
  height: 100%;
}

.pixel-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #00ff00;
  opacity: 0.3;
  animation: pixel-blink 2s infinite;
}

.pixel-dot:nth-child(1) { top: 10%; left: 15%; animation-delay: 0s; }
.pixel-dot:nth-child(2) { top: 20%; left: 85%; animation-delay: 0.2s; }
.pixel-dot:nth-child(3) { top: 30%; left: 5%; animation-delay: 0.4s; }
.pixel-dot:nth-child(4) { top: 40%; left: 95%; animation-delay: 0.6s; }
.pixel-dot:nth-child(5) { top: 50%; left: 10%; animation-delay: 0.8s; }
.pixel-dot:nth-child(6) { top: 60%; left: 90%; animation-delay: 1s; }
.pixel-dot:nth-child(7) { top: 70%; left: 20%; animation-delay: 1.2s; }
.pixel-dot:nth-child(8) { top: 80%; left: 80%; animation-delay: 1.4s; }
.pixel-dot:nth-child(9) { top: 90%; left: 25%; animation-delay: 1.6s; }
.pixel-dot:nth-child(10) { top: 15%; left: 70%; animation-delay: 1.8s; }
.pixel-dot:nth-child(11) { top: 25%; left: 30%; animation-delay: 0.1s; }
.pixel-dot:nth-child(12) { top: 35%; left: 60%; animation-delay: 0.3s; }
.pixel-dot:nth-child(13) { top: 45%; left: 40%; animation-delay: 0.5s; }
.pixel-dot:nth-child(14) { top: 55%; left: 75%; animation-delay: 0.7s; }
.pixel-dot:nth-child(15) { top: 65%; left: 50%; animation-delay: 0.9s; }
.pixel-dot:nth-child(16) { top: 75%; left: 35%; animation-delay: 1.1s; }
.pixel-dot:nth-child(17) { top: 85%; left: 65%; animation-delay: 1.3s; }
.pixel-dot:nth-child(18) { top: 5%; left: 45%; animation-delay: 1.5s; }
.pixel-dot:nth-child(19) { top: 95%; left: 55%; animation-delay: 1.7s; }
.pixel-dot:nth-child(20) { top: 12%; left: 12%; animation-delay: 1.9s; }

/* 响应式设计 */
@media (max-width: 768px) {
  .title-box {
    padding: 20px;
  }
  
  .title-line {
    font-size: 16px;
  }
  
  .subtitle-line {
    font-size: 10px;
  }
  
  .menu-buttons {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .title-container {
    width: 95%;
    padding: 10px;
  }
  
  .title-box {
    padding: 16px;
  }
  
  .title-line {
    font-size: 14px;
  }
  
  .subtitle-line {
    font-size: 8px;
  }
  
  .menu-buttons .pixel-button {
    padding: 12px 16px;
    font-size: 8px;
  }
}
</style> 