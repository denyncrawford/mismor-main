<template>
  <div class="px-10 w-full absolute">
    <div class="flex items-center mb-5">
      <h1 @click="$router.go(-1)" class="cursor-pointer px-2 py-1"><ArrowLeftIcon class="h-5 w-5 mb-1"/></h1>
      <h1 class="bg-black text-xs px-2 py-1 text-white">Clientes</h1>
    </div>
    <h1 class="mb-2">Crear Cliente</h1>
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
          <tbody class="text-xs text-center py-5">
            <tr class="py-5 cursor-pointer hover:bg-gray-300" v-for="client in clients" :key="client.shortId">
              <td>{{ client.name }}</td>
              <td>{{ client.shortId }}</td>
              <td>{{ formatDate(client.date) }}</td>
              <td>{{ client.phone }}</td>
              <td> 
                <div class="flex items-center">
                  <div class="flex">
                    <EyeIcon class="hover:text-blue-700 w-5 h-5 mx-2"/>
                    <router-link :to="{ name: 'editClient', params: { id: client.shortId }}"> <PencilAltIcon class="hover:text-blue-700 w-5 h-5 mx-2"/> </router-link>
                    <el-popconfirm
                      title="Por favor confirmar el borrado de este cliente."
                      @confirm="removeClient(client.shortId, client.assets)"
                    >
                      <template #reference>
                        <div>
                          <TrashIcon class="hover:text-blue-700 w-5 h-5 mx-2"/>
                        </div>
                      </template>
                    </el-popconfirm>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
import { mapState } from 'vuex'
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
    ...mapState(['dataNode','DBDriver'])
  },
  methods: {
    async fetchClients(query) {
      const clients = this.db.collection("clients");
      this.totalPages = Math.ceil(Number(await clients.count()) / this.maxPageView);
      this.clients = await clients.find(query).skip(this.pageSkip).limit(this.maxPageView).sort({_id: -1}).toArray()
    },
    async removeClient(shortId, assets) {
      const clients = this.db.collection("clients");
      await Promise.all(assets.map(async a => {
        await this.dataNode.files.rm(`/${a.filename}`)
      }))
      await clients.deleteOne({ shortId });
      await this.fetchClients();
    },
    async paginate(n) {
      if (this.page === 0 && !n || this.page === this.totalPages - 1 && n) return
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
    this.db = await this.DBDriver.getDb()
    await this.fetchClients({})
  }
}
</script>

<style scoped>
td, th {
  padding: 7px;
} 
</style>