<template>
  <div class="dialog-overlay">
    <div class="dialog-container pixel-border">
      <div class="dialog-header">
        <h2 class="dialog-title pixel-glow">🎒 物品栏</h2>
      </div>
      
      <div class="dialog-content">
        <div v-if="inventory && inventory.length > 0" class="inventory-grid">
          <div 
            v-for="item in inventory" 
            :key="item.slot"
            class="inventory-slot pixel-border"
            :class="{ 'has-item': item.item_id > 0 }"
            @click="handleItemClick(item)"
          >
            <div v-if="item.item_id > 0" class="item-content">
              <div class="item-icon">{{ getItemIcon(item.item_name) }}</div>
              <div class="item-name">{{ item.item_name }}</div>
              <div class="item-quantity" v-if="item.quantity > 1">×{{ item.quantity }}</div>
            </div>
            <div v-else class="empty-slot">
              <span class="slot-number">{{ item.slot }}</span>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-inventory">
          <p class="empty-text">🎒 物品栏是空的</p>
          <p class="empty-hint">通过购买或事件获得物品</p>
        </div>
        
        <!-- 物品详情显示 -->
        <div v-if="selectedItem" class="item-details pixel-border">
          <h3 class="item-detail-name">{{ selectedItem.item_name }}</h3>
          <p class="item-description" v-if="selectedItem.description">{{ selectedItem.description }}</p>
          <div class="item-actions">
            <button 
              class="pixel-button primary"
              @click="useItem(selectedItem)"
            >
              ✨ 使用物品
            </button>
          </div>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button 
          class="pixel-button"
          @click="handleClose"
        >
          ❌ 关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Inventory } from '../types'

// Props
interface Props {
  inventory: Inventory[]
}

const props = defineProps<Props>()

// Events
const emit = defineEmits<{
  'use-item': [itemSlot: number]
  'close': []
}>()

// 响应式数据
const selectedItem = ref<Inventory | null>(null)

// 方法
const handleClose = () => {
  emit('close')
}

const handleItemClick = (item: Inventory) => {
  if (item.item_id > 0) {
    selectedItem.value = selectedItem.value?.slot === item.slot ? null : item
  }
}

const useItem = (item: Inventory) => {
  emit('use-item', item.slot)
  selectedItem.value = null
}

const getItemIcon = (itemName: string): string => {
  const itemIcons: Record<string, string> = {
    '技术书籍': '📚',
    '哲学书籍': '📖',
    '咖啡': '☕',
    '维生素': '💊',
    '按摩设备': '🛋️',
    '运动器材': '🏋️',
    '生活用品': '🛍️',
    '工作用品': '💼',
    '食物': '🍱',
    '饮料': '🥤',
    '药品': '💉',
    '工具': '🔧',
    '装备': '⚙️'
  }
  
  // 根据物品名称关键词匹配图标
  for (const [key, icon] of Object.entries(itemIcons)) {
    if (itemName.includes(key)) {
      return icon
    }
  }
  
  return '📦' // 默认图标
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
  max-width: 700px;
  width: 90%;
  max-height: 85vh;
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

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: clamp(8px, 1.2vw, 14px);
  margin-bottom: clamp(16px, 2vw, 24px);
}

.inventory-slot {
  aspect-ratio: 1;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #003300;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: clamp(60px, 10vw, 100px);
}

.inventory-slot.has-item {
  border-color: #006600;
  background: rgba(0, 40, 0, 0.8);
}

.inventory-slot.has-item:hover {
  border-color: #00ff00;
  box-shadow: 0 0 10px #00ff00;
  transform: scale(1.05);
}

.inventory-slot:not(.has-item):hover {
  border-color: #004400;
}

.item-content {
  text-align: center;
  padding: clamp(4px, 0.8vw, 8px);
}

.item-icon {
  font-size: clamp(18px, 3vw, 32px);
  margin-bottom: clamp(3px, 0.5vw, 6px);
  filter: drop-shadow(1px 1px 0px #000);
}

.item-name {
  font-size: var(--tiny-font-size);
  color: #cccccc;
  text-shadow: 1px 1px 0px #000;
  line-height: 1.2;
  word-break: break-all;
}

.item-quantity {
  font-size: var(--tiny-font-size);
  color: #ffff00;
  text-shadow: 1px 1px 0px #000;
  margin-top: clamp(2px, 0.3vw, 4px);
}

.empty-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  opacity: 0.3;
}

.slot-number {
  font-size: var(--ui-font-size);
  color: #666;
}

.empty-inventory {
  text-align: center;
  padding: clamp(32px, 5vw, 48px) clamp(16px, 2.5vw, 24px);
  background: rgba(0, 0, 0, 0.3);
  border: 2px dashed #003300;
}

.empty-text {
  font-size: var(--base-font-size);
  color: #cccccc;
  margin-bottom: clamp(8px, 1vw, 12px);
  text-shadow: 1px 1px 0px #000;
}

.empty-hint {
  font-size: var(--ui-font-size);
  color: #888;
  text-shadow: 1px 1px 0px #000;
}

.item-details {
  background: rgba(0, 40, 0, 0.9);
  padding: clamp(12px, 1.8vw, 20px);
  margin-top: clamp(16px, 2vw, 24px);
}

.item-detail-name {
  font-size: var(--ui-font-size);
  color: #00ffff;
  text-shadow: 1px 1px 0px #000, 0 0 8px #00ffff;
  margin-bottom: clamp(8px, 1vw, 12px);
}

.item-description {
  font-size: var(--ui-font-size);
  color: #cccccc;
  margin-bottom: clamp(12px, 1.5vw, 18px);
  line-height: 1.4;
  text-shadow: 1px 1px 0px #000;
}

.item-actions {
  display: flex;
  justify-content: center;
}

.dialog-actions {
  display: flex;
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
  
  .inventory-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: clamp(6px, 1vw, 10px);
  }
  
  .inventory-slot {
    min-height: clamp(50px, 8vw, 80px);
  }
  
  .item-icon {
    font-size: clamp(16px, 2.5vw, 24px);
  }
}

@media (max-width: 480px) {
  .inventory-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style> 