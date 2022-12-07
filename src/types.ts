export interface PageInfo {
  description: string
  devtoolsFrontendUrl: string
  devtoolsFrontendUrlCompat?: string
  faviconUrl: string
  id: string
  parentId?: string
  title: string
  type: string
  url: string
  webSocketDebuggerUrl: string
}

export interface AppInfo {
  id: string
  name: string
  // base64
  icon: string
  exe: string
}

export interface DevInfo {
  type: string
  path: string
  name: string
  scripts: Map<string, string>
  manager: string
}

export interface SessionInfo {
  appId: string
  pid: number
  nodePort: string
  windowPort: string
  log: string
  pages: PageInfo[]
}
