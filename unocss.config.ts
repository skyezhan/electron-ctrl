import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
  ],
  shortcuts: [],
  rules: [
    [
      /^filter="(.+)"$/,
      ([_, fn]) => {
        return {
          filter: fn,
        }
      },
    ],
  ],
  theme: {},
})
