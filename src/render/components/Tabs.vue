<script lang="ts" setup>
import { computed } from 'vue'
import { ChromeTab } from '@soybeanjs/vue-admin-tab'
import { activeSession, appRecord, devRecord, sessionRecord } from '../store'

interface TabOption {
  id: string
  name: string
}

const options = computed((): TabOption[] => {
  const data = [...sessionRecord.value.entries()].map(([id, session]) => {
    const appName = appRecord.value.get(session.appId)?.name
    const devName = devRecord.value.get(session.appId)?.name
    return {
      id,
      name: appName ?? devName ?? '没有名字',
    }
  })
  return [{
    id: '#',
    name: '起始页',
  }].concat(data)
})
</script>

<template>
  <div
    flex items-end bg-white px-1 h-44px
    :style="{ boxShadow: '0 1px 2px #00152914' }"
  >
    <ChromeTab
      v-for="(option, index) in options"
      :key="index"
      h-full select-none
      :is-active="activeSession === option.id"
      primary-color="#18a058"
      :closable="false"
      @click="activeSession = option.id"
    >
      {{ option.name }}
    </ChromeTab>
  </div>
</template>
