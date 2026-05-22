import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'
import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Carregar estado de autenticação salvo antes de montar o app
const authStore = useAuthStore()
authStore.loadFromStorage()

app.use(router)
app.mount('#app')
