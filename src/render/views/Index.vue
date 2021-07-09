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
      <h1 class="mb-2">Operaciones recientes</h1>
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
          <tbody class="text-xs text-center py-5">
            <tr class="py-5 cursor-pointer hover:bg-gray-300" v-for="entry in entries" :key="entry.shortId">
              <td>{{ entry.clients.join(' ') }}</td>
              <td>{{ entry.shortId }}</td>
              <td>{{ entry.corte || "--" }}</td>
              <td>{{ entry.articulo || "--" }}</td>
              <td>{{ entry.dates?.start ? formatDate(entry.dates?.start) : "--" }}</td>
              <td>{{ entry.dates?.end ? formatDate(entry.dates?.start) : "--" }}</td>
              <td>{{ entry.priority }}</td>
              <td> 
                <div class="flex">
                  <EyeIcon class="hover:text-blue-700 w-5 h-5 mx-2"/>
                  <router-link :to="{ name: 'edit', params: { id: entry.shortId }}"> <PencilAltIcon class="hover:text-blue-700 w-5 h-5 mx-2"/> </router-link>
                  <el-popconfirm
                    title="Por favor confirmar el borrado de este item."
                    @confirm="removeEntry(entry.shortId)"
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
         PencilAltIcon
} from '@heroicons/vue/outline'
import dayjs from 'dayjs'
import { database } from './../store.js'
export default {
  data() {
    return {
      db: "",
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
    async removeEntry(shortId) {
      const entries = this.db.collection("entries");
      await entries.deleteOne({ shortId });
      await this.fetchEntries();
    },
    async paginate(n) {
      if (this.page === 0 && !n || this.page === this.totalPages - 1 && n) return
      this.page = n ? this.page + 1 : this.page - 1;
      console.log(this.page);
      await this.fetchEntries();
    }
  },
  async mounted() {
    this.db = await database();
    await this.fetchEntries({})
  }
}
</script>

<style scoped>
td, th {
  padding: 7px;
} 
</style>