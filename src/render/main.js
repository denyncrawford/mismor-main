import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import ElementUI from 'element-plus';
import VueConfirmPlugin from 'v3confirm'
import 'element-plus/dist/index.css';
import './theme/index.css'
import "animate.css/animate.css";
import "three-dots/dist/three-dots.css"
import router from './router'
import { store } from './store'
import locale from 'element-plus/lib/locale/lang/es'
import 'dayjs/locale/es'
import HeadingBack from './components/HeadingBack.vue'

const app = createApp(App)

app.component('heading-back', HeadingBack)

app.use(router)
app.use(store)
app.use(ElementUI, { locale })
app.use(VueConfirmPlugin)
app.mount('#app')
