<template>
  <div class="px-10 w-full absolute">
    <div class="flex items-center mb-5">
      <h1 @click="this.$router.go(-1)" class="cursor-pointer px-2 py-1"><ArrowLeftIcon class="h-5 w-5 mb-1"/></h1>
      <h1 class="bg-black text-xs px-2 py-1 text-white">Configurar</h1>
    </div>
    <h1 class="mb-2">Base de datos</h1>
    <div class="w-9/12 mb-32">
       <div class="flex mt-5">
         <div class="px-5">
          <h1 class="mb-2">Host</h1>
          <el-input
            class="w-32"
            placeholder="Host de BD"
            v-model="config.host"
            clearable>
          </el-input>
         </div>
         <div class="px-5">
          <h1 class="mb-2">Nombre</h1>
          <el-input
            class="w-32"
            placeholder="Nombre para BD"
            v-model="config.name"
            clearable>
          </el-input>
         </div>
       </div>
       <button @click="next" class="mt-5 bg-black text-xs px-2 py-1 text-white">Guardar</button>    
    </div>
  </div>
</template>

<script>
import { ArrowLeftIcon } from '@heroicons/vue/outline'
import { mapMutations, mapState } from 'vuex'
import { persistentStorage as state } from './../store';
export default {
  data() {
    return {
      config: {
        name: '',
        host: ''
      },
      fisrtLoad: false
    }
  },
  components: {
    ArrowLeftIcon
  },
  computed: {
    ...mapState(['visibleBack'])
  },
  methods: {
    ...mapMutations(['setConfig'])
  },
  async mounted() {
    let config = await state.get("config");
    if (!config) this.fisrtLoad = true;
    this.config = Object.assign(this.config, config);
  },
  methods: {
    async next() {
      await state.set("config", this.config);
      this.$store.commit('setConfig', this.config)
      await this.$store.state.DBDriver.reconnect();
      !this.fisrtLoad ? this.$router.go(-1) : this.$router.push('/')
    }
  }
}
</script>