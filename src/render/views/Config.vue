<template>
  <div class="px-10 w-full absolute">
    <div class="flex items-center mb-5">
      <h1 @click="$router.go(-1)" class="cursor-pointer px-2 py-1"><ArrowLeftIcon class="h-5 w-5 mb-1"/></h1>
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
       <h1 class="mb-2 mt-5">Configuración del nodo</h1>
       <div class="flex mt-5 w-full">
         <div class="px-5 w-full">
           <h1 class="mb-2">Direcciones Swarm</h1>
           <div class="mb-5">
             <p v-for="i in nodeAddresses" :key="i" class="text-xxs w-full mb-2 font-bold border-black text-green-700 py-2 px-5 cursor-pointer border border-dashed rounded">{{ i }}</p>
           </div>
         </div>
       </div>
       <div class="flex w-full">
         <div class="px-5 w-full">
          <h1 class="mb-2">Conectar con otro nodo</h1>
          <div class="flex">
            <el-input
              class="w-64"
              placeholder="Direccion (Multiaddr)"
              v-model="currentAddress"
              clearable>
            </el-input>
            <button @click="connectNode" class="ml-5 rounded bg-black text-xs px-5 py-1 text-white">Agregar</button>
          </div>
         </div>
       </div>
       <div v-show="config.savedAdresses.length" class="flex mt-5 w-full">
         <div class="px-5 w-full">
           <h1 class="mb-2">Direcciones agregadas</h1>
           <div class="mb-5">
             <p v-for="i in config.savedAdresses" :key="i" class="text-xxs w-full mb-2 font-bold border-black text-red-700 py-2 px-5 cursor-pointer border border-dashed rounded">{{ i }}</p>
           </div>
         </div>
       </div>
       <button @click="next" class="mt-5 bg-black text-xs px-2 py-1 text-white">Guardar</button>    
    </div>
  </div>
</template>

<script>
import { ArrowLeftIcon } from '@heroicons/vue/outline'
import { mapMutations, mapState } from 'vuex'
import { persistentStorage as state, globalDriver } from './../store';
const { Multiaddr } = require('multiaddr')

export default {
  data() {
    return {
      config: {
        name: '',
        host: '',
        savedAdresses: []
      },
      nodeAddresses: '',
      currentAddress: '',
      fisrtLoad: false
    }
  },
  components: {
    ArrowLeftIcon
  },
  computed: {
    ...mapState(['visibleBack', 'dataNode'])
  },
  async mounted() {
    this.nodeAddresses = this.dataNode.peerId.addresses.map(a => a.toString());
    let config = await state.get("config");
    if (!config) this.fisrtLoad = true;
    this.config = Object.assign(this.config, config);
  },
  methods: {
    async next() {
      this.$store.commit('toggleLoading')
      state.set("config", this.config);
      this.$store.commit('setConfig', this.config)
      await globalDriver.reconnect();
      this.$store.commit('toggleLoading')
      !this.fisrtLoad ? this.$router.go(-1) : this.$router.push('/dashboard')
    },
    async connectNode() {
      this.$store.commit('toggleLoading');
      let addr;
      try {
        addr = new Multiaddr(this.currentAddress);
      } catch (error) {
        this.$store.commit('toggleLoading');
        return this.$message({
          message: 'No es un multiaddr valido.',
          type: 'error'
        })
      }
      if (this.nodeAddresses.some(a => a === this.currentAddress)) {
        this.$store.commit('toggleLoading');
        return this.$message({
          message: 'Este nodo ya pertenece a si mismo.',
          type: 'error'
        })
      }
      try {
        await this.dataNode.swarm.connect(addr);
        this.config.savedAdresses.push(this.currentAddress)
        this.$message({
          message: 'Nodo conectado con exito.',
          type: 'success'
        });
      } catch (error) {
        this.$message({
          message: 'No se pudo conectar con este nodo.',
          type: 'error'
        });
      }
      this.$store.commit('toggleLoading');
    }
  }
}
</script>

<style scoped>
.text-xxs {
  font-size: 0.65rem/* 12px */;
  line-height: 0.90rem/* 16px */;
}
</style>