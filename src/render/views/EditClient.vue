<template>
  <div class="px-10 w-full absolute">
    <div class="flex items-center mb-5">
      <h1 @click="$router.go(-1)" class="cursor-pointer px-2 py-1"><ArrowLeftIcon class="h-5 w-5 mb-1"/></h1>
      <h1 class="bg-black text-xs px-2 py-1 text-white">Crear cliente</h1>
    </div>
    <h1 class="mb-2">Formulario de cliente</h1>
    <div class="w-9/12 mb-20">
      <div class="flex mt-5">
        <div class="px-5">
          <h1 class="mb-2">Nombre Cliente</h1>
          <el-input
            class="w-32"
            placeholder="Nombre"
            v-model="name"
            clearable>
          </el-input>
        </div>
        <div class="px-5">
          <h1 class="mb-2">Telefono</h1>
          <el-input
            class="w-32"
            placeholder="Numero de telefono"
            v-model="phone"
            clearable>
          </el-input>
        </div>
      </div>
      <div class="flex mt-5">
        <div class="px-5">
          <h1 class="mb-2">Fecha de ingreso</h1>
          <el-date-picker
            v-model="date"
            type="date"
            placeholder="Fecha de ingreso">
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
          <h1 class="mb-2">Archivos Relacionados</h1>
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
import { mapState } from "vuex";
export default {
  data() {
    return {
      db: '',
      name: '',
      details: '',
      phone: '',
      assets: [],
      deletedAssets: [],
      date: new Date(),
      shortId: '',
      form: {
          loading: false,
          disabled: false,
          validations: {
            name: {
              validate: () => {
                return this.name ? true : false;
              },
              message: 'El registro debe de tener al menos un cliente'
            },
            date: {
              validate: () => {
                return this.date ? true : false;
              },
              message: 'Por favor elige la fecha de entrada'
            }
          }
      }
    }
  },
  computed: {
    ...mapState(['dataNode','DBDriver']),
    getFileUrl () {
        return path => `http://localhost:8080/ipfs/${path}`
    },
  },
  components: {
    ArrowLeftIcon,
    PlusIcon,
    FolderIcon,
    EyeIcon,
    TrashIcon
  },
  methods: {
      async save() {
          this.form.disabled = true
          const { name, details, assets, date, phone } = this.$data;
          const prepared = {
            name,
            details,
            date,
            assets,
            phone
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
          await this.db.updateOne({ shortId: this.shortId }, { $set: prepared })
          this.$router.go(-1)
      },
      async selectFile() {
         let file = await dialog.showOpenDialog({ 
          properties: ['openFile'],
          filters: [
            { name: 'All Files', extensions: ['*'] }
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
          for await (const chunk of this.dataNode.cat(file.path)) {
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
    const { id: shortId } = this.$route.params
    if (!await exists(dataFolder)){
      await mkdir(dataFolder);
    };
    this.shortId = shortId;
    const db = await this.DBDriver.getDb()
    this.db = db.collection('clients');
    const clients = await this.db.findOne({ shortId });
    if (!clients) return this.$router.go(-1);
    Object.assign(this.$data, clients);
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