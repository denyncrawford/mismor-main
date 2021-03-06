<template>
  <div class="px-10 w-full absolute">
    <heading-back>Clientes</heading-back>
    <h1 class="mb-2 mt-5">Acciones</h1>
    <div class="flex mb-5">
      <router-link to="/createClient" class="hover:border-blue-700 hover:text-blue-700 rounded font-bold px-4 py-2 text-sm border border-dashed border-gray-400">
        <PlusIcon class="h-5 w-5 mb-1"/>
        Crear Cliente
      </router-link>
    </div>
    <div class="mb-20">
      <h1 class="mb-2">Clientes</h1>
      <div class="w-full rounded border border-dashed border-gray-400">
        <table class="w-full table-auto">
          <thead class="text-sm py-5">
            <tr class="py-5">
              <th>Cliente</th>
              <th>ID</th>
              <th>Fecha</th>
              <th>Telefono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody class="text-xs text-center py-5 overflow-hidden">
            <transition-group name="slide-td">
              <tr class="py-5 cursor-pointer hover:bg-gray-300" v-for="client in clients" :key="client.shortId">
                <td>{{ ellipsis(client.name) }}</td>
                <td>{{ ellipsis(client.shortId) }}</td>
                <td>{{ formatDate(client.date) }}</td>
                <td>{{ ellipsis(client.phone) }}</td>
                <td> 
                  <div class="flex items-center">
                    <div class="flex">
                      <EyeIcon class="hover:text-blue-700 w-5 h-5 mx-2"/>
                      <router-link :to="{ name: 'editClient', params: { id: client.shortId }}"> <PencilAltIcon class="hover:text-blue-700 w-5 h-5 mx-2"/> </router-link>
                      <div>
                        <TrashIcon @click="removeClient(client.shortId, client.assets)" class="hover:text-blue-700 w-5 h-5 mx-2"/>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </transition-group>
          </tbody>
        </table>
        <div class="w-full flex intems-center p-5 justify-center" v-show="!clients.length">
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
         PencilAltIcon,
         ArrowLeftIcon
} from '@heroicons/vue/outline'
import dayjs from 'dayjs'
import { mapState } from 'vuex';
import { globalDriver } from "./../store";
export default {
  data() {
    return {
      clients: [],
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
    ...mapState(['dataNode']),
    ellipsis() {
      const length = 15;
      return data => data.length > length ? `${data.substring(0, length)}...` : data;
    }
  },
  methods: {
    async fetchClients(query) {
      const clients = this.db.collection("clients");
      this.totalPages = Math.ceil(Number(await clients.count()) / this.maxPageView);
      this.clients = await clients.find(query).skip(this.pageSkip).limit(this.maxPageView).sort({_id: -1}).toArray()
    },
    async removeClient(shortId, assets) {
      const ok = await this.$confirm('¿Deseas borrar estre cliente?')
      if (!ok) return;
      const clients = this.db.collection("clients");
      await Promise.all(assets.map(async a => {
        await this.dataNode.files.rm(`/${a.filename}`)
      }))
      await clients.deleteOne({ shortId });
      await this.fetchClients();
    },
    async paginate(n) {
      if (this.page === 0 && !n || this.page === this.totalPages - 1 && n) return;
      if (this.page > this.totalPages) this.page = this.totalPages;
      this.page = n ? this.page + 1 : this.page - 1;
      console.log(this.page);
      await this.fetchEntries();
    }
  },
  components: {
    UsersIcon, 
    PlusIcon,
    CheckIcon,
    EyeIcon,
    TrashIcon,
    PencilAltIcon,
    ArrowLeftIcon
  },
  async mounted() {
    this.db = await globalDriver.getDb()
    await this.fetchClients({})
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