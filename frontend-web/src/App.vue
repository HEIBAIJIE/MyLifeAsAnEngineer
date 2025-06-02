<template>
  <div id="app" class="pixel-app">
    <!-- 主标题页面 -->
    <TitleView 
      v-if="currentView === 'title'" 
      @new-game="handleNewGame"
      @load-game="handleLoadGame"
      @exit-game="handleExitGame"
    />
    
    <!-- 大地图页面 -->
    <WorldMapView 
      v-if="currentView === 'worldmap'" 
      :current-location="currentLocation"
      :game-state="gameState"
      @travel-to="handleTravelTo"
      @go-to-scene="goToScene"
      @go-to-title="goToTitle"
    />
    
    <!-- 场景页面 -->
    <SceneView 
      v-if="currentView === 'scene'" 
      :game-state="gameState"
      :current-location="currentLocation"
      :available-entities="availableEntities"
      @save-game="handleSaveGame"
      @load-game="showLoadDialog"
      @show-inventory="handleShowInventory"
      @go-to-worldmap="goToWorldMap"
      @go-to-title="goToTitle"
      @execute-event="handleExecuteEvent"
    />
    
    <!-- 结局页面 -->
    <EndingView 
      v-if="currentView === 'ending'" 
      :ending-data="endingData"
      @restart-game="handleNewGame"
      @go-to-title="goToTitle"
    />
    
    <!-- 全局对话框 -->
    <LoadGameDialog 
      v-if="showLoadGameDialog" 
      @load="confirmLoadGame"
      @cancel="showLoadGameDialog = false"
    />
    
    <SaveGameDialog 
      v-if="showSaveGameDialog" 
      :save-data="saveData"
      @close="showSaveGameDialog = false"
    />
    
    <InventoryDialog 
      v-if="showInventoryDialog" 
      :inventory="inventory"
      @use-item="handleUseItem"
      @close="showInventoryDialog = false"
    />
    
    <EventResultDialog 
      v-if="showEventResultDialog" 
      :event-result="eventResult"
      @close="closeEventResult"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TitleView from './views/TitleView.vue'
import WorldMapView from './views/WorldMapView.vue'
import SceneView from './views/SceneView.vue'
import EndingView from './views/EndingView.vue'
import LoadGameDialog from './components/LoadGameDialog.vue'
import SaveGameDialog from './components/SaveGameDialog.vue'
import InventoryDialog from './components/InventoryDialog.vue'
import EventResultDialog from './components/EventResultDialog.vue'
import { BackendAdapter } from './services/BackendAdapter'
import type { GameState, Location, Entity, EventResult, Inventory, EndingData } from './types'

// 导入样式
import './styles/pixel-ui.css'

// 游戏状态
const currentView = ref<'title' | 'worldmap' | 'scene' | 'ending'>('title')
const gameState = ref<GameState | null>(null)
const currentLocation = ref<Location | null>(null)
const availableEntities = ref<Entity[]>([])
const inventory = ref<Inventory[]>([])
const endingData = ref<EndingData | null>(null)

// 对话框状态
const showLoadGameDialog = ref(false)
const showSaveGameDialog = ref(false)
const showInventoryDialog = ref(false)
const showEventResultDialog = ref(false)
const saveData = ref('')
const eventResult = ref<EventResult | null>(null)
const pendingEvents = ref<EventResult[]>([])

// 后端适配器
const backend = new BackendAdapter()

// 生命周期
onMounted(async () => {
  await backend.initialize()
})

// 视图切换
const goToTitle = () => { currentView.value = 'title' }
const goToWorldMap = () => { currentView.value = 'worldmap' }
const goToScene = () => { currentView.value = 'scene' }
const goToEnding = () => { currentView.value = 'ending' }

// 游戏操作
const handleNewGame = async () => {
  try {
    await backend.resetGame()
    await updateGameState()
    currentView.value = 'scene'
  } catch (error) {
    console.error('Failed to start new game:', error)
    alert('启动游戏失败')
  }
}

const handleLoadGame = () => {
  showLoadGameDialog.value = true
}

const confirmLoadGame = async (saveDataStr: string) => {
  try {
    const response = await backend.loadGame(saveDataStr)
    if (response.success) {
      await updateGameState()
      showLoadGameDialog.value = false
      currentView.value = 'scene'
      alert('读档成功！')
    } else {
      alert('读档失败：' + response.error)
    }
  } catch (error) {
    console.error('Load game error:', error)
    alert('读档失败')
  }
}

const handleSaveGame = async () => {
  try {
    const response = await backend.saveGame()
    if (response.success) {
      saveData.value = response.saveData
      showSaveGameDialog.value = true
    } else {
      alert('保存失败：' + response.error)
    }
  } catch (error) {
    console.error('Save game error:', error)
    alert('保存失败')
  }
}

const handleExitGame = () => {
  if (confirm('确定要退出游戏吗？')) {
    window.close()
  }
}

const handleTravelTo = async (locationId: number) => {
  try {
    // 这里需要根据实际的后端接口来实现位置切换
    // 暂时先更新游戏状态
    await updateGameState()
    currentView.value = 'scene'
  } catch (error) {
    console.error('Travel error:', error)
  }
}

const handleShowInventory = async () => {
  try {
    inventory.value = await backend.getInventory()
    showInventoryDialog.value = true
  } catch (error) {
    console.error('Failed to get inventory:', error)
  }
}

const handleUseItem = async (itemSlot: number) => {
  try {
    const result = await backend.useItem(itemSlot)
    if (result.success) {
      showEventResult(result)
      await updateGameState()
      inventory.value = await backend.getInventory()
    } else {
      alert('使用物品失败：' + result.error)
    }
  } catch (error) {
    console.error('Use item error:', error)
  }
}

const handleExecuteEvent = async (eventId: number) => {
  try {
    const result = await backend.executeEvent(eventId)
    if (result.success) {
      showEventResult(result)
      await updateGameState()
      
      // 检查游戏是否结束
      if (gameState.value?.game_over) {
        endingData.value = gameState.value.ending_data
        currentView.value = 'ending'
      }
    } else {
      alert('执行事件失败：' + result.error)
    }
  } catch (error) {
    console.error('Execute event error:', error)
  }
}

const showEventResult = (result: EventResult) => {
  pendingEvents.value.push(result)
  processNextEvent()
}

const processNextEvent = () => {
  if (pendingEvents.value.length > 0) {
    eventResult.value = pendingEvents.value.shift()!
    showEventResultDialog.value = true
  }
}

const closeEventResult = () => {
  showEventResultDialog.value = false
  eventResult.value = null
  
  // 处理下一个事件
  setTimeout(() => {
    processNextEvent()
  }, 300)
}

const updateGameState = async () => {
  try {
    gameState.value = await backend.getGameState()
    currentLocation.value = await backend.getCurrentLocation()
    availableEntities.value = await backend.getAvailableEntities()
  } catch (error) {
    console.error('Failed to update game state:', error)
  }
}

const showLoadDialog = () => {
  showLoadGameDialog.value = true
}
</script>

<style scoped>
.pixel-app {
  width: 100vw;
  height: 100vh;
  font-family: 'Press Start 2P', monospace;
  background: #000;
  color: #00ff00;
  overflow: hidden;
}
</style> 