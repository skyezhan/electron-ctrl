import type { AddressInfo } from 'net'
import type { ViteDevServer } from 'vite'

export const devPlugin = () => ({
  name: 'dev-plugin',
  configureServer(server: ViteDevServer) {
    require('esbuild').buildSync({
      entryPoints: ['./src/main/main.ts'],
      bundle: true,
      platform: 'node',
      outfile: './dist/main.js',
      external: ['electron'],
    })
    server.httpServer?.once('listening', () => {
      const { spawn } = require('child_process')
      const address = server.httpServer!.address() as AddressInfo
      const electronProcess = spawn(require('electron').toString(), [
        './dist/main.js',
        `http://localhost:${address.port}`,
      ], {
        cwd: process.cwd(),
        stdio: 'inherit',
      })
      electronProcess.on('close', () => {
        server.close()
        process.exit()
      })
    })
  },
})

export const getReplacer = () => {
  const modules = [
    'os',
    'fs',
    'path',
    'events',
    'child_process',
    'crypto',
    'http',
    'buffer',
    'url',
    'electron',
  ]
  const electronModules = [
    'clipboard',
    'ipcRenderer',
    'nativeImage',
    'shell',
    'webFrame',
  ]
  return modules.reduce((obj, item) => {
    obj[item] = () => ({
      find: new RegExp(`^${item}$`),
      code: item === 'electron'
        ? `const {${electronModules.join(',')}} = require('electron'); export {${electronModules.join(',')}}`
        : `const ${item} = require('${item}'); export { ${item} as default }`,
    })
    return obj
  }, {})
}
