import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import Unocss from 'unocss/vite'
import optimizer from 'vite-plugin-optimizer'
import { devPlugin, getReplacer } from './plugins/dev'

export default defineConfig({
  plugins: [
    optimizer(getReplacer()),
    devPlugin(),
    Vue(),
    VueJsx(),
    Unocss(),
  ],
  build: {
    rollupOptions: {
      plugins: [],
    },
  },
})
