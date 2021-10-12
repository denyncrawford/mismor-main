<template>
  <div class="mt-5 flex">
      <h1 @click="$router.go(-1)" class="cursor-pointer px-2 py-1"><ArrowLeftIcon class="h-5 w-5 mr-2"/></h1>
      <h1 class="text-2xl font-bold">
        <slot></slot>
      </h1>
  </div>
</template>

<script>
import { ArrowLeftIcon } from "@heroicons/vue/outline"
export default {
  components: {
    ArrowLeftIcon
  }
}
</script>