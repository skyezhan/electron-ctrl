import { ipcRenderer } from 'electron'
import { ref } from 'vue'
import { IpcEvents } from '../constants'
import type { AppInfo, DevInfo, SessionInfo } from '../types'
import { detectApps, fetchPages } from './api'

export const appRecord = ref<Map<string, AppInfo>>(new Map())
export const devRecord = ref<Map<string, DevInfo>>(new Map())
export const sessionRecord = ref<Map<string, SessionInfo>>(new Map())
export const collapsed = ref(false)
export const activeSession = ref<string>('#')

export const changeActiveSession = (id?: string) => {
  if (id) {
    sessionRecord.value.get(id) && (activeSession.value = id)
  } else {
    const keys = [...sessionRecord.value.keys()]
    activeSession.value = keys.length ? keys[keys.length - 1] : '#'
  }
}

export const updateDevRecord = () => {
  const localProject = JSON.parse(localStorage.getItem('dev-project') || '[]')
  const record: DevInfo = localProject.map((project: any) => ({
    ...project,
    scripts: new Map(project.scripts),
  }))
  devRecord.value = new Map(Object.entries(record).map(([_, o]) => [o.path, o]))
}

export const initStore = () => {
  ipcRenderer.on(IpcEvents.session, (_, { id, type, data }) => {
    if (type === 'error') {
      sessionRecord.value.delete(id)
      changeActiveSession()
    } else if (type === 'log') {
      const session = sessionRecord.value.get(id)
      if (session) {
        !session.log && (session.log = '')
        session.log += data.log
      }
    } else if (type === 'new') {
      const session = sessionRecord.value.get(id)
      sessionRecord.value.set(id, {
        ...session,
        ...data,
      })
      changeActiveSession(id)
    }
  })

  detectApps().then(res => appRecord.value = res)
  updateDevRecord()

  setInterval(async () => {
    const datas = await fetchPages(
      [...sessionRecord.value.entries()].reduce((map, [id, session]) => {
        map.set(id, [session.nodePort, session.windowPort])
        return map
      }, new Map()),
    )
    for (const [id, pages] of datas.entries()) {
      const session = sessionRecord.value.get(id)
      session && (session.pages = pages)
    }
  }, 3000)
}
