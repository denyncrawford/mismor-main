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
import { getDataNode, persistentStorage as state, globalDriver } from './store';

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
      ]),
      handleMessage(msg) {
        const message = Buffer.from(msg.data).toString();
        this.$notify({
          title: 'Nuevo mensaje',
          message,
          type: 'success',
          position: 'bottom-right'
        });
      }
  },
  computed: {
    ...mapState(['dataNode'])
  },
  async mounted() {
    const config = await state.get("config");
    this.setDataNode(await getDataNode(5001));
    await this.dataNode.pubsub.subscribe('denyncrawford:notification', this.handleMessage);
    console.log(`subscribed to denyncrawford:notification`)
    if (!config) {
      this.toggleLoading()
      return this.$router.push('/config')
    }
    this.setConfig(config);
    await globalDriver.connect();
    this.toggleLoading()
    this.$router.push('/dashboard')
  },
  components: {
    Navigation,
    Loading
  }
}
</script>
