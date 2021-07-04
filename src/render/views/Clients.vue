<template>
  <div class="px-10 w-full absolute">
    <div class="flex items-center mb-5">
      <h1 @click="this.$router.go(-1)" class="cursor-pointer px-2 py-1"><ArrowLeftIcon class="h-5 w-5 mb-1"/></h1>
      <h1 class="bg-black text-xs px-2 py-1 text-white">Clientes</h1>
    </div>
    <h1 class="mb-2">Crear Cliente</h1>
    <div class="flex mb-5">
      <button class="hover:border-blue-700 hover:text-blue-700 rounded font-bold px-4 py-2 text-sm border border-dashed border-gray-400">
        <PlusIcon class="h-5 w-5 mb-1"/>
        Crear Cliente
      </button>
    </div>
    <div>
      <h1 class="mb-2">Lista de clientes</h1>
      <div class="p-10 w-full rounded border border-dashed border-gray-400">

      </div>
    </div>
  </div>
</template>

<script>
import { PlusIcon, ArrowLeftIcon } from '@heroicons/vue/outline'
export default {
  components: {
    PlusIcon,
    ArrowLeftIcon
  }
}
</script>