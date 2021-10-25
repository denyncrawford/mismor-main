<template>
  <div class="w-40 bg-white z-50 overflow-hidden rounded-lg shadow-md">
    <div :style="{ backgroundColor: pantone.hex }" class="h-40 w-40"></div>
    <div class="p-2">
      <h1 class="font-bold">PANTONE</h1>
      <h1 class="text-sm">{{ pantone.pantone }} <span class="text-xs text-gray-400">({{pantone.hex}})</span></h1>
      <h1 class="text-sm capitalize text-gray-500">{{ formatName }}</h1>
    </div>
  </div>
</template>
<script>
export default {
  props: ['pantone'],
  computed: {
    formatName() {
      return this.pantone.name.replaceAll('-', ' ')
    }
  }
}
</script>