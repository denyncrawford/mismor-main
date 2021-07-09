<template>
  <div class="px-10 py-5 flex">
    <router-link as="h1" to="/" class="text-2xl font-bold hover:text-blue-700">Mismor</router-link>
    <div class="ml-auto flex">
      <router-link to="/dashboard" class="group cursor-pointer ml-5">
        <HomeIcon class="h-5 w-5 group-hover:text-blue-700 text-gray-500"/>
      </router-link>
      <router-link to="/config" class="group ml-5 cursor-pointer">
        <CogIcon class="h-5 w-5 group-hover:text-blue-700 text-gray-500"/>
      </router-link>
      <div class="group ml-5 cursor-pointer">
        <SearchIcon class="h-5 w-5 group-hover:text-blue-700 text-gray-500"/>
      </div>
    </div>
  </div>
</template>

<script>
import { SearchIcon, 
         HomeIcon, 
         CogIcon 
} from '@heroicons/vue/outline'

export default {
  components: {
    SearchIcon,
    HomeIcon,
    CogIcon
  }
}
</script>