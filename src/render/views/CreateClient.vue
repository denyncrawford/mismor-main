<template>
  <div class="px-10 w-full absolute">
    <heading-back>Crear Cliente</heading-back>
    <h1 class="mb-2 ml-5 mt-5">Formulario de cliente</h1>
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
          <file-upload :assets="assets" :deletedAssets="deletedAssets"/>
        </div>
      </div>
      <button :disabled="form.disabled" @click="save" class="mt-5 ml-5 bg-black text-xs px-2 py-1 text-white">Guardar</button> 
    </div>
  </div>
</template>

<script>
import { 
  ArrowLeftIcon
} from '@heroicons/vue/outline'
import { nanoid } from 'nanoid'
import { globalDriver } from "./../store";
import FileUpload from '../components/FileUpload.vue'
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
  components: {
    ArrowLeftIcon,
    FileUpload
  },
  methods: {
      async save() {
          this.form.disabled = true;
          const clients = this.db.collection('clients');
          const { name, details, assets, date, phone } = this.$data;
          const prepared = {
            name,
            details,
            date,
            assets,
            phone,
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
          await clients.insert(prepared)
          this.$router.go(-1)
      }
  },
  async mounted() {
    this.db = await globalDriver.getDb()
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