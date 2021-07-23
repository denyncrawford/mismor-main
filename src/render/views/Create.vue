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
            value-key="name"
            placeholder="Seleccionar cliente/s"
          >
            <el-option
            v-for="item in availbleClients"
            :key="item.shortId"
            :label="item.name"
            :value="prepareClient(item)">
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
      <div class="flex items-center mt-5">
        <div class="px-5">
          <h1 class="mb-2">Cantidad</h1>
          <el-input
            class="w-32"
            placeholder="Numero de prendas"
            v-model="quantity"
            clearable>
          </el-input>
        </div>
        <div class="px-5">
          <h1 class="mb-2">Estado</h1>
          <el-input
            placeholder="Seleccionar estado"
            v-model="state"
            clearable>
          </el-input>
        </div>
        <div class="px-5">
          <el-progress color="#1d4ed8" type="circle" :percentage="Number(state)"></el-progress>
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
      <button :disabled="form.disabled" @click="save" class="mt-5 ml-5 bg-black text-xs px-2 py-1 text-white">Guardar</button> 
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
const { promisify, log } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists)
const mkdir = promisify(fs.mkdir)
const unlink = promisify(fs.unlink)
const { app, dialog } = require('electron').remote;
const programFolder = app.getPath('userData')
const dataFolder = join(programFolder, '/data')
import { globalDriver } from './../store';
import { mapState } from "vuex";
export default {
  data() {
    return {
      db: '',
      updates: null,
      availbleClients: [],
      clients: [],
      corte: '',
      articulo: '',
      dibujo: '',
      details: '',
      assets: [],
      quantity: '',
      state: 30,
      deletedAssets: [],
      dates: {
          start: '',
          end: ''
      },
      priority: 0,
      form: {
          loading: false,
          disabled: false,
          validations: {
            clients: {
              validate: () => {
                return this.clients.length ? true : false;
              },
              message: 'El registro debe de tener al menos un cliente'
            },
            dates: {
              validate: () => {
                return this.dates.start ? true : false;
              },
              message: 'Por favor elige la fecha de entrada'
            }
          }
      }
    }
  },
  computed: {
    ...mapState(['dataNode', 'rtm']),
    getFileUrl () {
        return path => `http://localhost:8080/ipfs/${path}`
    },
    prepareClient() {
      return item => ({ shortId: item.shortId, name: item.name })
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
         const clients = this.db.collection('clients');
         const re = { $regex: query, $options:"i" }
         this.availbleClients = await clients.find({$or:[{"name": re}, {"id": re}]}).toArray();
         this.form.loading = false;
         if (query == '') return this.availbleClients = [];
      },
      async save() {
          this.form.disabled = true;
          const entries = this.db.collection('entries');
          const { quantity, state, clients, corte, articulo, dibujo, details, assets, priority, dates } = this.$data;
          const prepared = {
            clients,
            corte,
            articulo,
            dibujo,
            details,
            dates,
            assets,
            priority,
            quantity, 
            state,
            shortId: nanoid(10)
          }
          for (const key of Object.keys(this.form.validations)) {
            const { validate, message } = this.form.validations[key]
            if (!validate()) {
              return this.$notify({
                title: 'Falta campo requerido',
                message,
                type: 'error',
                position: 'bottom-right'
              });
            }
          }
          await entries.insert(prepared)
          await this.updates.trigger('update', prepared.shortId);
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
        await Promise.all(filePaths.map(async path => {
          const filepath = `/${basename(path)}`
          const stream = fs.ReadStream(path)
          await this.dataNode.files.write(filepath, stream, {
            create: true
          });
          const { cid: { string: fileCid } } = await this.dataNode.files.stat(filepath);
          this.assets.push({
            path: fileCid,
            ext: path.split('.').pop(),
            filename: basename(path),
            uid: nanoid(),
            showActions: false,
          })
        }))
      },
      async openFile(file) {
        const joined = await this.ensureFile(file)
        require('child_process').exec(`start ${joined}`);
      },
      async openFolder(file) {
        const joined = await this.ensureFile(file);
        require('child_process').exec(`explorer.exe /select,${joined}`);
      },
      async ensureFile(file) {
        const filename = `${file.path}.${file.ext}`;
        const joined = join(dataFolder, filename)
        if (!await exists(joined)) {
          const fStream = fs.createWriteStream(joined);
          for await(const chunk of this.dataNode.cat(file.path)) {
            fStream.write(chunk)
          }
          fStream.end();
        }
        return joined
      },
      async deleteFile(file) {
        const joined = join(dataFolder, `${file.path}.${file.ext}`)
        this.deletedAssets.push(file)
        if (await exists(joined)) await unlink(joined);
        await this.dataNode.files.rm(`/${file.filename}`)
        this.assets = this.assets.filter(e => e.uid != file.uid)
      }
  },
  async mounted() {
    if (!await exists(dataFolder)){
      await mkdir(dataFolder);
    }
    this.db = await globalDriver.getDb()
    this.updates = await this.rtm.subscribe('updates');
    this.updates.on('update', (data) => {
      console.log(data)
    })
  },
  async beforeRouteLeave() {
    await this.updates.unsubscribe();
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