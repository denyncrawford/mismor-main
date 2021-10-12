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
  ArrowLeftIcon
} from "@heroicons/vue/outline";
import { nanoid } from "nanoid";
import { globalDriver } from "./../store";
import { mapState } from "vuex";
import FileUpload from '../components/FileUpload.vue';
export default {
  data() {
    return {
      db: "",
      updates: null,
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
  },
  components: {
    ArrowLeftIcon,
    FileUpload
  },
  methods: {
    log(val) {
      console.log(val);
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