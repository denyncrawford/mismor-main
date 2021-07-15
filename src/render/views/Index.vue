<template>
  <div class="px-10 w-full absolute">
    <div class="flex mb-5">
      <h1 class="bg-black text-xs px-2 py-1 text-white">Panel de control</h1>
    </div>
    <h1 class="mb-2">Acciones</h1>
    <div class="flex mb-5">
      <router-link to="/clients" class="hover:border-blue-700 hover:text-blue-700 rounded font-bold px-4 py-2 text-sm border border-dashed border-gray-400">
        <UsersIcon class="h-5 w-5 mb-1"/>
        Clientes
      </router-link>
      <router-link to="/create" class="ml-5 hover:border-blue-700 hover:text-blue-700 rounded font-bold px-4 py-2 text-sm border border-dashed border-gray-400">
        <PlusIcon class="h-5 w-5 mb-1"/>
        Crear Ingreso
      </router-link>
      <router-link to="/create" class="ml-5 hover:border-blue-700 hover:text-blue-700 rounded font-bold px-4 py-2 text-sm border border-dashed border-gray-400">
        <CheckIcon class="h-5 w-5 mb-1"/>
        Administrar Estados
      </router-link>
    </div>
    <div class="mb-20">
      <h1 class="mb-2">Todos los Registros</h1>
      <div class="w-full rounded border border-dashed border-gray-400">
        <table class="w-full table-auto">
          <thead class="text-sm py-5">
            <tr class="py-5">
              <th>Cliente</th>
              <th>ID</th>
              <th>Corte</th>
              <th>Articulo</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Prioridad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody class="text-xs text-center py-5 overflow-hidden">
            <transition-group name="slide-td">
              <tr class="py-5 cursor-pointer hover:bg-gray-300" v-for="entry in entries" :key="entry.shortId">
                <td>{{ ellipsis(entry.clients.map(e => e.name).join(' - ')) }}</td>
                <td>{{ ellipsis(entry.shortId) }}</td>
                <td>{{ ellipsis(entry.corte || "--") }}</td>
                <td>{{ ellipsis(entry.articulo || "--") }}</td>
                <td>{{ entry.dates?.start ? formatDate(entry.dates?.start) : "--" }}</td>
                <td>{{ entry.dates?.end ? formatDate(entry.dates?.end) : "--" }}</td>
                <td>{{ entry.priority }}</td>
                <td> 
                  <div class="flex">
                    <EyeIcon @click="publish(entry.shortId)" class="hover:text-blue-700 w-5 h-5 mx-2"/>
                    <router-link :to="{ name: 'edit', params: { id: entry.shortId }}"> <PencilAltIcon class="hover:text-blue-700 w-5 h-5 mx-2"/> </router-link>
                    <el-popconfirm
                      title="Por favor confirmar el borrado de este item."
                      @confirm="removeEntry(entry.shortId, entry.assets)"
                    >
                      <template #reference>
                        <div>
                          <TrashIcon class="hover:text-blue-700 w-5 h-5 mx-2"/>
                        </div>
                      </template>
                    </el-popconfirm>
                  </div>
                </td>
              </tr>
            </transition-group>
          </tbody>
        </table>
        <div class="w-full flex intems-center p-5 justify-center" v-show="!entries.length">
              <h1 class="text-sm text-gray-400">No hay datos para mostrar.</h1>
        </div>
        <div class="flex mt-2 py-2 items-center">
          <div class="overflow-hidden ml-auto flex text-xs rounded border-gray-200 border">
            <div @click="paginate(false)" class="hover:bg-black hover:text-white cursor-pointer px-3">Ant.</div>
            <div class="px-3 text-blue-700">{{ page + 1 }}</div>
            <div @click="paginate(true)" class="hover:bg-black hover:text-white cursor-pointer px-3">Prox.</div>
          </div>
          <div class="text-xs mr-5 ml-2">
            de {{ totalPages }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { UsersIcon, 
         PlusIcon,
         CheckIcon,
         EyeIcon,
         TrashIcon,
         PencilAltIcon
} from '@heroicons/vue/outline'
import dayjs from 'dayjs'
import { mapState } from 'vuex'
import { globalDriver } from "./../store.js";
import { onBeforeRouteLeave } from 'vue-router';
export default {
  data() {
    return {
      db: "",
      channel: null,
      entries: [],
      page: 0,
      maxPageView: 10,
      totalPages: 0
    }
  },
  computed: {
    pageSkip() {
      return this.page * this.maxPageView
    },
    formatDate() {
      return date => dayjs(date).format('DD-MM-YYYY')
    },
    ...mapState(['dataNode','rtm']),
    ellipsis() {
      const length = 15;
      return data => data.length > length ? `${data.substring(0, length)}...` : data;
    }
  },
  components: {
    UsersIcon, 
    PlusIcon,
    CheckIcon,
    EyeIcon,
    TrashIcon,
    PencilAltIcon
  },
  methods: {
    async fetchEntries(query) {
      const entries = this.db.collection("entries");
      this.totalPages = Math.ceil(Number(await entries.count()) / this.maxPageView);
      this.entries = await entries.find(query).skip(this.pageSkip).limit(this.maxPageView).sort({_id: -1}).toArray()
    },
    async removeEntry(shortId, assets) {
      const entries = this.db.collection("entries");
      await Promise.allSettled(assets.map(async a => {
        try {
          await this.dataNode.files.rm(`/${a.filename}`);
        } catch (e) {
          console.log(e);
        }
      }))
      await entries.deleteOne({ shortId });
      await this.fetchEntries();
    },
    async paginate(n) {
      if (this.page === 0 && !n || this.page === this.totalPages - 1 && n) return;
      if (this.page > this.totalPages) this.page = this.totalPages;
      this.page = n ? this.page + 1 : this.page - 1;
      await this.fetchEntries();
    },
    async publish(id) {
      //await this.dataNode.pubsub.publish('denyncrawford:notification', id)
      await this.channel.trigger('new', id);
    }
  },
  async mounted() {
    this.db = await globalDriver.getDb()
    this.channel = await this.rtm.subscribe('notifications');
    await this.fetchEntries({})
  },
  async beforeRouteLeave() {
    console.log('lol');
    await this.channel.unsubscribe();
  }
}
</script>

<style scoped>
td, th {
  padding: 7px;
} 

.slide-td-leave-active {
  animation: fadeOutRight; /* referring directly to the animation's @keyframe declaration */
  animation-duration: .5s; /* don't forget to set a duration! */
}

.slide-td-enter-active {
  animation: fadeInLeft; /* referring directly to the animation's @keyframe declaration */
  animation-duration: .5s; /* don't forget to set a duration! */
}

</style>