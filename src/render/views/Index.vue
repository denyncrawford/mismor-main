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
      <router-link to="/hooks" class="ml-5 hover:border-blue-700 hover:text-blue-700 rounded font-bold px-4 py-2 text-sm border border-dashed border-gray-400">
        <CheckIcon class="h-5 w-5 mb-1"/>
        Administrar Hooks
      </router-link>
    </div>
    <div class="mb-20">
      <h1 class="mb-5">Todos los Registros</h1>
      <!-- sarchbar -->
      <div class="flex items-center border border-dashed border-gray-400 border-b-0 rounded-tr rounded-tl w-full px-5">
        <SearchIcon class="h-5 w-5 mr-2"/>
        <input @input="search" type="text" class="outline-none ring-0 px-5 py-2 text-sm" v-model="searchTerm" placeholder="Escribe aca para buscar...">
        <div class="flex ml-auto items-center">
          <h1 class="mr-5 text-sm whitespace-nowrap">Solo activos:</h1>
          <el-switch @change="fetchEntries(currentQuery || {})" v-model="onlyActive" />
          <h1 class="ml-5 text-sm whitespace-nowrap">Ordenar por:</h1>
          <el-select @change="fetchEntries(currentQuery || {})" v-model="orderBy" class="ml-2 border-none outline-none ring-0 px-2 py-1 text-sm w-full">
            <el-option value="created_at" label="Fecha de creación"></el-option>
            <el-option value="updated_at" label="Fecha de actualización"></el-option>
          </el-select>
        </div>
      </div>
      <div class="w-full rounded-br rounded-bl border border-dashed border-gray-400">
        <table class="w-full table-auto">
          <thead class="text-sm py-5">
            <tr class="py-5">
              <th>Snapshot</th>
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
              <tr @dblclick="$router.push({ name: 'view', params: { id: entry.shortId } })" class="py-5 cursor-pointer hover:bg-gray-300" v-for="entry in entries" :key="entry.shortId">
                <td class="px-5 py-5 flex items-center justify-center">
                  <div :style="{backgroundImage: `url(${snapshot(entry.assets)})`}" class="h-10 w-10 bg-center bg-no-repeat bg-contain" alt=""></div>
                </td>
                <td>{{ ellipsis(entry.clients.map(e => e.name).join(' - ')) }}</td>
                <td>{{ ellipsis(entry.shortId) }}</td>
                <td>{{ ellipsis(entry.corte || "--") }}</td>
                <td>{{ ellipsis(entry.articulo || "--") }}</td>
                <td>{{ entry.dates?.start ? formatDate(entry.dates?.start) : "--" }}</td>
                <td>{{ entry.dates?.end ? formatDate(entry.dates?.end) : "--" }}</td>
                <td>{{ entry.priority }}</td>
                <td> 
                  <div class="flex">
                    <router-link :to="{ name: 'view', params: { id: entry.shortId } }"><EyeIcon @click="publish(entry.shortId)" class="hover:text-blue-700 w-5 h-5 mx-2"/></router-link>
                    <router-link :to="{ name: 'edit', params: { id: entry.shortId }}"> <PencilAltIcon class="hover:text-blue-700 w-5 h-5 mx-2"/> </router-link>
                    <div @click="removeEntry(entry.shortId, entry.assets)">
                      <TrashIcon class="hover:text-blue-700 w-5 h-5 mx-2"/>
                    </div>
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
         PencilAltIcon,
        SearchIcon,
} from '@heroicons/vue/outline'
import dayjs from 'dayjs'
import { mapState } from 'vuex'
import { globalDriver } from "./../store.js";
import { searchEntriesByMetadata } from '../services/queries.service.js'
import NAImage from '../assets/na.png'
export default {
  data() {
    return {
      db: "",
      updates: null,
      entries: [],
      searchTerm: "",
      page: 0,
      maxPageView: 6,
      orderBy: "updated_at",
      onlyActive: false,
      totalPages: 0,
      currentQuery: null,
      allowedImageExtensions: [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "bmp",
          "webp",
          "svg",
      ]
    }
  },
  computed: {
    pageSkip() {
      return this.page * this.maxPageView
    },
    snapshot() {
      return assets => {
        if (!assets.length) return NAImage;
        const file = assets.find(file => this.allowedImageExtensions.includes(file.ext));
        if (!file) return NAImage;
        return `http://localhost:8080/ipfs/${file.path}`;
      }
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
    PencilAltIcon,
    SearchIcon,
  },
  methods: {
    async fetchEntries(query) {
      const entries = this.db.collection("entries");
      if (this.onlyActive) query = { $and: [ query, { "dates.end": { $exists: true }, $where: "this.dates.end.length === 0" } ] };
      console.log(query);
      this.totalPages = this.currentQuery ? Math.ceil(Number(await entries.countDocuments(this.currentQuery)) / this.maxPageView) : Math.ceil(Number(await entries.count()) / this.maxPageView);
      if (this.page > this.totalPages - 1) this.page = this.page === 0 ? 0 : this.totalPages - 1;
      const sortObj = this.orderBy === "created_at" ? { _id : -1 } : { 'dates.updatedAt': -1 };
      this.entries = await entries.find(query).skip(this.pageSkip).limit(this.maxPageView).sort(sortObj).toArray()
    },
    async removeEntry(shortId, assets) {
      const ok = await this.$confirm('¿Deseas borrar esta entrada?')
      if (!ok) return;
      const entries = this.db.collection("entries");
      await Promise.allSettled(assets.map(async a => {
        try {
          await this.dataNode.files.rm(`/${a.filename}`);
        } catch (e) {
          console.log(e);
        }
      }))
      await entries.deleteOne({ shortId });
      await this.updates.trigger('update', shortId);
      this.fetchEntries(this.currentQuery || {});
    },
    async paginate(n) {
      if (this.page === 0 && !n || this.page === this.totalPages - 1 && n) return;
      if (this.page > this.totalPages) this.page = this.totalPages;
      this.page = n ? this.page + 1 : this.page - 1;
      await this.fetchEntries(this.currentQuery || {});
    },
    async search() {
      if (!this.searchTerm) { 
        this.currentQuery = null;
        return this.fetchEntries({});
      }
      const query = searchEntriesByMetadata(this.searchTerm);
      this.currentQuery = query;
      await this.fetchEntries(query);
      this.page = 0;
    },
    async publish(id) {
      await this.updates.broadcast('update', id);
      await this.updates.trigger('notification', id);
    },
    async copy(data) {
      await navigator.clipboard.writeText(data);
    }
  },
  async mounted() {
    this.db = await globalDriver.getDb()
    this.updates = await this.rtm.subscribe('updates');
    this.updates.on('update', async (data) => {
      await this.fetchEntries({})
    })
    this.fetchEntries({})
  },
  async beforeRouteLeave() {
    await this.updates.unsubscribe();
  }
}
</script>

<style scoped>
td, th {
  padding: 7px;
} 
.slide-td-move {
  transition: transform .2s;
}

.slide-td-enter-active {
  animation: fadeInUp; /* referring directly to the animation's @keyframe declaration */
  animation-duration: .5s; /* don't forget to set a duration! */
}

.slide-td-leave-active {
  animation: fadeOutUp; /* referring directly to the animation's @keyframe declaration */
  animation-duration: .5s; /* don't forget to set a duration! */
}

</style>