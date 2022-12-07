import 'uno.css'
import { createApp } from 'vue'
import App from './App.vue'
import { initStore } from './store'

initStore()

createApp(App).mount('#app')
