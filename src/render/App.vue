<script lang="ts" setup>
import { NLayout } from 'naive-ui'
import Provider from './components/Provider.vue'
import Sidebar from './components/Sidebar.vue'
import MainPanel from './components/Main.vue'
</script>

<template>
  <Provider>
    <NLayout has-sider h-full bg-light-400>
      <Sidebar />
      <MainPanel grow />
    </NLayout>
  </Provider>
</template>

<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: #0f0f0f;
  background-color: #f6f6f6;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

html, body, #app {
  margin: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
</style>
