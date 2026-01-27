import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { sessionHandler } from './utils/session.handler'

const app = createApp(App)
const pinia = createPinia()

// Сначала устанавливаем pinia
app.use(pinia)

// Затем инициализируем session handler с доступом к pinia
sessionHandler.init()

// Затем устанавливаем роутер
app.use(router)

app.mount('#app')

console.log('🚀 Vue app mounted')



