import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import ElementUI from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import './theme/index.css'
import "animate.css/animate.css";
import "three-dots/dist/three-dots.css"
import router from './router'
import { store } from './store'
import locale from 'element-plus/lib/locale/lang/es'
import 'dayjs/locale/es'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementUI, { locale })
app.mount('#app')
