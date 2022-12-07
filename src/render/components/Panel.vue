<script lang="ts" setup>
import { computed, nextTick, ref, watchEffect } from 'vue'
import type { ScrollbarInst } from 'naive-ui'
import {
  NCode,
  NScrollbar,
} from 'naive-ui'
import { activeSession, collapsed, sessionRecord } from '../store'
import type { SessionInfo } from '../../types'
import Inspect from './Inspect.vue'
import Config from './Config.vue'

const session = computed(() => {
  return sessionRecord.value.get(activeSession.value) ?? {} as SessionInfo
})

const logScrollbarRef = ref<ScrollbarInst & HTMLElement | null>(null)

watchEffect(() => {
  if (session.value.log) {
    nextTick(() => {
      logScrollbarRef.value?.scrollTo({ top: 999999 })
    })
  }
  console.log(session.value.appId)
})
</script>

<template>
  <div>
    <div
      v-if="activeSession === '#'"
      :class="{ 'rounded-tr-3': collapsed }"
      :style="{ fontFamily: 'Fira Code, monospace' }"
      font-500 text-xl flex justify-center items-center bg-white h-full
      rounded-tl-3
    >
      Hello World!
    </div>
    <div
      v-else
      :style="{
        maxHeight: 'calc(100vh - 56px)',
        height: 'calc(100vh - 56px)',
      }"
      grid="~ rows-5" gap-3
    >
      <div
        grid="~ cols-2" bg-white rounded-lt-3 rounded-lb-3 row-span-2
        :class="{ 'rounded-3': collapsed }"
      >
        <Inspect
          :pages="session.pages"
          :node-port="String(session.nodePort)"
        />
        <Config
          :app-id="session.appId"
          :pid="session.pid"
        />
      </div>

      <div bg-white rounded-lt-3 row-span-3 overflow-auto :class="{ 'rounded-tr-3': collapsed }">
        <NScrollbar ref="logScrollbarRef" x-scrollable>
          <NCode :code="session.log" language="bash" show-line-numbers m-4 />
        </NScrollbar>
      </div>
    </div>
  </div>
</template>
