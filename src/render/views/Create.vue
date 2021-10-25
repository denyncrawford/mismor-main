<template>
  <div class="px-10 w-full absolute">
    <heading-back>Crear Ficha</heading-back>
    <h1 class="mb-2 ml-5 mt-5">Formulario de ingreso</h1>
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
              :value="prepareClient(item)"
            >
            </el-option>
          </el-select>
        </div>
        <div class="px-5">
          <h1 class="mb-2"># Corte</h1>
          <el-input
            class="w-32"
            placeholder="Numero de corte"
            v-model="corte"
            clearable
          >
          </el-input>
        </div>
        <div class="px-5">
          <h1 class="mb-2">Articulo</h1>
          <el-input placeholder="Numero de corte" v-model="articulo" clearable>
          </el-input>
        </div>
      </div>
      <div class="flex mt-5">
        <div class="px-5">
          <h1 class="mb-2"># Dibujo</h1>
          <el-input placeholder="Numero de dibujo" v-model="dibujo" clearable>
          </el-input>
        </div>
        <div class="px-5 flex-grow">
          <h1 class="mb-2"># Prioridad</h1>
          <el-slider v-model="priority" :step="20" show-stops show-input>
          </el-slider>
        </div>
      </div>
      <div class="flex mt-5">
        <div class="px-5">
          <h1 class="mb-2">Fechas</h1>
          <el-date-picker
            v-model="dates.start"
            type="date"
            placeholder="Fecha de entrada"
          >
          </el-date-picker>
          <el-date-picker
            v-model="dates.end"
            type="date"
            class="ml-5"
            placeholder="Fecha de salida"
          >
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
            clearable
          >
          </el-input>
        </div>
        <div class="px-5">
          <h1 class="mb-2">Estado</h1>
          <el-input placeholder="Seleccionar estado" v-model="state" clearable>
          </el-input>
        </div>
        <div class="px-5">
          <el-progress
            color="#1d4ed8"
            type="circle"
            :percentage="Number(state)"
          ></el-progress>
        </div>
      </div>
      <div class="flex flex-col items-center mt-5">
        <div class="px-5">
          <h1 class="mb-2">Colores de fondo</h1>
          <div class="grid relative gap-4 grid-cols-8">
            <transition-group name="slide-down">
              <div @click="bgColors.splice(i, 1)" @mouseenter="color.isIconShow = true" @mouseleave="color.isIconShow = false"  :style="{ backgroundColor: color.color }" v-for="(color, i) in bgColors" :key="color.id" class="h-16 cursor-pointer w-16 relative flex items-center justify-center rounded-lg border border-dashed hover:border-blue-500">
                <TrashIcon v-show="color.isIconShow" class="w-5 h-5 text-black"/>
                <div v-show="color.isIconShow" class="absolute z-50 bottom-full mb-5 left-0">
                    <Pantone :pantone="getPantoneObject(color.color)" />
                </div>
              </div>
            </transition-group>
            <div @click="isPickerOpen = !isPickerOpen" class="h-16 cursor-pointer w-16 relative flex items-center justify-center rounded-lg border border-dashed hover:border-blue-500">
              <PlusIcon class="w-5 h-5 text-black"/>
            </div>
            <transition name="slide-down">
              <div v-show="isPickerOpen" class="relative20">
                <div class="absolute bottom-0">
                  <ColorPicker
                    class=" z-40"
                    theme="light"
                    :sucker-hide="true"
                    :color="currentColor"
                    @changeColor="changeBgColor"
                  />
                  <div class="mt-2 flex">
                    <button @click="isPickerOpen = false" class="ml-auto rounded text-xs py-1 px-2 mr-2 hover:bg-red-500 font-bold">Cancelar</button>
                    <button @click="addBgColor" class="rounded text-xs py-1 px-2 border border-dashed hover:border-transparent hover:bg-blue-500 hover:text-white font-bold">Aceptar</button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
        <div class="mt-5 ml-4">
          <h1 class="mb-2">Colores de estampa y orden</h1>
           <draggable 
              tag="transition-group" :component-data="{ tag: 'div', type: 'transition-group', name: 'slide-down'}"
              class="grid grid-cols-8 gap-4"
              v-model="colors"
              @end="setAssetOrderByDrag"
              item-key="id">
                <template #item="{ element }">
                  <div @mouseenter="element.isIconShow = true" @mouseleave="element.isIconShow = false"  :style="{ backgroundColor: element.color }" class="h-16 cursor-pointer w-16 relative flex items-center justify-center rounded-lg border border-dashed hover:border-blue-500">
                    <TrashIcon @click="colors.splice(colors.findIndex(e => e.id == element.id), 1); setAssetOrderByDrag()" v-show="element.isIconShow" class="w-5 h-5 text-black"/>
                    <h1 class="font-bold" v-show="!element.isIconShow"> {{ element.order }} </h1>
                    <div v-show="element.isIconShow" class="absolute z-50 bottom-full mb-5 left-0">
                      <Pantone :pantone="getPantoneObject(element.color)" />
                    </div>
                  </div>
                </template>
                <template #footer>
                  <div class="relative">
                    <div @click="isPicker1Open = !isPicker1Open" class="h-16 cursor-pointer w-16 relative flex items-center justify-center rounded-lg border border-dashed hover:border-blue-500">
                      <PlusIcon class="w-5 h-5 text-black"/>
                    </div>
                    <transition name="slide-down">
                      <div v-show="isPicker1Open" class="relative20">
                        <div class="absolute bottom-0">
                          <ColorPicker
                            class="z-40"
                            theme="light"
                            :sucker-hide="true"
                            :color="currentColor"
                            @changeColor="changeBgColor"
                          />
                          <div class="mt-2 flex">
                            <button @click="isPicker1Open = false" class="ml-auto rounded text-xs py-1 px-2 mr-2 hover:bg-red-500 font-bold">Cancelar</button>
                            <button @click="addColor" class="rounded text-xs py-1 px-2 border border-dashed hover:border-transparent hover:bg-blue-500 hover:text-white font-bold">Aceptar</button>
                          </div>
                        </div>
                      </div>
                    </transition>
                  </div>
                </template>
            </draggable>
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
            clearable
          >
          </el-input>
          <h1 class="mb-2 mt-5">Tags</h1>
          <el-select
            :rows="2"
            placeholder="Escribir tags"
            v-model="tags"
            class="w-full"
            clearable
            multiple
            filterable
            allow-create
            default-first-option
          >
          </el-select>
        </div>
      </div>
      <div class="flex mt-5">
        <div class="px-5">
          <h1 class="mb-2">Archivos</h1>
          <file-upload :assets="assets" :deletedAssets="deletedAssets"/>
        </div>
      </div>
      <button
        :disabled="form.disabled"
        @click="save"
        class="mt-5 ml-5 bg-black text-xs px-2 py-1 text-white"
      >
        Guardar
      </button>
    </div>
  </div>
</template>

<script>
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon
} from "@heroicons/vue/outline";
import { ColorPicker } from 'vue-color-kit'
import 'vue-color-kit/dist/vue-color-kit.css'
import { nanoid } from "nanoid";
import { globalDriver } from "./../store";
import { mapState } from "vuex";
import FileUpload from '../components/FileUpload.vue';
import Pantone from '../components/Pantone.vue';
import Draggable from 'vuedraggable'
import { getClosestColor } from "nearest-pantone"
export default {
  data() {
    return {
      db: "",
      updates: null,
      isPickerOpen: false,
      isPicker1Open: false,
      availbleClients: [],
      clients: [],
      corte: "",
      articulo: "",
      dibujo: "",
      details: "",
      assets: [],
      quantity: "",
      pipeline: "",
      hook: "",
      currentColor: '#59c7f9',
      bgColors: [],
      colors: [],
      state: Math.floor(Math.random() * 100),
      tags: [],
      deletedAssets: [],
      dates: {
        updatedAt: new Date().getTime(),
        start: "",
        end: "",
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
            message: "El registro debe de tener al menos un cliente",
          },
          dates: {
            validate: () => {
              return this.dates.start ? true : false;
            },
            message: "Por favor elige la fecha de entrada",
          },
        },
      },
    };
  },
  computed: {
    ...mapState(["rtm"]),
    prepareClient() {
      return (item) => ({ shortId: item.shortId, name: item.name });
    },
    getPantoneObject() {
      return color => getClosestColor(color)
    }
  },
  components: {
    ArrowLeftIcon,
    FileUpload,
    PlusIcon,
    ColorPicker,
    TrashIcon,
    Draggable,
    Pantone
  },
  methods: {
    log(val) {
      console.log(val);
    },
    addBgColor() {
      this.bgColors.push({
        color: this.currentColor,
        id: nanoid(),
        isIconShow: false
      })
      this.isPickerOpen = false
    },
    addColor() {
      this.colors.push({
        color: this.currentColor,
        id: nanoid(),
        isIconShow: false,
        order: this.colors.length + 1
      })
      this.isPicker1Open = false
    },
    setAssetOrderByDrag() {
      this.colors.forEach((color, index) => {
        color.order = index + 1;
      });
    },
    changeBgColor(color) {
        this.currentColor = color.hex
    },
    async fetchClients(query) {
      this.form.loading = true;
      const clients = this.db.collection("clients");
      const re = { $regex: query, $options: "i" };
      this.availbleClients = await clients
        .find({ $or: [{ name: re }, { id: re }] })
        .toArray();
      this.form.loading = false;
      if (query == "") return (this.availbleClients = []);
    },
    async save() {
      this.form.disabled = true;
      const entries = this.db.collection("entries");
      const {
        quantity,
        state,
        clients,
        corte,
        bgColors,
        colors,
        articulo,
        dibujo,
        details,
        assets,
        priority,
        dates,
        tags,
      } = this.$data;
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
        tags,
        bgColors,
        colors,
        shortId: nanoid(10),
      };
      for (const key of Object.keys(this.form.validations)) {
        const { validate, message } = this.form.validations[key];
        if (!validate()) {
          return this.$notify({
            title: "Falta campo requerido",
            message,
            type: "error",
            position: "bottom-right",
          });
        }
      }
      await entries.insert(prepared);
      this.updates.trigger("update", prepared.shortId);
      this.$router.go(-1);
    }
  },
  async mounted() {
    this.db = await globalDriver.getDb();
    this.updates = await this.rtm.subscribe("updates");
  },
  async beforeRouteLeave() {
    await this.updates.unsubscribe();
  },
};
</script>

<style scoped>
.slide-down-enter-active {
  animation: fadeInUp; /* referring directly to the animation's @keyframe declaration */
  animation-duration: 0.5s; /* don't forget to set a duration! */
}
.slide-down-leave-active {
  animation: fadeOutDown; /* referring directly to the animation's @keyframe declaration */
  animation-duration: 0.5s; /* don't forget to set a duration! */
}
</style>