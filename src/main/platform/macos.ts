import { Adapter } from './adapter'
import type { AppInfo } from '../../types'
import { parse as parsePlist } from 'plist'
import fs from 'fs'
import path from 'path'

interface MacosAppInfo {
  CFBundleIdentifier: string
  CFBundleName: string
  CFBundleExecutable: string
  CFBundleIconFile: string
}

export class MacosAdapter extends Adapter {
  async readApps() {
    const files = await fs.promises.readdir('/Applications')
    const infos = await Promise.all(files.map(file => this.readAppByPath(path.join('/Applications', file))))
    return infos.filter((i): i is AppInfo => i !== null)
  }

  async readAppByPath(p: string) {
    const isElectronApp = await fs.existsSync(`${p}/Contents/Frameworks/Electron Framework.framework`)
    if (!isElectronApp) {
      return null
    }

    const plist = await fs.promises.readFile(path.join(p, 'Contents/Info.plist'))
    const info = parsePlist(plist.toString()) as unknown as MacosAppInfo

    const icon = await this.readIcnsAsImageUri(path.join(p, 'Contents/Resources', info.CFBundleIconFile))

    return {
      id: info.CFBundleIdentifier,
      name: info.CFBundleName,
      icon,
      exe: path.resolve(p, 'Contents/MacOS', info.CFBundleExecutable),
    }
  }

  async readIcnsAsImageUri(p: string): Promise<string> {
    let buf = await fs.promises.readFile(p)
    if (!buf) {
      return ''
    }

    const totalSize = buf.readInt32BE(4) - 8
    buf = buf.slice(8)

    const icons = []

    let start = 0
    while (start < totalSize) {
      const type = buf.slice(start, start + 4).toString()
      const size = buf.readInt32BE(start + 4)
      const data = buf.slice(start + 8, start + size)

      icons.push({ type, size, data })
      start += size
    }

    icons.sort((a, b) => b.size - a.size)
    const imageData = icons[0].data
    if (imageData.slice(1, 4).toString() === 'PNG') {
      return `data:image/png;base64,${imageData.toString('base64')}`
    }

    return ''
  }
}
