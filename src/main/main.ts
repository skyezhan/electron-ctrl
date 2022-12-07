import { BrowserWindow, app, dialog, ipcMain } from 'electron'
import path from 'path'
import url from 'url'
import getAvailablePort from 'get-port'
import { nanoid } from 'nanoid'
import { IpcEvents } from '../constants'
import type { AppInfo, PageInfo } from '../types'
import type { Adapter } from './platform'
import { MacosAdapter } from './platform'
import type { ChildProcessWithoutNullStreams } from 'child_process'
import { spawn } from 'child_process'
import CDP from 'chrome-remote-interface'
import fetch from 'node-fetch'
import fs from 'fs'

let mainWindow: BrowserWindow
let adapter: Adapter

const initAdapter = () => {
  switch (process.platform) {
    case 'darwin':
      adapter = new MacosAdapter()
      break
    default:
      process.exit()
  }
}

const sendMessageToMainWindow = (channel: string, data: any) => {
  mainWindow?.webContents.send(channel, data)
}

const detectApps = async () => {
  const apps = await adapter.readApps()
  return apps.reduce<Map<string, AppInfo>>((map, app) => {
    map.set(app.id, app)
    return map
  }, new Map())
}

const startDebugging = async (
  sp: ChildProcessWithoutNullStreams,
  id: string,
  sessionId = '',
  nodePort = 0,
  windowPort = 0,
) => {
  const recordId = sessionId || nanoid()

  sp.on('exit', (code) => {
    sendMessageToMainWindow(IpcEvents.session, {
      id: recordId,
      type: 'error',
      data: { code },
    })
  })

  const handleStdout = (data: any) => {
    sendMessageToMainWindow(IpcEvents.session, {
      id: recordId,
      type: 'log',
      data: { log: data.toString() },
    })
  }

  sp.stdout.on('data', data => handleStdout(data))
  sp.stderr.on('data', data => handleStdout(data))

  sendMessageToMainWindow(IpcEvents.session, {
    type: 'new',
    id: recordId,
    data: {
      appId: id,
      pid: sp.pid,
      nodePort,
      windowPort,
      pages: [],
      log: '',
    },
  })
}

const startApp = async (id: string, exe: string) => {
  const nodePort = await getAvailablePort()
  const windowPort = await getAvailablePort()

  const app = spawn(
    exe,
    [`--inspect=${nodePort}`, `--remote-debugging-port=${windowPort}`],
    { cwd: '/', detached: true },
  )

  startDebugging(app, id, '', nodePort, windowPort)
}

const startProject = (manager: string, script: string, cwd: string, sessionId: string) => {
  const app = spawn(manager, [script], { cwd })
  startDebugging(app, cwd, sessionId)
}

const fetchPages = async (data: Map<string, string[]>) => {
  const map: Map<string, PageInfo[]> = new Map()
  for (const [id, ports] of data.entries()) {
    const pages = await Promise.allSettled(ports.map(async (port) => {
      return fetch(`http://127.0.0.1:${port}/json`).then(res => res.json()) as unknown as PageInfo[]
    }))
    const raw = pages.flatMap(page => page.status === 'fulfilled' ? page.value : [])
    map.set(id, raw.filter(({ url = '' }) => !(url.startsWith('devtools://') || url.startsWith('chrome-extension://'))))
  }
  return map
}

const evaluate = (client: CDP.Client, fn: Function, args: any[]) => {
  const argsString = args.map(x => JSON.stringify(x)).join(',')
  const code = `(${fn.toString()})(${argsString})`
  client.Runtime.evaluate({
    expression: code,
    includeCommandLineAPI: true,
    allowUnsafeEvalBlockedByCSP: false,
    awaitPromise: false,
    replMode: true,
    returnByValue: false,
    silent: false,
    userGesture: true,
  })
}

const openDevToolsInLocal = async (port: string, url: string) => {
  const client = await CDP({ port: Number(port) })
  evaluate(client, (url: string) => {
    require('electron')
      .webContents
      .getAllWebContents()
      .forEach(win => win.getURL() === url && win.openDevTools())
  }, [url])
}

const closeApp = (pid: number) => {
  process.kill(pid)
}

const restartApp = (pid: number, id: string, exe: string) => {
  process.kill(pid)
  setTimeout(() => {
    startApp(id, exe)
  }, 500)
}

const getFilePathAndValue = async () => {
  const data = { path: '', value: '' }
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'createDirectory', 'showHiddenFiles'],
  })
  if (filePaths?.length) {
    data.path = filePaths[0]
    try {
      const value = await fs.promises.readFile(filePaths[0])
      data.value = value.toString()
    } catch (_) { }
  }
  return data
}

const getFolderPath = async () => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })
  return filePaths?.[0] ?? ''
}

const bindIpc = () => {
  ipcMain.on(
    IpcEvents.openWindow,
    (_, url: string) => new BrowserWindow().loadURL(url),
  )
  ipcMain.handle(
    IpcEvents.detectApps,
    async () => await detectApps(),
  )
  ipcMain.on(
    IpcEvents.startApp,
    (_, id: string, exe: string) => startApp(id, exe),
  )
  ipcMain.on(
    IpcEvents.startProject,
    (_, manager: string, script: string, cwd: string, sessionId: string) => {
      startProject(manager, script, cwd, sessionId)
    },
  )
  ipcMain.handle(
    IpcEvents.fetchPages,
    async (_, data: Map<string, string[]>) => await fetchPages(data),
  )
  ipcMain.on(
    IpcEvents.openDevToolsInLocal,
    (_, port: string, url: string) => openDevToolsInLocal(port, url),
  )
  ipcMain.on(
    IpcEvents.restartApp,
    (_, pid: number, id: string, exe: string) => restartApp(pid, id, exe),
  )
  ipcMain.on(
    IpcEvents.closeApp,
    (_, pid: number) => closeApp(pid),
  )
  ipcMain.handle(
    IpcEvents.getFilePathAndValue,
    async () => await getFilePathAndValue(),
  )
  ipcMain.handle(
    IpcEvents.getFolderPath,
    async () => await getFolderPath(),
  )
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.argv[2]) {
    mainWindow.loadURL(process.argv[2])
  } else {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true,
    }))
  }
}

const main = () => {
  if (!app.requestSingleInstanceLock()) {
    app.quit()
  } else {
    app.whenReady().then(() => {
      initAdapter()
      bindIpc()

      createWindow()
    })
  }
}

main()
