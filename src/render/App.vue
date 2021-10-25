<template>
  <Navigation />
  <router-view v-slot="{ Component }">
    <transition name="slide">
      <component :is="Component" />
    </transition>
  </router-view>
  <div id="confirm"></div>
  <Loading />
</template>

<script>
import { useRouter } from "vue-router";
import Navigation from "./components/Navigation.vue";
import Loading from "./components/Loading.vue";
import { mapMutations, mapState } from "vuex";
import { getDataNode, persistentStorage as state, globalDriver } from "./store";

import RtManager from "./rtManager.js";

export default {
  name: "app",
  setup() {
    const router = useRouter();
    router.beforeEach((to, from, next) => {
      document.title = to.meta.title + " - Mismor" || "Mismor";
      next();
    });
    router.push("/");
  },
  methods: {
    ...mapMutations([
      "setConfig",
      "setDataNode",
      "toggleLoading",
      "setDriver",
      "setRTM",
    ]),
    handleMessage(message) {
      this.$notify({
        title: "Nuevo mensaje",
        message,
        type: "success",
        position: "bottom-right",
      });
    },
  },
  computed: {
    ...mapState(["dataNode", "rtm"]),
  },
  async mounted() {
    const config = await state.get("config");
    this.setDataNode(await getDataNode());
    this.setRTM(new RtManager(this.dataNode.pubsub, "mismor-realtime"));
    const channel = await this.rtm.subscribe("updates");
    channel.on("notification", async (msg) => {
      this.handleMessage(msg);
    });
    if (!config) {
      this.toggleLoading();
      return this.$router.push("/config");
    }
    this.setConfig(config);
    try {
      await globalDriver.connect();
    } catch (error) {
      this.$message.error('Error al conectar con la base de datos')
      this.toggleLoading();
      return this.$router.push("/config?redirect=dashboard");
    }
    this.toggleLoading();
    this.$router.push("/dashboard");
  },
  components: {
    Navigation,
    Loading,
  },
};
</script>
