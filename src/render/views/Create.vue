<template>
  <div class="px-10 w-full absolute">
    <div class="flex items-center mb-5">
      <h1 @click="$router.go(-1)" class="cursor-pointer px-2 py-1"><ArrowLeftIcon class="h-5 w-5 mb-1"/></h1>
      <h1 class="bg-black text-xs px-2 py-1 text-white">Crear ingreso</h1>
    </div>
    <h1 class="mb-2">Formulario de ingreso</h1>
    <div class="w-9/12 mb-20">
      <div class="flex mt-5">
        <div class="px-5">
          <h1 class="mb-2">Cliente/s</h1>
          <el-select
            v-model="clients" 
            filterable 
            multiple 
            remote
            :remote-method="fetchClients"
            :loading="form.loading"
            placeholder="Seleccionar cliente/s"
          >
            <el-option
            v-for="item in availbleClients"
            :key="item"
            :label="item"
            :value="item">
            </el-option>
          </el-select>
        </div>
        <div class="px-5">
          <h1 class="mb-2"># Corte</h1>
          <el-input
            class="w-32"
            placeholder="Numero de corte"
            v-model="corte"
            clearable>
          </el-input>
        </div>
        <div class="px-5">
          <h1 class="mb-2">Articulo</h1>
          <el-input
            placeholder="Numero de corte"
            v-model="articulo"
            clearable>
          </el-input>
        </div>
      </div>
      <div class="flex mt-5">
        <div class="px-5">
          <h1 class="mb-2"># Dibujo</h1>
          <el-input
            placeholder="Numero de dibujo"
            v-model="dibujo"
            clearable>
          </el-input>
        </div>
        <div class="px-5 flex-grow">
          <h1 class="mb-2"># Prioridad</h1>
          <el-slider
            v-model="priority"
            :step="20"
            show-stops
            show-input>
          </el-slider>
        </div>
      </div>
      <div class="flex mt-5">
        <div class="px-5">
          <h1 class="mb-2">Fechas</h1>
          <el-date-picker
            v-model="dates.start"
            type="date"
            placeholder="Fecha de entrada">
          </el-date-picker>
          <el-date-picker
            v-model="dates.end"
            type="date"
            class="ml-5"
            placeholder="Fecha de salida">
          </el-date-picker>
        </div>
      </div>
      <div class="flex mt-5">
        <div class="px-5 w-full">
          <h1 class="mb-2">Detalles</h1>
          <el-input
            type="textarea"
            :rows="2"
            placeholder="Escribir descripción"
            v-model="details"
            class="w-full"
            clearable>
          </el-input>
        </div>
      </div>
      <div class="flex mt-5">
        <div class="px-5">
          <h1 class="mb-2">Archivos</h1>
          <div class="grid grid-cols-3 gap-4">
            <transition-group name="slide-down">
              <div @mouseenter="file.showActions = true"  @mouseleave="file.showActions = false" v-for="file in assets" :style="{ 'background-image': 'url(' + getFileUrl(file.path) + ')' }" :key="file.uid" class="w-32 h-32 cursor-pointer rounded border bg-cover bg-center bg-no-repeat border-gray-400 border-dashed flex items-center justify-center">
                <div v-show="file.showActions" class="flex items-center justify-center w-full h-full bg-opacity-50 bg-gray-900 transition">
                  <div class="flex">
                    <EyeIcon @click="openFile(file)" class="hover:text-blue-700 w-5 h-5 mx-2 text-white"/>
                    <FolderIcon @click="openFolder(file)" class="hover:text-blue-700 w-5 h-5 mx-2 text-white"/>
                    <TrashIcon @click="deleteFile(file)" class="hover:text-blue-700 w-5 h-5 mx-2 text-white"/>
                  </div>
                </div>
              </div>
            </transition-group>
            <div @click="selectFile" class="w-32 h-32 cursor-pointer hover:border-blue-700 rounded border border-gray-400 border-dashed flex items-center justify-center">
              <PlusIcon class="w-5 h-5"/>
            </div>
          </div>
        </div>
      </div>
      <button @click="save" class="mt-5 ml-5 bg-black text-xs px-2 py-1 text-white">Guardar</button> 
    </div>
  </div>
</template>

<script>
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  FolderIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/vue/outline'
import { nanoid } from 'nanoid'
const { join,basename } = require('path');
const fs = require('fs');
const { promisify } = require('util');
const copyFile = promisify(fs.copyFile);
const exists = promisify(fs.exists)
const mkdir = promisify(fs.mkdir)
const { app, dialog } = require('electron').remote;
const programFolder = app.getPath('userData')
const dataFolder = join(programFolder, '/data')
import { database } from './../store.js'
export default {
  data() {
    return {
      db: '',
      availbleClients: [],
      clients: [],
      corte: '',
      articulo: '',
      dibujo: '',
      details: '',
      assets: [],
      deletedAssets: [],
      dates: {
          start: '',
          end: ''
      },
      priority: 0,
      form: {
          loading: false,
      }
    }
  },
  computed: {
    getFileUrl() {
      return (file) => {
        return new URL(`file:///${file}`).href;
      }
    }
  },
  components: {
    ArrowLeftIcon,
    PlusIcon,
    FolderIcon,
    EyeIcon,
    TrashIcon
  },
  methods: {
      async fetchClients(query) {
         this.form.loading = true;
         const res = await fetch('https://jsonplaceholder.typicode.com/users');
         const data = await res.json()
         const re = new RegExp(query, 'i');
         this.availbleClients = data.map(e => e.name).filter(n => re.test(n))
         this.form.loading = false;
         if (query == '') return this.availbleClients = [];
      },
      async save() {
          const entries = this.db.collection('entries');
          const { clients, corte, articulo, dibujo, details, assets: preparedAssets, priority, dates } = this.$data;
          const assets = preparedAssets.map(a => {
            a.origin = a.path
            a.path = join(dataFolder, `${a.uid}.${a.ext}`)
            return a;
          })
          await Promise.all(assets.map(async a => {
            await copyFile(a.origin , a.path)
          }))
          await entries.insert({
            clients,
            corte,
            articulo,
            dibujo,
            details,
            dates,
            assets,
            priority,
            shortId: nanoid(10)
          })
          this.$router.go(-1)
      },
      async selectFile() {
         let file = await dialog.showOpenDialog({ 
          properties: ['openFile'],
          filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'pdf', 'ai', 'psd', 'wep', 'svg'] }
          ]
        });
        const { filePaths } = file;
        filePaths.forEach(path => {
          this.assets.push({
            path,
            ext: path.split('.').pop(),
            filename: basename(path),
            uid: nanoid(),
            showActions: false
          })
        })
      },
      openFile(file) {
        const filePath = file.path;
        require('child_process').exec(`start ${filePath}`);
      },
      openFolder(file) {
        const filePath = file.path;
        require('child_process').exec(`explorer.exe /select,${filePath}`);
      },
      deleteFile(file) {
        this.deletedAssets = [...this.deletedAssets, ...this.assets.filter(e => e.uid == file.uid)]
        this.assets = this.assets.filter(e => e.uid != file.uid)
      }
  },
  async mounted() {
    if (!await exists(dataFolder)){
      await mkdir(dataFolder);
    }
    this.db = await database()
  }
}
</script>

<style scoped>
.slide-down-enter-active {
  animation: fadeInUp; /* referring directly to the animation's @keyframe declaration */
  animation-duration: .5s; /* don't forget to set a duration! */
}
.slide-down-leave-active {
  animation: fadeOutDown; /* referring directly to the animation's @keyframe declaration */
  animation-duration: .5s; /* don't forget to set a duration! */
}
</style>