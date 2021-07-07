<template>
  <Navigation/>
  <router-view v-slot="{ Component }">
    <transition name="slide">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script>
import { useRouter } from 'vue-router'
import Navigation from './components/Navigation.vue'
import { mapMutations } from "vuex";
import { getDataNode, persistentStorage as state } from './store';

export default {
  name: 'app',
  setup() {
    const router = useRouter()
    router.beforeEach((to, from, next) => {
      document.title = to.meta.title + ' - Mismor' || 'Mismor';
      next()
    })
    router.push('/')
  },
  methods: {
    ...mapMutations(['setConfig','setDataNode'])
  },
  async mounted() {
    let config = await state.get("config");
    if (!config) return this.$router.push('/config')
    this.setConfig(config)
    const dataNode = await getDataNode(5001);
    this.setDataNode(dataNode)
  },
  components: {
    Navigation
  }
}
</script>
