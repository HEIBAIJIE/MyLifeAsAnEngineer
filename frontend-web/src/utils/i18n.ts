import { computed, toRef, ref, watchEffect, Ref } from 'vue'

// 多语言文本管理
export interface I18nTexts {
  // 主界面
  gameTitle: string
  gameSubtitle: string
  newGame: string
  loadGame: string
  exitGame: string
  systemInitialized: string
  awaitingInput: string
  poweredBy: string
  version: string

  // 导航和按钮
  save: string
  load: string
  inventory: string
  worldMap: string
  home: string
  back: string
  close: string
  confirm: string
  cancel: string
  execute: string
  use: string
  copy: string

  // 游戏状态
  location: string
  time: string
  characterStatus: string
  availableEntities: string
  cannotInteract: string
  clickToInteract: string
  returnToEntities: string
  interactWith: string
  timeCost: string
  hours: string
  executeEvent: string
  cannotExecute: string

  // 属性类别
  basicStats: string
  careerStats: string
  philosophyStats: string

  // 资源名称
  money: string
  health: string
  fatigue: string
  hunger: string
  rational: string
  emotional: string
  focus: string
  mood: string
  skill: string
  boss: string
  jobLevel: string
  project: string
  social: string
  reputation: string
  insight: string

  // 库存和物品
  inventoryTitle: string
  inventoryEmpty: string
  inventoryEmptyHint: string
  useItem: string

  // 存档相关
  saveTitle: string
  loadTitle: string
  saveSuccess: string
  loadSuccess: string
  saveDataLabel: string
  enterSaveData: string
  saveDataHint: string
  copySuccess: string
  saveDataTip: string

  // 事件结果
  eventResult: string
  eventDetails: string
  resourceChanges: string
  temporaryEvents: string
  scheduledTasks: string
  continueBtn: string

  // 时间和日期
  workday: string
  weekend: string
  morning: string
  afternoon: string
  evening: string
  night: string

  // 位置名称
  company: string
  store: string
  homeLocation: string
  park: string
  restaurant: string
  hospital: string

  // 位置描述
  companyDesc: string
  storeDesc: string
  homeDesc: string
  parkDesc: string
  restaurantDesc: string
  hospitalDesc: string

  // 通用
  loading: string
  initializing: string
  systemLoading: string
  dataLoading: string
  preparing: string
  complete: string
  error: string
  retry: string
  currentLocation: string
  travelTo: string
  noEvents: string
  requirements: string
  // 新增地图相关文本
  gameWorld: string
  enterScene: string
  returnToHome: string
  worldMapTitle: string
  availableLocation: string
  currentLocationMarker: string
  
  // 退出确认相关
  confirmExit: string
  exitMessage: string
  autoSaveTip: string
  confirmAndSave: string
}

// 中文文本
export const zhTexts: I18nTexts = {
  // 主界面
  gameTitle: '工程师日记',
  gameSubtitle: 'My Life As An Engineer',
  newGame: '开始新游戏',
  loadGame: '读取存档',
  exitGame: '退出程序',
  systemInitialized: '[系统已初始化]',
  awaitingInput: '[等待输入]',
  poweredBy: 'Powered by TypeScript & Vue3',
  version: '版本 v1.0.0 | 数字化生活模拟系统',

  // 导航和按钮
  save: '保存',
  load: '读取',
  inventory: '背包',
  worldMap: '地图',
  home: '主页',
  back: '返回',
  close: '关闭',
  confirm: '确定',
  cancel: '取消',
  execute: '执行',
  use: '使用',
  copy: '复制',

  // 游戏状态
  location: '位置',
  time: '时间',
  characterStatus: '角色状态',
  availableEntities: '可交互实体',
  cannotInteract: '无法交互',
  clickToInteract: '点击交互',
  returnToEntities: '返回实体',
  interactWith: '与',
  timeCost: '耗时',
  hours: '小时',
  executeEvent: '执行事件',
  cannotExecute: '无法执行',

  // 属性类别
  basicStats: '基础属性',
  careerStats: '职业属性',
  philosophyStats: '哲学属性',

  // 资源名称
  money: '💰 金钱',
  health: '❤️ 健康',
  fatigue: '😴 疲劳',
  hunger: '🍽️ 饥饿',
  rational: '🧠 理性',
  emotional: '💖 感性',
  focus: '🎯 专注',
  mood: '😊 心情',
  skill: '🔧 技能',
  boss: '😠 老板',
  jobLevel: '👔 职级',
  project: '📊 项目',
  social: '🤝 社交',
  reputation: '🏆 声誉',
  insight: '🤔 感悟',

  // 库存和物品
  inventoryTitle: '🎒 物品栏',
  inventoryEmpty: '🎒 物品栏是空的',
  inventoryEmptyHint: '通过购买或事件获得物品',
  useItem: '✨ 使用物品',

  // 存档相关
  saveTitle: '💾 保存存档',
  loadTitle: '💾 读取存档',
  saveSuccess: '游戏已成功保存！请复制以下存档代码:',
  loadSuccess: '读档成功！',
  saveDataLabel: '存档代码',
  enterSaveData: '请输入存档代码 (BASE64格式):',
  saveDataHint: '在此粘贴存档代码...',
  copySuccess: '✅ 已复制到剪贴板！',
  saveDataTip: '💡 提示: 请妥善保存此代码，用于下次读取游戏进度',

  // 事件结果
  eventResult: '执行结果',
  eventDetails: '事件详情',
  resourceChanges: '数据变更',
  temporaryEvents: '触发事件',
  scheduledTasks: '计划任务',
  continueBtn: '继续',

  // 时间和日期
  workday: '工作日',
  weekend: '周末',
  morning: '上午',
  afternoon: '下午',
  evening: '晚上',
  night: '深夜',

  // 位置名称
  company: '公司',
  store: '商店',
  homeLocation: '家',
  park: '公园',
  restaurant: '餐馆',
  hospital: '医院',

  // 位置描述
  companyDesc: '工作的地方',
  storeDesc: '购买物品',
  homeDesc: '休息的地方',
  parkDesc: '锻炼身体',
  restaurantDesc: '享用美食',
  hospitalDesc: '治疗疾病',

  // 通用
  loading: '加载中',
  initializing: '正在初始化...',
  systemLoading: '正在加载系统...',
  dataLoading: '正在加载数据...',
  preparing: '正在准备...',
  complete: '完成',
  error: '错误',
  retry: '重试',
  currentLocation: '当前位置',
  travelTo: '前往',
  noEvents: '该实体暂无可用事件',
  requirements: '要求',
  // 新增地图相关文本
  gameWorld: '游戏世界',
  enterScene: '进入场景',
  returnToHome: '返回主页',
  worldMapTitle: '世界地图',
  availableLocation: '可前往',
  currentLocationMarker: '当前位置',
  
  // 退出确认相关
  confirmExit: '确认退出',
  exitMessage: '确定要退出吗？',
  autoSaveTip: '💡 提示: 自动保存将在退出时进行',
  confirmAndSave: '确认并保存'
}

// 英文文本
export const enTexts: I18nTexts = {
  // 主界面
  gameTitle: 'My Life As An Engineer',
  gameSubtitle: '工程师日记',
  newGame: 'New Game',
  loadGame: 'Load Game',
  exitGame: 'Exit',
  systemInitialized: '[SYSTEM INITIALIZED]',
  awaitingInput: '[AWAITING INPUT]',
  poweredBy: 'Powered by TypeScript & Vue3',
  version: 'Version v1.0.0 | Digital Life Simulation System',

  // 导航和按钮
  save: 'Save',
  load: 'Load',
  inventory: 'Bag',
  worldMap: 'Map',
  home: 'Home',
  back: 'Back',
  close: 'Close',
  confirm: 'Confirm',
  cancel: 'Cancel',
  execute: 'Execute',
  use: 'Use',
  copy: 'Copy',

  // 游戏状态
  location: 'Location',
  time: 'Time',
  characterStatus: 'Character Status',
  availableEntities: 'Available Entities',
  cannotInteract: 'Cannot interact',
  clickToInteract: 'Click to interact',
  returnToEntities: 'Back to Entities',
  interactWith: 'Interact with',
  timeCost: 'Time cost',
  hours: 'hours',
  executeEvent: 'Execute Event',
  cannotExecute: 'Cannot execute',

  // 属性类别
  basicStats: 'Basic Stats',
  careerStats: 'Career Stats',
  philosophyStats: 'Philosophy Stats',

  // 资源名称
  money: '💰 Money',
  health: '❤️ Health',
  fatigue: '😴 Fatigue',
  hunger: '🍽️ Hunger',
  rational: '🧠 Rational',
  emotional: '💖 Emotional',
  focus: '🎯 Focus',
  mood: '😊 Mood',
  skill: '🔧 Skill',
  boss: '😠 Boss',
  jobLevel: '👔 Job Level',
  project: '📊 Project',
  social: '🤝 Social',
  reputation: '🏆 Reputation',
  insight: '🤔 Insight',

  // 库存和物品
  inventoryTitle: '🎒 Inventory',
  inventoryEmpty: '🎒 Inventory is empty',
  inventoryEmptyHint: 'Get items through purchasing or events',
  useItem: '✨ Use Item',

  // 存档相关
  saveTitle: '💾 Save Game',
  loadTitle: '💾 Load Game',
  saveSuccess: 'Game saved successfully! Please copy the save code below:',
  loadSuccess: 'Game loaded successfully!',
  saveDataLabel: 'Save Code',
  enterSaveData: 'Please enter save code (BASE64 format):',
  saveDataHint: 'Paste save code here...',
  copySuccess: '✅ Copied to clipboard!',
  saveDataTip: '💡 Tip: Please save this code carefully for loading game progress next time',

  // 事件结果
  eventResult: 'Event Result',
  eventDetails: 'Event Details',
  resourceChanges: 'Resource Changes',
  temporaryEvents: 'Triggered Events',
  scheduledTasks: 'Scheduled Tasks',
  continueBtn: 'Continue',

  // 时间和日期
  workday: 'Workday',
  weekend: 'Weekend',
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',

  // 位置名称
  company: 'Company',
  store: 'Store',
  homeLocation: 'Home',
  park: 'Park',
  restaurant: 'Restaurant',
  hospital: 'Hospital',

  // 位置描述
  companyDesc: 'Workplace',
  storeDesc: 'Buy items',
  homeDesc: 'Place to rest',
  parkDesc: 'Exercise',
  restaurantDesc: 'Enjoy food',
  hospitalDesc: 'Medical care',

  // 通用
  loading: 'Loading',
  initializing: 'Initializing...',
  systemLoading: 'Loading system...',
  dataLoading: 'Loading data...',
  preparing: 'Preparing...',
  complete: 'Complete',
  error: 'Error',
  retry: 'Retry',
  currentLocation: 'Current',
  travelTo: 'Go',
  noEvents: 'No events available for this entity',
  requirements: 'Requirements',
  // 新增地图相关文本
  gameWorld: 'Game World',
  enterScene: 'Enter Scene',
  returnToHome: 'Return to Home',
  worldMapTitle: 'World Map',
  availableLocation: 'Available',
  currentLocationMarker: 'Current Location',
  
  // 退出确认相关
  confirmExit: 'Confirm Exit',
  exitMessage: 'Are you sure you want to exit?',
  autoSaveTip: '💡 Tip: Auto save will be performed when exiting',
  confirmAndSave: 'Confirm and Save'
}

// 获取当前语言的文本
export function getTexts(language: string): I18nTexts {
  return language === 'en' ? enTexts : zhTexts
}

// 便捷的文本获取函数
export function useI18n(language: string | Ref<string>) {
  // 处理语言参数，支持字符串或响应式引用
  const currentLanguage = typeof language === 'string' ? ref(language) : language
  
  // 如果传入的是字符串，需要监听外部变化
  if (typeof language === 'string') {
    // 对于字符串参数，我们需要通过其他方式处理响应性
    // 这里我们仍然返回基于当前值的结果
  }
  
  // 创建响应式的文本对象
  const texts = computed(() => getTexts(currentLanguage.value))
  
  // 创建响应式的t函数
  const t = (key: keyof I18nTexts) => {
    return texts.value[key]
  }
  
  return {
    t,
    texts
  }
} 