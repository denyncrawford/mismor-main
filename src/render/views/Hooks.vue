<template>
  <div class="px-10 w-full absolute">
    <div class="flex items-center mb-5">
      <h1 @click="$router.go(-1)" class="cursor-pointer px-2 py-1"><ArrowLeftIcon class="h-5 w-5 mb-1"/></h1>
      <h1 class="bg-black text-xs px-2 py-1 text-white">Hook pipelines</h1>
    </div>
    <h1 class="mb-5">Administrar pipelines</h1>
    <div class="w-full">
      <draggable 
        tag="transition-group" :component-data="{ tag: 'div', type: 'transition-group', name: 'flip'}"
        class="w-full grid grid-cols-3 gap-4"
        v-model="pipelines" 
        group="people" 
        @start="drag=true" 
        @end="drag=false" 
        item-key="_id">
        <template #header>
          <div key="createPipe" class="flex border border-dashed rounded-lg group hover:border-blue-500 cursor-pointer p-5 items-center justify-center">
            <h1 class="group-hover:text-blue-500 text-md font-bold">Crear pipeline</h1>
            <PlusIcon class="group-hover:text-blue-500 ml-auto h-10 w-10 text-gray-200"/>
          </div>
        </template>
        <template #item="{element}">
          <div class="flex border border-dashed rounded-lg hover:border-blue-500 cursor-pointer p-5">
            <el-tooltip :show-after="2000" :content="element.description" placement="top">
              <div class="flex flex-col">
                <h1 class="text-md font-bold">{{ element.name }}</h1>
                <h1 class="text-xs">{{ elipsis(20, element.description) }}</h1>
                <h1 class="text-xs">Hooks: {{element.hooks?.length}}</h1>
              </div>
            </el-tooltip>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script>
import { ArrowLeftIcon, PlusIcon } from '@heroicons/vue/outline'
import Draggable from 'vuedraggable'
import { globalDriver } from '../store.js'
export default {
  data () {
    return {
      db: null,
      drag: true,
      pipelines: [
        {
          _id: '1',
          name: 'Pipeline 1',
          description: 'Pipeline 1 description',
          hooks: [
            {
              _id: '1',
              name: 'Hook 1',
              description: 'Hook 1 description',
              pipeline: '1'
            },
            {
              _id: '2',
              name: 'Hook 2',
              description: 'Hook 2 description',
              pipeline: '1'
            }
          ]
        },
        {
          _id: '2',
          name: 'Pipeline 2',
          description: 'Pipeline 2 description',
          hooks: [
            {
              _id: '3',
              name: 'Hook 3',
              description: 'Hook 3 description',
              pipeline: '2'
            },
            {
              _id: '4',
              name: 'Hook 4',
              description: 'Hook 4 description',
              pipeline: '2'
            }
          ]
        }
      ]
    }
  },
  components: {
    ArrowLeftIcon,
    PlusIcon,
    Draggable
  },
  computed: {
    elipsis() {
      return (max, text) => { 
        if (text.length > max) {
        return text.substring(0, max) + '...'
        }
        return text
      }
    },
  },
  methods: {
    async getPipelines () {
      const db = await globalDriver.getDB()
      const pipelines = await db.collection('pipelines').find({}).toArray()
      this.pipelines = pipelines
    }
  }
}
</script>

<style scoped>
.flip-move {
  transition: transform 0.5s;
}

</style>