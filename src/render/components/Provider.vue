<script lang="ts" setup>
import { defineComponent, h } from 'vue'
import type { GlobalThemeOverrides } from 'naive-ui'
import { NConfigProvider, NMessageProvider, useMessage } from 'naive-ui'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import javascript from 'highlight.js/lib/languages/javascript'

const NaiveProviderContent = defineComponent({
  setup() {
    window.$message = useMessage()
    return () => h('div')
  },
})

const theme: GlobalThemeOverrides = {}

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('javascript', javascript)
</script>

<template>
  <NConfigProvider abstract :theme-overrides="theme" :hljs="hljs">
    <NMessageProvider placement="bottom">
      <slot></slot>
      <NaiveProviderContent />
    </NMessageProvider>
  </NConfigProvider>
</template>

<style>
.n-message-container.n-message-container--bottom {
  margin: 10px;
}

.n-menu-item-content__arrow {
  color: rgb(51, 54, 57)!important;
}
</style>
