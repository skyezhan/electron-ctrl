<script lang="ts" setup>
import fs from 'fs'
import { NButton, NButtonGroup, NInput } from 'naive-ui'
import { reactive, watchEffect } from 'vue'
import { getFilePathAndValue } from '../api'

const props = defineProps<{
  appId: string
}>()

interface EnvFile {
  path: string
  raw: string
}

const key = 'env-config-path'

const getLocalData = () => {
  const data = (JSON.parse(localStorage.getItem(key) ?? '{}'))
  return data as Record<string, Omit<EnvFile, 'raw'>>
}

const updateLocalData = (id: string, data: Omit<EnvFile, 'raw'>) => {
  const localData = getLocalData()
  localData[id] = data
  localStorage.setItem(key, JSON.stringify(localData))
}

const env = reactive<EnvFile>({
  path: getLocalData()[props.appId]?.path || '',
  raw: '',
})

const selectFile = () => {
  getFilePathAndValue().then((data) => {
    env.path = data.path
    env.raw = data.value
    updateLocalData(props.appId, { path: env.path })
  })
}

const readEnvFile = () => {
  env.path && fs.readFile(env.path, (err, data) => {
    if (!err) {
      env.raw = data.toString()
    } else {
      window.$message?.error('读配置文件出问题啦!~')
    }
  })
}

const saveEnvFile = () => {
  env.path && fs.writeFile(env.path, env.raw, {}, (err) => {
    if (err) {
      window.$message?.error('额, 保存失败了')
    } else {
      window.$message?.success('保存成功')
    }
  })
}

readEnvFile()

watchEffect(() => {
  if (props.appId) {
    env.path = getLocalData()[props.appId]?.path || ''
    env.raw = ''
  }
})
</script>

<template>
  <div>
    <div flex mb-2>
      <NInput
        v-model:value="env.path"
        size="small"
        placeholder="配置文件路径"
      />
      <NButtonGroup pl-2>
        <NButton type="primary" size="small" @click="selectFile">
          选择
        </NButton>
        <NButton type="primary" size="small" @click="readEnvFile">
          读取
        </NButton>
        <NButton type="primary" size="small" @click="saveEnvFile">
          保存
        </NButton>
      </NButtonGroup>
    </div>
    <NInput
      v-model:value="env.raw"
      placeholder="空空如也~"
      type="textarea"
      :autosize="{ minRows: 3, maxRows: 3 }"
    />
  </div>
</template>
