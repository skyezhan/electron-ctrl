<script lang="ts" setup>
import { NButton, NTag } from 'naive-ui'
import type { PageInfo } from '../../types'
import { openDevToolsInLocal, openWindow } from '../api'

const props = defineProps<{
  pages: PageInfo[]
  nodePort: string
}>()

const onLocalButtonClick = (url: string) => {
  openDevToolsInLocal(props.nodePort, url)
}

const onRemoteButtonClick = (rawUrl: string) => {
  openWindow(
    rawUrl
      .replace(/^\/devtools/, 'devtools://devtools/bundled')
      .replace(/^chrome-devtools:\/\//, 'devtools://'),
  )
}

const getTagType = (type: string) => {
  return type === 'node' ? 'success' : type === 'page' ? 'info' : 'warning'
}
</script>

<template>
  <div my-4 px-3 un-children="grid grid-cols-5 justify-items-center content-center">
    <div>
      <div col-span-2>
        标题
      </div>
      <div col-span-1>
        类型
      </div>
      <div col-span-2>
        开发者工具
      </div>
    </div>
    <div border="b-1 #00152914" mx-4 mt-2 mb-3></div>
    <div v-for="(page, index) in props.pages" :key="index" my-2>
      <NTag max-w="30" col-span-2 un-children="overflow-hidden text-ellipsis">
        {{ page.title || '获取中...' }}
      </NTag>
      <NTag :type="getTagType(page.type)" col-span-1>
        {{ page.type }}
      </NTag>
      <div col-span-2 grid="~ cols-2" gap-2>
        <NButton
          v-if="page.type !== 'node'"
          size="small"
          px-1
          @click="() => onLocalButtonClick(page.url)"
        >
          Local
        </NButton>
        <div v-else></div>
        <NButton
          size="small"
          px-2
          @click="() => onRemoteButtonClick(page.devtoolsFrontendUrl)"
        >
          Remote
        </NButton>
      </div>
    </div>
  </div>
</template>
