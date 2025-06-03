<template>
  <div class="dialog-overlay">
    <div class="dialog-container pixel-border">
      <div class="dialog-header">
        <div class="terminal-line">
          <span class="terminal-bracket">[</span>
          <span class="dialog-title pixel-glow chinese-pixel">{{ t('eventResult') }}</span>
          <span class="terminal-bracket">]</span>
        </div>
        <div class="scan-line"></div>
      </div>
      
      <div class="dialog-content">
        <!-- 事件描述 -->
        <div class="event-description pixel-border">
          <div class="section-header">
            <span class="section-icon">&gt;</span>
            <h3 class="event-title chinese-pixel">{{ t('eventDetails') }}</h3>
            <div class="processing-indicator">
              <span class="processing-dot"></span>
              <span class="processing-dot"></span>
              <span class="processing-dot"></span>
            </div>
          </div>
          <div class="game-text chinese-pixel" v-html="formattedGameText"></div>
        </div>

        <!-- 资源变化 -->
        <div v-if="eventResult.resource_changes && eventResult.resource_changes.length > 0" 
             class="resource-changes pixel-border">
          <div class="section-header">
            <span class="section-icon">&gt;</span>
            <h4 class="section-title chinese-pixel">{{ t('resourceChanges') }}</h4>
            <div class="data-stream-indicator"></div>
          </div>
          <div class="changes-grid">
            <div 
              v-for="resourceChange in eventResult.resource_changes" 
              :key="resourceChange.resource_id"
              class="resource-change pixel-border"
              :class="getChangeClass(resourceChange.change)"
            >
              <span class="resource-name chinese-pixel">{{ resourceChange.resource_name }}</span>
              <div class="change-display">
                <span class="change-value">
                  {{ formatChange(resourceChange.change) }}
                </span>
                <span class="arrow">→</span>
                <span class="new-value">{{ resourceChange.new_value }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 临时事件 -->
        <div v-if="eventResult.temporary_events && eventResult.temporary_events.length > 0"
             class="temporary-events pixel-border">
          <div class="section-header">
            <span class="section-icon">&gt;</span>
            <h4 class="section-title chinese-pixel">{{ t('temporaryEvents') }}</h4>
            <div class="pulse-indicator"></div>
          </div>
          <div class="temp-events-list">
            <div 
              v-for="tempEvent in eventResult.temporary_events"
              :key="tempEvent.event_name"
              class="temp-event pixel-border"
            >
              <span class="temp-event-name chinese-pixel">{{ tempEvent.event_name }}</span>
              <span class="temp-event-desc chinese-pixel">{{ tempEvent.description }}</span>
            </div>
          </div>
        </div>

        <!-- 计划任务 -->
        <div v-if="eventResult.scheduled_tasks && eventResult.scheduled_tasks.length > 0"
             class="scheduled-tasks pixel-border">
          <div class="section-header">
            <span class="section-icon">&gt;</span>
            <h4 class="section-title chinese-pixel">{{ t('scheduledTasks') }}</h4>
            <div class="task-indicator"></div>
          </div>
          <div class="tasks-list">
            <div 
              v-for="task in eventResult.scheduled_tasks"
              :key="task.task_name"
              class="scheduled-task pixel-border"
            >
              <span class="task-name chinese-pixel">{{ task.task_name }}</span>
              <span class="task-desc chinese-pixel">{{ task.description }}</span>
            </div>
          </div>
        </div>

        <!-- 时间消耗 -->
        <div v-if="eventResult.time_cost && eventResult.time_cost > 0" class="time-cost pixel-border">
          <div class="cost-display">
            <span class="cost-icon">&gt;</span>
            <span class="cost-text chinese-pixel">
              {{ t('timeCost') }}: {{ (eventResult.time_cost || 0) * 0.5 }} {{ t('hours') }}
            </span>
            <div class="time-bar">
              <div class="time-fill"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button 
          class="pixel-button primary action-btn"
          @click="handleContinue"
        >
          <span class="btn-bracket">[</span>
          <span class="chinese-pixel">{{ t('continueBtn') }}</span>
          <span class="btn-bracket">]</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../utils/i18n'
import type { EventResult } from '../types'

// Props
interface Props {
  eventResult: EventResult
  currentLanguage: string
}

const props = defineProps<Props>()

// 多语言支持
const { t } = useI18n(props.currentLanguage)

// Events
const emit = defineEmits<{
  'close': []
}>()

// 计算属性
const formattedGameText = computed(() => {
  if (!props.eventResult.game_text) return ''
  
  // 将换行符转换为HTML换行，并添加终端风格的格式化
  return props.eventResult.game_text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>')
    .replace(/\*(.*?)\*/g, '<span class="emphasis">$1</span>')
    .replace(/^(.+)$/gm, '<span class="terminal-line-text">$1</span>')
})

// 方法
const handleContinue = () => {
  emit('close')
}

const getChangeClass = (change: number | null | undefined) => {
  if (change == null) return 'neutral'
  if (change > 0) return 'positive'
  if (change < 0) return 'negative'
  return 'neutral'
}

const formatChange = (change: number | null | undefined) => {
  if (change == null) return '0'
  if (change > 0) return `+${change}`
  return change.toString()
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.dialog-container {
  background: var(--panel-black);
  padding: clamp(24px, 3vw, 40px);
  max-width: 650px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
}

.dialog-header {
  text-align: center;
  margin-bottom: clamp(20px, 2.5vw, 30px);
  position: relative;
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

.dialog-title {
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

.dialog-content {
  margin-bottom: clamp(20px, 2.5vw, 30px);
}

/* 通用节标头 */
.section-header {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1vw, 12px);
  margin-bottom: clamp(12px, 1.5vw, 18px);
  position: relative;
}

.section-icon {
  color: var(--terminal-green);
  font-family: 'Press Start 2P', monospace;
  font-size: var(--ui-font-size);
  text-shadow: 0 0 calc(var(--glow-size) / 2) currentColor;
}

.section-title {
  font-size: var(--ui-font-size);
  color: var(--matrix-green);
  text-shadow: 
    1px 1px 0px var(--background-black),
    0 0 calc(var(--glow-size) / 2) currentColor;
}

/* 处理指示器 */
.processing-indicator {
  margin-left: auto;
  display: flex;
  gap: clamp(3px, 0.5vw, 6px);
}

.processing-dot {
  width: clamp(4px, 0.6vw, 8px);
  height: clamp(4px, 0.6vw, 8px);
  background: var(--terminal-green);
  animation: processing-pulse 1.5s ease-in-out infinite;
}

.processing-dot:nth-child(2) { animation-delay: 0.3s; }
.processing-dot:nth-child(3) { animation-delay: 0.6s; }

@keyframes processing-pulse {
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
}

.data-stream-indicator {
  margin-left: auto;
  width: clamp(30px, 4vw, 50px);
  height: clamp(6px, 0.8vw, 10px);
  background: linear-gradient(
    90deg,
    transparent,
    var(--matrix-green),
    transparent
  );
  animation: data-stream 2s linear infinite;
}

@keyframes data-stream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.pulse-indicator {
  margin-left: auto;
  width: clamp(12px, 1.5vw, 20px);
  height: clamp(12px, 1.5vw, 20px);
  background: var(--terminal-green);
  animation: pulse-glow 1s ease-in-out infinite alternate;
}

@keyframes pulse-glow {
  0% { opacity: 0.5; box-shadow: 0 0 calc(var(--glow-size) / 2) var(--terminal-green); }
  100% { opacity: 1; box-shadow: 0 0 var(--glow-size) var(--terminal-green); }
}

.task-indicator {
  margin-left: auto;
  width: clamp(20px, 2.5vw, 35px);
  height: clamp(8px, 1vw, 14px);
  background: repeating-linear-gradient(
    90deg,
    var(--warning-orange),
    var(--warning-orange) 2px,
    transparent 2px,
    transparent 4px
  );
  animation: task-blink 2s linear infinite;
}

@keyframes task-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

/* 事件描述 */
.event-description {
  background: rgba(0, 30, 0, 0.8);
  padding: clamp(16px, 2vw, 24px);
  margin-bottom: clamp(15px, 2vw, 22px);
}

.event-title {
  font-size: var(--ui-font-size);
  color: var(--neon-yellow);
  text-shadow: 
    1px 1px 0px var(--background-black), 
    0 0 calc(var(--glow-size) / 2) currentColor;
}

.game-text {
  font-size: var(--base-font-size);
  color: var(--matrix-light-green);
  line-height: 1.7;
  text-shadow: 
    1px 1px 0px var(--background-black),
    0 0 calc(var(--glow-size) / 4) currentColor;
}

.game-text :deep(.highlight) {
  color: var(--terminal-green);
  text-shadow: 
    1px 1px 0px var(--background-black), 
    0 0 calc(var(--glow-size) / 2) currentColor;
  font-weight: bold;
}

.game-text :deep(.emphasis) {
  color: var(--neon-yellow);
  text-shadow: 
    1px 1px 0px var(--background-black),
    0 0 calc(var(--glow-size) / 4) currentColor;
}

.game-text :deep(.terminal-line-text) {
  display: block;
  margin: clamp(4px, 0.6vw, 8px) 0;
}

/* 资源变化 */
.resource-changes,
.temporary-events,
.scheduled-tasks,
.time-cost {
  background: rgba(0, 20, 0, 0.8);
  padding: clamp(14px, 1.8vw, 22px);
  margin-bottom: clamp(15px, 2vw, 22px);
}

.changes-grid {
  display: grid;
  gap: clamp(8px, 1vw, 12px);
}

.resource-change {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: clamp(8px, 1.2vw, 15px);
  align-items: center;
  padding: clamp(8px, 1vw, 12px);
  background: rgba(0, 0, 0, 0.5);
  position: relative;
}

.resource-change::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: clamp(2px, 0.3vw, 4px);
  background: var(--border-green);
}

.resource-change.positive::before {
  background: var(--terminal-green);
  box-shadow: 0 0 calc(var(--glow-size) / 2) var(--terminal-green);
}

.resource-change.negative::before {
  background: var(--error-red);
  box-shadow: 0 0 calc(var(--glow-size) / 2) var(--error-red);
}

.resource-change.neutral::before {
  background: var(--matrix-dark-green);
}

.resource-name {
  font-size: var(--ui-font-size);
  color: var(--matrix-light-green);
  text-shadow: 
    1px 1px 0px var(--background-black),
    0 0 calc(var(--glow-size) / 4) currentColor;
}

.change-display {
  display: flex;
  align-items: center;
  gap: clamp(6px, 0.8vw, 10px);
  font-family: 'Source Code Pro', monospace;
}

.change-value {
  font-size: var(--ui-font-size);
  font-weight: bold;
  text-shadow: 
    1px 1px 0px var(--background-black),
    0 0 calc(var(--glow-size) / 2) currentColor;
}

.resource-change.positive .change-value {
  color: var(--terminal-green);
}

.resource-change.negative .change-value {
  color: var(--error-red);
}

.resource-change.neutral .change-value {
  color: var(--matrix-dark-green);
}

.arrow {
  color: var(--matrix-dark-green);
  font-size: var(--small-font-size);
}

.new-value {
  font-size: var(--small-font-size);
  color: var(--matrix-green);
  text-shadow: 0 0 calc(var(--glow-size) / 4) currentColor;
}

/* 临时事件和计划任务 */
.temp-events-list,
.tasks-list {
  display: grid;
  gap: clamp(8px, 1vw, 12px);
}

.temp-event,
.scheduled-task {
  padding: clamp(10px, 1.2vw, 16px);
  background: rgba(0, 0, 0, 0.5);
  position: relative;
}

.temp-event::before,
.scheduled-task::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: clamp(2px, 0.3vw, 4px);
  background: var(--neon-yellow);
  box-shadow: 0 0 calc(var(--glow-size) / 2) var(--neon-yellow);
}

.temp-event-name,
.task-name {
  display: block;
  font-size: var(--ui-font-size);
  color: var(--neon-yellow);
  text-shadow: 
    1px 1px 0px var(--background-black),
    0 0 calc(var(--glow-size) / 2) currentColor;
  margin-bottom: clamp(4px, 0.6vw, 8px);
}

.temp-event-desc,
.task-desc {
  font-size: var(--small-font-size);
  color: var(--matrix-light-green);
  text-shadow: 
    1px 1px 0px var(--background-black),
    0 0 calc(var(--glow-size) / 4) currentColor;
  line-height: 1.5;
}

/* 时间消耗 */
.cost-display {
  display: flex;
  align-items: center;
  gap: clamp(10px, 1.2vw, 16px);
}

.cost-icon {
  color: var(--warning-orange);
  font-family: 'Press Start 2P', monospace;
  font-size: var(--ui-font-size);
  text-shadow: 0 0 calc(var(--glow-size) / 2) currentColor;
}

.cost-text {
  font-size: var(--ui-font-size);
  color: var(--warning-orange);
  text-shadow: 
    1px 1px 0px var(--background-black),
    0 0 calc(var(--glow-size) / 2) currentColor;
}

.time-bar {
  flex: 1;
  height: clamp(6px, 0.8vw, 10px);
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--border-green);
  position: relative;
  overflow: hidden;
}

.time-fill {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--warning-orange),
    var(--neon-yellow),
    var(--warning-orange)
  );
  animation: time-pulse 2s linear infinite;
}

@keyframes time-pulse {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* 操作按钮 */
.dialog-actions {
  display: flex;
  justify-content: center;
}

.action-btn {
  padding: clamp(12px, 1.5vw, 18px) clamp(20px, 2.5vw, 32px);
  font-size: var(--button-font-size);
  min-width: clamp(140px, 20vw, 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(6px, 0.8vw, 10px);
}

.btn-bracket {
  color: var(--matrix-dark-green);
  font-family: 'Press Start 2P', monospace;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.action-btn:hover .btn-bracket {
  color: var(--terminal-green);
  opacity: 1;
  animation: bracket-pulse 0.5s ease infinite alternate;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dialog-container {
    padding: clamp(16px, 2.5vw, 24px);
    width: 95%;
  }
  
  .changes-grid {
    grid-template-columns: 1fr;
  }
  
  .resource-change {
    grid-template-columns: 1fr;
    gap: clamp(4px, 0.8vw, 8px);
  }
  
  .change-display {
    justify-content: flex-end;
  }
  
  .cost-display {
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(6px, 1vw, 10px);
  }
  
  .time-bar {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .terminal-line {
    flex-direction: column;
    gap: clamp(4px, 0.8vw, 8px);
  }
  
  .section-header {
    flex-wrap: wrap;
    gap: clamp(4px, 0.8vw, 8px);
  }
  
  .processing-indicator,
  .data-stream-indicator,
  .pulse-indicator,
  .task-indicator {
    order: -1;
  }
}
</style> 