import { createApp } from 'vue'
import App from './App.vue'
import './styles/main.css'
import { initializeAudioService } from './services/AudioService'

// 初始化应用
const app = createApp(App)

// 初始化音频服务
initializeAudioService().catch(error => {
  console.error('Failed to initialize audio service:', error)
})

app.mount('#app') 