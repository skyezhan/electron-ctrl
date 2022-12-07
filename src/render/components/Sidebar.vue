<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import type { MenuOption } from 'naive-ui'
import { NButton, NLayoutSider, NMenu, NScrollbar } from 'naive-ui'
import { activeSession, appRecord, collapsed, devRecord, sessionRecord, updateDevRecord } from '../store'
import type { AppInfo, DevInfo, SessionInfo } from '../../types'
import { detectApps, getFolderPath, startApp } from '../api'
import fs from 'fs'
import path from 'path'
import { nanoid } from 'nanoid'

const activeKey = ref('')

const renderRootIcon = (icon: string) => {
  return h('div', { class: `${icon} text-2xl color-gray-700` })
}

const renderRootLabel = (name: string) => {
  return h('div', { class: 'text-sm font-medium select-none color-gray-700' }, name)
}

const renderInstallAppIcon = (info: AppInfo) => {
  return h('img', { src: info.icon || '/electron.png', class: 'w-7 h-7 inline-block select-none' })
}

const renderDevProjectIcon = (info: DevInfo) => {
  return h('img', { src: `/${info.manager}.svg`, class: 'w-5 h-5 inline-block select-none' })
}

const installedAppMenu = computed(() => {
  return [...appRecord.value.values()]
})

const devProjectMenu = computed(() => {
  return [...devRecord.value.values()]
})

const meuns = computed((): MenuOption[] => ([
  {
    icon: () => renderRootIcon('i-mdi:ghost'),
    label: () => renderRootLabel('已安装'),
    key: 'app',
    children: installedAppMenu.value.map(info => ({
      icon: () => renderInstallAppIcon(info),
      label: info.name,
      key: info.id,
    })),
  },
  {
    icon: () => renderRootIcon('i-mdi:google-downasaur'),
    label: () => renderRootLabel('开发中'),
    key: 'dev',
    children: devProjectMenu.value.map(info => ({
      icon: () => renderDevProjectIcon(info),
      label: info.name,
      key: info.path,
    })),
  },
]))

const onMenuSelect = (key: string) => {
  const app = appRecord.value.get(key)
  const dev = devRecord.value.get(key)
  if (app) {
    startApp(app.id, app.exe)
  }
  if (dev) {
    const id = nanoid()
    sessionRecord.value.set(id, { appId: dev.path } as SessionInfo)
    activeSession.value = id
  }
  setTimeout(() => {
    activeKey.value = ''
  }, 1000)
}

const refresh = () => {
  detectApps().then(res => appRecord.value = res)
  updateDevRecord()
}

const importProject = async () => {
  const folderPath = await getFolderPath()
  if (!folderPath) {
    return
  }
  const buf = await fs.promises.readFile(path.join(folderPath, 'package.json'))
  const pkg = JSON.parse(buf.toString())
  if (pkg?.devDependencies?.electron || pkg?.dependencies?.electron) {
    const managers = await Promise.all<string>(
      ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].map(p => new Promise((resolve) => {
        const name = p.split(/[-.]/)?.[0] || ''
        const exists = fs.existsSync(path.join(folderPath, p))
        resolve(exists ? name === 'package' ? 'npm' : name : '')
      })),
    )
    const shouldImportProject = {
      name: pkg?.name,
      type: 'dev-project',
      path: folderPath,
      scripts: Object.entries(pkg?.scripts),
      manager: managers.filter(i => i.length)[0] || '',
    }
    const localProject = JSON.parse(localStorage.getItem('dev-project') ?? '[]')
    for (const project of localProject) {
      if (shouldImportProject.path === project.path) {
        window.$message?.error('工程已存在')
        return
      }
    }
    localProject.push(shouldImportProject)
    localStorage.setItem('dev-project', JSON.stringify(localProject))
    updateDevRecord()
    window.$message?.success('导入成功')
  } else {
    window.$message?.error('只能导入electron工程!')
  }
}
</script>

<template>
  <NLayoutSider
    h-full rounded-tr-3 rounded-br-3 bg-white
    :style="{ boxShadow: collapsed ? '' : '-2px 0 8px #1d23290d' }"
    collapse-mode="width"
    :width="208"
    :collapsed-width="48"
    :collapsed="collapsed"
    show-trigger
    @collapse="collapsed = true"
    @expand="collapsed = false"
  >
    <NScrollbar h-full relative>
      <NMenu
        v-model:value="activeKey"
        :options="meuns"
        :root-indent="24"
        :indent="12"
        :collapsed="collapsed"
        :default-expanded-keys="['app']"
        @update-value="onMenuSelect"
      />
      <div
        v-if="!collapsed"
        pos="absolute bottom-3" w-full
        flex justify-center children:mx-2
      >
        <NButton type="primary" size="small" @click="refresh">
          刷新
        </NButton>
        <NButton type="info" size="small" @click="importProject">
          导入
        </NButton>
      </div>
    </NScrollbar>
  </NLayoutSider>
</template>

<style>
.n-layout-sider .n-layout-toggle-button {
  right: 3px;
}

.n-menu .n-menu-item-content .n-menu-item-content-header {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgba(75, 85, 99) !important;
  user-select: none;
}
</style>
