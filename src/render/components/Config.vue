<script lang="ts" setup>
import { NButton } from 'naive-ui'
import { computed } from 'vue'
import { closeApp, restartApp } from '../api'
import { appRecord, sessionRecord } from '../store'
import AppConfig from './AppConfig.vue'
import DevConfig from './DevConfig.vue'

const props = defineProps<{
  appId: string
  pid: number
}>()

const handleClose = () => {
  closeApp(props.pid)
}

const handleRestart = () => {
  const app = appRecord.value.get(props.appId)
  if (!app) {
    return
  }
  restartApp(props.pid, app.id, app.exe)
}

const disableAction = computed(() => {
  return props.appId?.startsWith('/')
    && !sessionRecord.value?.get(props.appId)?.log?.length
})
</script>

<template>
  <div flex="~ col" border="l-1 #00152914" my-4 py-2 px-3 justify-between>
    <AppConfig
      v-if="!props.appId?.startsWith('/')"
      :session-id="props.appId"
    />
    <DevConfig
      v-else
      :session-id="props.appId"
      :disable-update-port="disableAction"
    />
    <div self-end>
      <NButton
        type="error"
        size="small"
        mr-2
        :disabled="disableAction"
        @click="handleClose"
      >
        关闭应用
      </NButton>
      <NButton
        type="warning"
        size="small"
        :disabled="disableAction"
        @click="handleRestart"
      >
        重启应用
      </NButton>
    </div>
  </div>
</template>
