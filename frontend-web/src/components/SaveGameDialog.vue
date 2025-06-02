<template>
  <div class="dialog-overlay">
    <div class="dialog-container pixel-border">
      <div class="dialog-header">
        <h2 class="dialog-title pixel-glow">💾 保存存档</h2>
      </div>
      
      <div class="dialog-content">
        <p class="dialog-text">游戏已成功保存！请复制以下存档代码:</p>
        
        <div class="save-data-container">
          <textarea 
            :value="saveData"
            readonly
            class="save-display pixel-border"
            rows="8"
            @click="selectAll"
          ></textarea>
          
          <button 
            class="copy-button pixel-button"
            @click="copyToClipboard"
          >
            📋 复制代码
          </button>
        </div>
        
        <div class="dialog-tip">
          <span class="pixel-text-small">
            💡 提示: 请妥善保存此代码，用于下次读取游戏进度
          </span>
        </div>
        
        <div class="copy-status" v-if="copySuccess">
          <span class="success-text pixel-glow">✅ 已复制到剪贴板！</span>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button 
          class="pixel-button primary"
          @click="handleClose"
        >
          ✅ 确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

// Props
interface Props {
  saveData: string
}

const props = defineProps<Props>()

// Events
const emit = defineEmits<{
  'close': []
}>()

// 响应式数据
const copySuccess = ref(false)

// 方法
const handleClose = () => {
  emit('close')
}

const selectAll = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  textarea.select()
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.saveData)
    copySuccess.value = true
    
    // 3秒后隐藏成功提示
    setTimeout(() => {
      copySuccess.value = false
    }, 3000)
  } catch (error) {
    console.error('复制失败:', error)
    // 降级方案：选中文本
    const textarea = document.querySelector('.save-display') as HTMLTextAreaElement
    if (textarea) {
      textarea.select()
      try {
        document.execCommand('copy')
        copySuccess.value = true
        setTimeout(() => {
          copySuccess.value = false
        }, 3000)
      } catch (err) {
        console.error('降级复制也失败:', err)
      }
    }
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog-container {
  background: rgba(0, 20, 0, 0.95);
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-header {
  text-align: center;
  margin-bottom: 20px;
}

.dialog-title {
  font-size: var(--subtitle-font-size);
  color: #00ffff;
  text-shadow: 2px 2px 0px #000, 0 0 10px #00ffff;
}

.dialog-content {
  margin-bottom: clamp(20px, 2vw, 30px);
}

.dialog-text {
  font-size: var(--ui-font-size);
  color: #cccccc;
  margin-bottom: clamp(12px, 1.5vw, 18px);
  text-shadow: 1px 1px 0px #000;
}

.save-data-container {
  position: relative;
}

.save-display {
  width: 100%;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #004400;
  color: #00ff00;
  font-family: 'Press Start 2P', monospace;
  font-size: var(--small-font-size);
  padding: clamp(10px, 1.5vw, 16px);
  resize: vertical;
  min-height: clamp(120px, 18vw, 180px);
  cursor: pointer;
}

.save-display:focus {
  outline: none;
  border-color: #00ff00;
  box-shadow: 0 0 10px #00ff00;
}

.copy-button {
  margin-top: clamp(8px, 1vw, 12px);
  width: 100%;
  padding: clamp(10px, 1.5vw, 16px);
  font-size: var(--button-font-size);
  background: rgba(0, 80, 0, 0.8);
  border-color: #00aa00;
  color: #00ff00;
}

.copy-button:hover {
  background: rgba(0, 100, 0, 0.9);
  box-shadow: 0 4px 0 #004400, 0 0 15px #00ff00;
  transform: translateY(-2px);
}

.dialog-tip {
  margin-top: clamp(12px, 1.5vw, 18px);
  padding: clamp(8px, 1.2vw, 12px);
  background: rgba(0, 40, 0, 0.5);
  border-left: 3px solid #00ff00;
}

.copy-status {
  margin-top: clamp(8px, 1vw, 12px);
  text-align: center;
}

.success-text {
  color: #00ff00;
  font-size: var(--ui-font-size);
  text-shadow: 1px 1px 0px #000, 0 0 8px #00ff00;
}

.dialog-actions {
  display: flex;
  justify-content: center;
}

.pixel-button {
  padding: clamp(10px, 1.5vw, 16px) clamp(16px, 2.5vw, 24px);
  font-size: var(--button-font-size);
  min-width: clamp(120px, 20vw, 180px);
}

.pixel-button.primary {
  background: rgba(0, 100, 0, 0.8);
  border-color: #00ff00;
  color: #00ff00;
}

.pixel-button.primary:hover {
  background: rgba(0, 120, 0, 0.9);
  box-shadow: 0 4px 0 #004400, 0 0 15px #00ff00;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dialog-container {
    padding: clamp(16px, 3vw, 24px);
    width: 95%;
  }
  
  .save-display {
    font-size: var(--tiny-font-size);
  }
}
</style> 