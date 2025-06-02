<template>
  <div class="dialog-overlay">
    <div class="dialog-container pixel-border">
      <div class="dialog-header">
        <h2 class="dialog-title pixel-glow">⚡ 事件结果</h2>
      </div>
      
      <div class="dialog-content">
        <!-- 事件描述 -->
        <div class="event-description pixel-border">
          <h3 class="event-title">事件执行结果</h3>
          <div class="game-text" v-html="formattedGameText"></div>
        </div>

        <!-- 资源变化 -->
        <div v-if="eventResult.resource_changes && eventResult.resource_changes.length > 0" 
             class="resource-changes pixel-border">
          <h4 class="section-title">📊 属性变化</h4>
          <div class="changes-grid">
            <div 
              v-for="change in eventResult.resource_changes" 
              :key="change.resource_id"
              class="resource-change"
              :class="getChangeClass(change.change)"
            >
              <span class="resource-name">{{ change.resource_name }}</span>
              <span class="change-value">
                {{ formatChange(change.change) }}
              </span>
              <span class="new-value">→ {{ change.new_value }}</span>
            </div>
          </div>
        </div>

        <!-- 临时事件 -->
        <div v-if="eventResult.temporary_events && eventResult.temporary_events.length > 0"
             class="temporary-events pixel-border">
          <h4 class="section-title">🎲 触发事件</h4>
          <div class="temp-events-list">
            <div 
              v-for="tempEvent in eventResult.temporary_events"
              :key="tempEvent.event_name"
              class="temp-event"
            >
              <span class="temp-event-name">{{ tempEvent.event_name }}</span>
              <span class="temp-event-desc">{{ tempEvent.description }}</span>
            </div>
          </div>
        </div>

        <!-- 计划任务 -->
        <div v-if="eventResult.scheduled_tasks && eventResult.scheduled_tasks.length > 0"
             class="scheduled-tasks pixel-border">
          <h4 class="section-title">⏰ 计划任务</h4>
          <div class="tasks-list">
            <div 
              v-for="task in eventResult.scheduled_tasks"
              :key="task.task_name"
              class="scheduled-task"
            >
              <span class="task-name">{{ task.task_name }}</span>
              <span class="task-desc">{{ task.description }}</span>
            </div>
          </div>
        </div>

        <!-- 时间消耗 -->
        <div v-if="eventResult.time_cost > 0" class="time-cost pixel-border">
          <span class="cost-text">
            ⏱️ 时间消耗: {{ eventResult.time_cost * 0.5 }} 小时
          </span>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button 
          class="pixel-button primary"
          @click="handleContinue"
        >
          ✅ 继续
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EventResult } from '../types'

// Props
interface Props {
  eventResult: EventResult
}

const props = defineProps<Props>()

// Events
const emit = defineEmits<{
  'close': []
}>()

// 计算属性
const formattedGameText = computed(() => {
  if (!props.eventResult.game_text) return ''
  
  // 将换行符转换为HTML换行
  return props.eventResult.game_text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="highlight">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="emphasis">$1</em>')
})

// 方法
const handleContinue = () => {
  emit('close')
}

const getChangeClass = (change: number) => {
  if (change > 0) return 'positive'
  if (change < 0) return 'negative'
  return 'neutral'
}

const formatChange = (change: number) => {
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
  background: rgba(0, 0, 0, 0.85);
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
  max-height: 85vh;
  overflow-y: auto;
}

.dialog-header {
  text-align: center;
  margin-bottom: 20px;
}

.dialog-title {
  font-size: 16px;
  color: #00ffff;
  text-shadow: 2px 2px 0px #000, 0 0 10px #00ffff;
}

.dialog-content {
  margin-bottom: 25px;
}

.event-description {
  background: rgba(0, 40, 0, 0.8);
  padding: 20px;
  margin-bottom: 15px;
}

.event-title {
  font-size: 12px;
  color: #ffff00;
  text-shadow: 1px 1px 0px #000, 0 0 8px #ffff00;
  margin-bottom: 15px;
}

.game-text {
  font-size: 10px;
  color: #cccccc;
  line-height: 1.6;
  text-shadow: 1px 1px 0px #000;
}

.game-text :deep(.highlight) {
  color: #00ff00;
  text-shadow: 1px 1px 0px #000, 0 0 5px #00ff00;
}

.game-text :deep(.emphasis) {
  color: #ffff00;
  text-shadow: 1px 1px 0px #000;
}

.resource-changes,
.temporary-events,
.scheduled-tasks,
.time-cost {
  background: rgba(0, 30, 0, 0.8);
  padding: 15px;
  margin-bottom: 15px;
}

.section-title {
  font-size: 10px;
  color: #00ff00;
  text-shadow: 1px 1px 0px #000, 0 0 5px #00ff00;
  margin-bottom: 10px;
}

.changes-grid {
  display: grid;
  gap: 8px;
}

.resource-change {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.4);
  border-left: 3px solid #333;
}

.resource-change.positive {
  border-left-color: #00ff00;
}

.resource-change.negative {
  border-left-color: #ff6600;
}

.resource-change.neutral {
  border-left-color: #666;
}

.resource-name {
  font-size: 9px;
  color: #cccccc;
  text-shadow: 1px 1px 0px #000;
}

.change-value {
  font-size: 9px;
  font-weight: bold;
  text-shadow: 1px 1px 0px #000;
}

.resource-change.positive .change-value {
  color: #00ff00;
}

.resource-change.negative .change-value {
  color: #ff6600;
}

.new-value {
  font-size: 8px;
  color: #888;
  text-shadow: 1px 1px 0px #000;
}

.temp-events-list,
.tasks-list {
  display: grid;
  gap: 8px;
}

.temp-event,
.scheduled-task {
  padding: 10px;
  background: rgba(0, 0, 0, 0.4);
  border-left: 3px solid #ffff00;
}

.temp-event-name,
.task-name {
  display: block;
  font-size: 9px;
  color: #ffff00;
  text-shadow: 1px 1px 0px #000;
  margin-bottom: 4px;
}

.temp-event-desc,
.task-desc {
  font-size: 8px;
  color: #cccccc;
  text-shadow: 1px 1px 0px #000;
  line-height: 1.4;
}

.cost-text {
  font-size: 10px;
  color: #ff9900;
  text-shadow: 1px 1px 0px #000;
  display: block;
  text-align: center;
}

.dialog-actions {
  display: flex;
  justify-content: center;
}

.pixel-button {
  padding: 12px 20px;
  font-size: 10px;
  min-width: 120px;
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
    padding: 20px;
    width: 95%;
  }
  
  .changes-grid {
    grid-template-columns: 1fr;
  }
  
  .resource-change {
    grid-template-columns: 1fr auto;
    gap: 5px;
  }
  
  .new-value {
    grid-column: 1 / -1;
    text-align: right;
    margin-top: 4px;
  }
}
</style> 