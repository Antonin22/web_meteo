import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Création de l'application Vue
const app = createApp(App)

// Utilisation du router
app.use(router)

// Montage de l'application
app.mount('#app')