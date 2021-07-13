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
const Room = require('ipfs-pubsub-room')

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
    ...mapState(['dataNode'])
  },
  async mounted() {
    const config = await state.get("config");
    this.setDataNode(await getDataNode(5001));
    // console.log(this.dataNode);
    // const room = new Room(this.dataNode, 'denyncrawford-room-mismor-rta');
    // room.on('peer joined', (peer) => {
    //   console.log('Peer joined the room', peer)
    // })
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
