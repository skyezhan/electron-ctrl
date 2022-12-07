<script lang="ts" setup>
import { NButton, NInputGroup, NInputNumber, NSelect } from 'naive-ui'
import { computed, reactive, ref } from 'vue'
import { startProject } from '../api'
import { activeSession, devRecord, sessionRecord } from '../store'

const props = defineProps<{
  sessionId: string
  disableUpdatePort: boolean
}>()

const currentScript = ref('')

const scriptOptions = computed(() => {
  const record = devRecord.value.get(props.sessionId)
  if (record?.scripts && record?.manager) {
    return [...record.scripts.keys()].map(script => ({
      label: `${record.manager} ${script}`,
      value: `${script}`,
    }))
  }
  return []
})

const runScript = () => {
  const dev = devRecord.value.get(props.sessionId)
  dev && startProject(dev.manager, currentScript.value, dev.path, activeSession.value)
}

const debugPort = reactive({
  node: 0,
  window: 0,
})

const updateDebugPort = () => {
  const record = sessionRecord.value.get(activeSession.value)
  if (record) {
    record.nodePort = debugPort.node.toString()
    record.windowPort = debugPort.window.toString()
  }
}
</script>

<template>
  <div>
    <div flex mb-2>
      <NSelect
        v-model:value="currentScript"
        :options="scriptOptions"
        size="small"
        @update:value="() => {}"
      />
      <NButton type="primary" size="small" ml-2 @click="runScript">
        启动
      </NButton>
    </div>
    <div>
      <NInputGroup>
        <NInputNumber
          v-model:value="debugPort.node"
          :show-button="false"
          :disabled="props.disableUpdatePort"
          @update:value="updateDebugPort"
        >
          <template #prefix>
            Node port:
          </template>
        </NInputNumber>
        <NInputNumber
          v-model:value="debugPort.window"
          :show-button="false"
          :disabled="props.disableUpdatePort"
          @update:value="updateDebugPort"
        >
          <template #prefix>
            Chromiun port:
          </template>
        </NInputNumber>
      </NInputGroup>
    </div>
  </div>
</template>
