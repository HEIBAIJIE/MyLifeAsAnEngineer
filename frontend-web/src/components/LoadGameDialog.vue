<template>
  <div class="dialog-overlay">
    <div class="dialog-container pixel-border">
      <div class="dialog-header">
        <h2 class="dialog-title pixel-glow">{{ t('loadTitle') }}</h2>
      </div>
      
      <div class="dialog-content">
        <p class="dialog-text">{{ t('enterSaveData') }}</p>
        
        <textarea 
          v-model="saveDataInput"
          class="save-input pixel-border"
          :placeholder="t('saveDataHint')"
          rows="6"
        ></textarea>
        
        <div class="dialog-tip">
          <span class="pixel-text-small">
            {{ t('saveDataTip') }}
          </span>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button 
          class="pixel-button primary"
          @click="handleLoad"
          :disabled="!saveDataInput.trim()"
        >
          📥 {{ t('load') }}
        </button>
        <button 
          class="pixel-button"
          @click="handleCancel"
        >
          ❌ {{ t('cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../utils/i18n'

// Props
interface Props {
  currentLanguage: string
}

const props = defineProps<Props>()

// 多语言支持
const { t } = useI18n(props.currentLanguage)

// Events
const emit = defineEmits<{
  'load': [saveData: string]
  'cancel': []
}>()

// 响应式数据
const saveDataInput = ref('')

// 方法
const handleLoad = () => {
  const saveData = saveDataInput.value.trim()
  if (saveData) {
    emit('load', saveData)
  }
}

const handleCancel = () => {
  emit('cancel')
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
  max-width: 500px;
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

.save-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #004400;
  color: #00ff00;
  font-family: 'Press Start 2P', monospace;
  font-size: var(--small-font-size);
  padding: clamp(10px, 1.5vw, 16px);
  resize: vertical;
  min-height: clamp(100px, 15vw, 140px);
}

.save-input:focus {
  outline: none;
  border-color: #00ff00;
  box-shadow: 0 0 10px #00ff00;
}

.save-input::placeholder {
  color: #666;
  opacity: 0.8;
}

.dialog-tip {
  margin-top: clamp(8px, 1vw, 12px);
  padding: clamp(8px, 1.2vw, 12px);
  background: rgba(0, 40, 0, 0.5);
  border-left: 3px solid #00ff00;
}

.dialog-actions {
  display: flex;
  gap: clamp(12px, 2vw, 18px);
  justify-content: center;
}

.pixel-button {
  padding: clamp(10px, 1.5vw, 16px) clamp(16px, 2.5vw, 24px);
  font-size: var(--button-font-size);
  min-width: clamp(100px, 15vw, 140px);
}

.pixel-button.primary {
  background: rgba(0, 100, 0, 0.8);
  border-color: #00ff00;
  color: #00ff00;
}

.pixel-button.primary:hover:not(:disabled) {
  background: rgba(0, 120, 0, 0.9);
  box-shadow: 0 4px 0 #004400, 0 0 15px #00ff00;
  transform: translateY(-2px);
}

.pixel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dialog-container {
    padding: clamp(16px, 3vw, 24px);
    width: 95%;
  }
  
  .dialog-actions {
    flex-direction: column;
  }
  
  .pixel-button {
    width: 100%;
  }
}
</style> 