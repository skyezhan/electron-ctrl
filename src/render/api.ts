import { ipcRenderer } from 'electron'
import { IpcEvents } from '../constants'
import type { AppInfo, PageInfo } from '../types'

export const openWindow = (url: string) => {
  return ipcRenderer.send(IpcEvents.openWindow, url)
}

export const detectApps = async (): Promise<Map<string, AppInfo>> => {
  return await ipcRenderer.invoke(IpcEvents.detectApps)
}

export const startApp = (id: string, exe: string) => {
  return ipcRenderer.send(IpcEvents.startApp, id, exe)
}

export const startProject = (
  manager: string,
  script: string,
  cwd: string,
  sessionId: string,
) => {
  return ipcRenderer.send(IpcEvents.startProject, manager, script, cwd, sessionId)
}

export const fetchPages = async (
  ports: Map<string, string[]>,
): Promise<Map<string, PageInfo[]> > => {
  return ipcRenderer.invoke(IpcEvents.fetchPages, ports)
}

export const openDevToolsInLocal = (port: string, url: string) => {
  return ipcRenderer.send(IpcEvents.openDevToolsInLocal, port, url)
}

export const closeApp = (pid: number) => {
  return ipcRenderer.send(IpcEvents.closeApp, pid)
}

export const restartApp = (pid: number, id: string, exe: string) => {
  return ipcRenderer.send(IpcEvents.restartApp, pid, id, exe)
}

export const getFilePathAndValue = async () => {
  return await ipcRenderer.invoke(IpcEvents.getFilePathAndValue)
}

export const getFolderPath = async () => {
  return await ipcRenderer.invoke(IpcEvents.getFolderPath)
}
