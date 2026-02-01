import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { sessionHandler } from './utils/session.handler'
import App from './App.vue'
import router from './router'


const app = createApp(App)
const pinia = createPinia()

// Инициализируем session handler
sessionHandler.init()

// Сначала устанавливаем pinia
app.use(pinia)

app.use(router)

app.mount('#app')




