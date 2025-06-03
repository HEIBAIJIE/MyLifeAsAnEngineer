<template>
  <div class="language-selector">
    <div class="selector-container pixel-border">
      <button 
        class="lang-btn pixel-button small"
        :class="{ active: currentLanguage === 'zh' }"
        @click="switchLanguage('zh')"
        :title="currentLanguage === 'zh' ? 'Switch to English' : '切换为中文'"
      >
        中
      </button>
      <span class="separator">|</span>
      <button 
        class="lang-btn pixel-button small"
        :class="{ active: currentLanguage === 'en' }"
        @click="switchLanguage('en')"
        :title="currentLanguage === 'zh' ? 'Switch to English' : '切换为中文'"
      >
        EN
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  currentLanguage: string
}

const props = defineProps<Props>()

// Events
const emit = defineEmits<{
  'language-change': [language: string]
}>()

// 方法
const switchLanguage = (language: string) => {
  if (language !== props.currentLanguage) {
    emit('language-change', language)
  }
}
</script>

<style scoped>
.language-selector {
  position: fixed;
  top: clamp(20px, 3vw, 30px);
  right: clamp(20px, 3vw, 30px);
  z-index: 1000;
}

.selector-container {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1vw, 12px);
  background: rgba(0, 20, 0, 0.9);
  padding: clamp(8px, 1.2vw, 12px) clamp(12px, 1.8vw, 18px);
  backdrop-filter: blur(8px);
}

.lang-btn {
  padding: clamp(6px, 1vw, 10px) clamp(10px, 1.5vw, 16px);
  font-size: var(--small-font-size);
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--border-green);
  color: var(--matrix-light-green);
  transition: all 0.3s ease;
  min-width: clamp(32px, 5vw, 48px);
  font-family: 'Press Start 2P', monospace;
}

.lang-btn:hover {
  border-color: var(--terminal-green);
  color: var(--terminal-green);
  box-shadow: 0 0 calc(var(--glow-size) / 2) var(--terminal-green);
  transform: translateY(-1px);
}

.lang-btn.active {
  background: rgba(0, 120, 0, 0.8);
  border-color: var(--terminal-green);
  color: var(--terminal-green);
  box-shadow: 
    0 0 var(--glow-size) var(--terminal-green),
    inset 0 0 calc(var(--glow-size) / 2) rgba(0, 255, 0, 0.2);
}

.lang-btn.active:hover {
  transform: none;
}

.separator {
  color: var(--matrix-dark-green);
  font-family: 'Press Start 2P', monospace;
  font-size: var(--small-font-size);
  opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .language-selector {
    top: clamp(15px, 2.5vw, 20px);
    right: clamp(15px, 2.5vw, 20px);
  }
  
  .selector-container {
    padding: clamp(6px, 1vw, 8px) clamp(8px, 1.2vw, 12px);
  }
  
  .lang-btn {
    padding: clamp(4px, 0.8vw, 6px) clamp(8px, 1.2vw, 12px);
    min-width: clamp(28px, 4vw, 36px);
  }
}

@media (max-width: 480px) {
  .language-selector {
    top: clamp(10px, 2vw, 15px);
    right: clamp(10px, 2vw, 15px);
  }
  
  .selector-container {
    gap: clamp(4px, 0.8vw, 8px);
  }
}
</style> 