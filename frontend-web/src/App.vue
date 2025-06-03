<template>
  <div id="app" class="pixel-app">
    <!-- 语言选择器 -->
    <LanguageSelector 
      :current-language="currentLanguage"
      @language-change="handleLanguageChange"
    />
    
    <!-- 主标题页面 -->
    <TitleView 
      v-if="currentView === 'title'" 
      :current-language="currentLanguage"
      @new-game="handleNewGame"
      @load-game="handleLoadGame"
      @exit-game="handleExitGame"
    />
    
    <!-- 大地图页面 -->
    <WorldMapView 
      v-if="currentView === 'worldmap'" 
      :current-location="currentLocation"
      :game-state="gameState"
      :current-language="currentLanguage"
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
      :current-language="currentLanguage"
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
      :current-language="currentLanguage"
      @restart-game="handleNewGame"
      @go-to-title="goToTitle"
    />
    
    <!-- 加载对话框 -->
    <LoadingDialog 
      v-if="showLoadingDialog" 
      :visible="showLoadingDialog"
      :progress="loadingProgress"
      :current-step="loadingStep"
      :current-language="currentLanguage"
    />
    
    <!-- 全局对话框 -->
    <LoadGameDialog 
      v-if="showLoadGameDialog" 
      :current-language="currentLanguage"
      @load="confirmLoadGame"
      @cancel="showLoadGameDialog = false"
    />
    
    <SaveGameDialog 
      v-if="showSaveGameDialog" 
      :save-data="saveData"
      :current-language="currentLanguage"
      @close="showSaveGameDialog = false"
    />
    
    <InventoryDialog 
      v-if="showInventoryDialog" 
      :inventory="inventory"
      :current-language="currentLanguage"
      @use-item="handleUseItem"
      @close="showInventoryDialog = false"
    />
    
    <EventResultDialog 
      v-if="showEventResultDialog && eventResult" 
      :event-result="eventResult"
      :current-language="currentLanguage"
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
import LoadingDialog from './components/LoadingDialog.vue'
import LoadGameDialog from './components/LoadGameDialog.vue'
import SaveGameDialog from './components/SaveGameDialog.vue'
import InventoryDialog from './components/InventoryDialog.vue'
import EventResultDialog from './components/EventResultDialog.vue'
import LanguageSelector from './components/LanguageSelector.vue'
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

// 语言状态
const currentLanguage = ref<string>('zh')

// 加载状态
const showLoadingDialog = ref(false)
const loadingProgress = ref(0)
const loadingStep = ref('正在初始化...')

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
  try {
    // 创建全局后端适配器实例但不立即初始化
    ;(window as any).backendAdapter = backend
    console.log('Backend adapter instance created')
    
    // 从本地存储恢复语言设置
    const savedLanguage = localStorage.getItem('game-language')
    if (savedLanguage && ['zh', 'en'].includes(savedLanguage)) {
      currentLanguage.value = savedLanguage
    }
  } catch (error) {
    console.error('Failed to create backend adapter instance:', error)
  }
})

// 语言切换处理
const handleLanguageChange = (language: string) => {
  currentLanguage.value = language
  // 保存到本地存储
  localStorage.setItem('game-language', language)
  // 通知后端语言变化
  if (backend.initialized) {
    backend.setLanguage(language)
  }
  console.log('Language changed to:', language)
}

// 视图切换
const goToTitle = () => { currentView.value = 'title' }
const goToWorldMap = () => { currentView.value = 'worldmap' }
const goToScene = () => { currentView.value = 'scene' }

// 游戏操作
const handleNewGame = async () => {
  try {
    // 显示加载对话框
    showLoadingDialog.value = true
    loadingProgress.value = 0
    loadingStep.value = '正在初始化系统...'
    
    // 设置进度回调
    backend.setProgressCallback((progress: number, message: string) => {
      loadingProgress.value = progress
      loadingStep.value = message
      console.log(`Loading progress: ${progress}% - ${message}`)
    })
    
    // 初始化后端适配器
    if (!backend.initialized) {
      console.log('Initializing backend...')
      await backend.initialize()
      console.log('Backend initialized successfully')
    }
    
    // 设置后端语言
    backend.setLanguage(currentLanguage.value)
    console.log('Backend language set to:', currentLanguage.value)
    
    // 稍微延迟一下让用户看到100%进度
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('Resetting game...')
    await backend.resetGame()
    
    // 等待一小段时间确保重置完成
    await new Promise(resolve => setTimeout(resolve, 200))
    
    loadingStep.value = '正在准备游戏界面...'
    console.log('Updating game state after reset...')
    await updateGameState()
    
    // 检查是否成功获取到有效的游戏状态
    if (!gameState.value || !gameState.value.resources || Object.keys(gameState.value.resources).length === 0) {
      console.warn('Game state seems empty, retrying...')
      loadingStep.value = '正在重新加载游戏数据...'
      await new Promise(resolve => setTimeout(resolve, 300))
      await updateGameState()
    }
    
    // 最终完成
    loadingProgress.value = 100
    loadingStep.value = '加载完成'
    
    console.log('Final game state before showing scene:', gameState.value)
    
    // 等待一小段时间让用户看到完成状态
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 隐藏加载对话框并显示游戏场景
    showLoadingDialog.value = false
    currentView.value = 'scene'
    
    // 清理进度回调
    backend.setProgressCallback(null)
    
  } catch (error) {
    console.error('Failed to start new game:', error)
    // 隐藏加载对话框
    showLoadingDialog.value = false
    // 清理进度回调
    backend.setProgressCallback(null)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    alert('启动游戏失败：' + errorMessage)
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
      alert('读档失败：' + (response.error || '未知错误'))
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
      saveData.value = response.saveData || ''
      showSaveGameDialog.value = true
    } else {
      alert('保存失败：' + (response.error || '未知错误'))
    }
  } catch (error) {
    console.error('Save game error:', error)
    alert('保存失败')
  }
}

const handleExitGame = () => {
  const confirmMessage = currentLanguage.value === 'en' ? 
    'Are you sure you want to exit the game?' : 
    '确定要退出游戏吗？'
  if (confirm(confirmMessage)) {
    window.close()
  }
}

const handleTravelTo = async (locationId: number) => {
  try {
    // 初始化后端适配器
    if (!backend.initialized) {
      await backend.initialize()
    }
    
    // 使用后端适配器进行位置切换
    const result = await backend.travelToLocation(locationId)
    if (result.success) {
      // 切换成功，更新游戏状态并切换到场景页面
      await updateGameState()
      currentView.value = 'scene'
    } else {
      alert('移动失败：' + (result.error || '未知错误'))
    }
  } catch (error) {
    console.error('Travel error:', error)
    alert('移动失败')
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
      alert('使用物品失败：' + (result.error || '未知错误'))
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
        endingData.value = gameState.value.ending_data || null
        currentView.value = 'ending'
      }
    } else {
      alert('执行事件失败：' + (result.error || '未知错误'))
    }
  } catch (error) {
    console.error('Execute event error:', error)
  }
}

const showEventResult = (result: EventResult) => {
  if (result) {
    pendingEvents.value.push(result)
    processNextEvent()
  }
}

const processNextEvent = () => {
  if (pendingEvents.value.length > 0) {
    const nextEvent = pendingEvents.value.shift()
    if (nextEvent) {
      eventResult.value = nextEvent
      showEventResultDialog.value = true
    }
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
    // 确保后端已初始化
    if (!backend.initialized) {
      await backend.initialize()
    }
    
    // 确保后端使用正确的语言
    backend.setLanguage(currentLanguage.value)
    
    // 获取游戏状态
    console.log('Fetching game state...')
    gameState.value = await backend.getGameState()
    console.log('Frontend received game state:', gameState.value)
    console.log('Frontend game state resources:', gameState.value?.resources)
    
    // 获取当前位置
    currentLocation.value = await backend.getCurrentLocation()
    
    // 获取可用实体
    availableEntities.value = await backend.getAvailableEntities()
    
    // 如果游戏状态中没有时间信息，尝试单独获取
    if (!gameState.value.time_info || !gameState.value.time_info.time_display) {
      try {
        const timeInfo = await backend.getTimeInfo()
        if (timeInfo && gameState.value) {
          gameState.value.time_info = timeInfo
        }
      } catch (timeError) {
        console.warn('Failed to get time info separately:', timeError)
      }
    }
    
    console.log('Game state updated:', gameState.value)
    console.log('Current location:', currentLocation.value)
    console.log('Time info:', gameState.value?.time_info)
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