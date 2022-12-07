<script lang="ts" setup>
import Tabs from './Tabs.vue'
import Panel from './Panel.vue'
import { collapsed } from '../store'
</script>

<template>
  <div flex="~ col" class="min-w-750px">
    <Tabs
      rounded-bl-3 duration-300
      :class="[collapsed ? 'mx-3 rounded-br-3' : 'ml-3']"
    />
    <Panel
      grow mt-3
      :class="[collapsed ? 'mx-3' : 'ml-3']"
    />
  </div>
</template>
