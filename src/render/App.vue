<template>
  <Navigation/>
  <router-view v-slot="{ Component }">
    <transition name="slide">
      <component :is="Component" />
    </transition>
  </router-view>
  <Loading/>
</template>

<script>
import { useRouter } from 'vue-router'
import Navigation from './components/Navigation.vue'
import Loading from './components/Loading.vue'
import { mapMutations, mapState } from "vuex";
import { getDataNode, persistentStorage as state, DBDriver as Driver } from './store';

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
    ...mapMutations([
      'setConfig',
      'setDataNode',
      'toggleLoading',
      'setDriver'
      ])
  },
  computed: {
    ...mapState(['DBDriver'])
  },
  async mounted() {
    let config = await state.get("config");
    if (!config) return this.$router.push('/config')
    this.setConfig(config);
    this.setDriver(new Driver())
    const dataNode = await getDataNode(5001);
    await this.DBDriver.connect();
    this.setDataNode(dataNode);
    this.toggleLoading()
    this.$router.push('/dashboard')
  },
  components: {
    Navigation,
    Loading
  }
}
</script>
