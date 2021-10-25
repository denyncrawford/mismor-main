<template>
  <div class="absolute left-0 bg-white w-full h-full">
    <heading-back class="ml-10">Visualizar ficha</heading-back>
    <div class="w-full flex-col flex mt-10 pb-20 px-10 relative">
      <!-- <div class="bg-white absolute w-full h-full"></div> -->
      <div ref="printIt" id="printIt" class="p-10 overflow-hidden border-dashed border rounded-lg w-full">
        <div class="w-full flex">
          <div>
            <h1 class="text-2xl font-bold mb-5 whitespace-nowrap flex items-center">Ficha <span class="text-blue-500 ml-2 text-sm">#{{entry.shortId}}</span></h1>
            <div>
              <canvas ref="qr"></canvas>    
            </div>
          </div>
          <div class="flex items-center justify-center w-full">
            <h1 class="font-bold text-3xl text-gray-200 pl-10">Reservado para pipeline y stats <br> V2.0</h1>
          </div>
        </div>
        <h1 class="text-2xl mt-5 font-bold mb-5">Descripción y tags</h1>
        <div>
          <p class="text-gray-500">
            {{entry.details || 'No hay descripción para este corte.'}}
          </p>
          <div class="flex w-full mt-5">
            <div v-for="tag in entry.tags" :key="tag">
              <div class="bg-blue-500 mr-2 rounded-lg px-2">
                <p class="text-white font-bold">{{tag}}</p>
              </div>
            </div>
          </div>
        </div>
        <h1 class="text-2xl mt-5 font-bold mb-5">Clientes</h1>
        <div class="flex w-full mt-5">
          <div v-for="client in entry.clients" :key="client.shortId" class="w-1/2">
            <div class="mr-2 rounded-lg px-2">
              <p class="text-blue-500 font-bold">{{client.name}}</p>
            </div>
          </div>
        </div>
        <h1 class="text-2xl mt-5 font-bold mb-5">Información</h1>
        <div class="mt-5 grid grid-cols-3 gap-4 w-full">
            <div class="border-dashed flex border rounded-lg px-5 py-2">
              <h1 class="text-lg font-bold text-blue-500">#articulo:</h1><h1 class="text-lg ml-2 font-bold"> {{ entry.articulo || '--' }}</h1>
            </div>
            <div class="border-dashed flex border rounded-lg px-5 py-2">
              <h1 class="text-lg font-bold text-blue-500">#corte:</h1><h1 class="text-lg ml-2 font-bold"> {{ entry.corte || '--' }}</h1>
            </div>
            <div class="border-dashed flex border rounded-lg px-5 py-2">
              <h1 class="text-lg font-bold text-blue-500">#dibujo:</h1><h1 class="text-lg ml-2 font-bold"> {{ entry.dibujo || '--' }}</h1>
            </div>
            <div class="border-dashed flex border rounded-lg px-5 py-2">
              <h1 class="text-lg font-bold text-blue-500">cantidad:</h1><h1 class="text-lg ml-2 font-bold"> {{ entry.quantity || 'contar' }}</h1>
            </div>
            <div class="border-dashed flex border rounded-lg px-5 py-2">
              <h1 class="text-lg font-bold text-blue-500">prioridad:</h1><h1 class="text-lg ml-2 font-bold"> {{ entry.priority || 0 }}</h1>
            </div>
        </div>
        <h1 class="text-2xl mt-5 font-bold mb-5">Colores</h1>
        <div class="flex w-full">
          <div v-if="entry.colors?.length || entry.bgColors?.length" class="w-full">
            <div class="rounded-lg border border-dashed p-2">
              <h1 class="text-sm font-bold text-gray-500 mb-2">Colores y orden</h1>
              <div v-show="entry.colors?.length" class="grid grid-cols-8 gap-4">
                <div @mouseenter="color.isIconShow = true" @mouseleave="color.isIconShow = false" :style="{ backgroundColor: color.color }" v-for="color in entry.colors" :key="color.id" class="relative rounded-lg cursor-pointer z-30 h-8 flex items-center justify-center">
                  <h1 class="text-sm text-white font-bold">
                    {{ color.order }}
                  </h1>
                  <div v-show="color.isIconShow" class="absolute bottom-full z-50 mb-5 left-0">
                    <Pantone :pantone="getPantoneObject(color.color)" />
                  </div>
                </div>
              </div>
            </div>
            <div class="rounded-lg border border-dashed mt-5 p-2">
              <h1 class="text-sm font-bold text-gray-500 mb-2">Fondos te tela</h1>
              <div v-show="entry.bgColors?.length" class="grid grid-cols-8 gap-4">
                <div @mouseenter="color.isIconShow = true" @mouseleave="color.isIconShow = false" :style="{ backgroundColor: color.color }" v-for="color in entry.bgColors" :key="color.id" class="relative cursor-pointer rounded-lg h-8 flex items-center justify-center">
                  <div v-show="color.isIconShow" class="absolute z-50 bottom-full mb-5 left-0">
                    <Pantone :pantone="getPantoneObject(color.color)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <h1 class="text-gray-500">No hay colores para mostrar</h1>
          </div>
        </div>
        <h1 class="text-2xl mt-5 font-bold mb-5">Medios</h1>
        <div class="flex">
          <div v-if="entry.assets?.length" class="grid grid-cols-4 gap-4">
            <div v-for="asset in entry.assets" :key="asset.uid" class="w-24 border-dashed border relative rounded-lg overflow-hidden h-24 flex items-center justify-center">
              <div class="absolute w-full h-full filter bg-cover grayscale invert bg-center bg-no-repeat" >

              </div>
              <img class="max-w-full max-h-full z-10" :src="getFileUrl(asset)" alt="">
            </div>
          </div>
          <div v-else>
            <h1 class="text-gray-500">No hay medios para mostrar</h1>
          </div>
        </div>
      </div>
      <div class="w-full text-center flex mt-10">
        <div class="ml-auto mr-auto flex items-center">
          <p @click="print" class="cursor-pointer text-center text-blue-500">Imprimir ficha</p>
          <p class="mx-5"> - </p>
          <router-link :to="{ name: 'edit', params: { id: entry.shortId }}"><p class="cursor-pointer text-center text-blue-500">Editar ficha</p></router-link>
        </div>
      </div>
    </div>
  </div>
</template> 

<script>
import QrCode from 'qrcode'
import { mapState } from "vuex";
import { globalDriver } from '../store.js'
import printJs from 'print-js'
import Pantone from '../components/Pantone.vue'
import { getClosestColor } from "nearest-pantone"
import html2canvas from 'html2canvas';
export default {
  data() {
    return {
      entry: {},
      db: null,
      updates: null,
    }
  },
  components: {
    Pantone
  },
  methods: {
    async print() {
      const canv = await html2canvas(this.$refs.printIt, {
        scale: 5,
        allowTaint: true,
        letterRendering: 1
      });
      const dataURL = canv.toDataURL();
      printJs({
        printable: dataURL,
        type: 'image',
        showModal: true
      })
    }
  },
  computed: {
    ...mapState(['rtm']),
    getFileUrl() {
      return (file) => {
        const imageExtensions = [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "bmp",
          "webp",
          "svg",
        ];
        if (!imageExtensions.includes(file.ext))
         return new TextToImage(file.ext.toUpperCase(), {
            customHeight: 3000,
            maxWidth: 3000,
            width: 3000,
            height: 3000,
            fontSize: 700,
            align: "center",
            valign: "middle",
          }).render().toDataUrl();
        if (!file.path) return "";
        return `http://localhost:8080/ipfs/${file.path}`;
      };
    },
    getPantoneObject() {
      return color => getClosestColor(color)
    }
  },
  async mounted() {
    const { id: shortId } = this.$route.params
    this.db = await globalDriver.getDb()
    this.updates = await this.rtm.subscribe('updates');
    this.updates.on(`update`, async (uShortId) => {
      if (uShortId !== shortId) return;
      const registro = await this.db.collection('entries').findOne({ shortId });
      Object.assign(this.entry, registro);
    });
    const registro = await this.db.collection('entries').findOne({ shortId });
    if (!registro) return this.$router.go(-1);
    Object.assign(this.entry, registro);
    QrCode.toCanvas(this.$refs.qr, shortId, {
      margin: 0,
      width: 150,
      height: 150,
    })
  }
}
</script>