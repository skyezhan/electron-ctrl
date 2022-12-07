import path from 'path'
import fs from 'fs'

export const buildPlugin = () => {
  return {
    name: 'build-plugin',
    closeBundle: () => {
      // build main.ts
      require('esbuild').buildSync({
        entryPoints: ['./src/main/main.ts'],
        bundle: true,
        platform: 'node',
        minify: true,
        outfile: './dist/main.js',
        external: ['electron'],
      })
      // package.json
      const oldPkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'))
      const newPkg = {
        name: oldPkg.name,
        main: 'main.js',
        devDependencies: {
          electron: oldPkg.devDependencies.electron,
        },
      }
      fs.writeFileSync(
        path.join(process.cwd(), 'dist', 'package.json'),
        JSON.stringify(newPkg),
      )
      fs.mkdirSync(path.join(process.cwd(), 'dist/node_modules'))
      // electron-builder
      require('electron-builder').build({
        config: {
          appId: 'cool.skye.electron',
          productName: 'Enow CTRL',
          directories: {
            output: path.join(process.cwd(), 'dist/release'),
            app: path.join(process.cwd(), 'dist'),
          },
          files: ['**'],
          extends: null,
          asar: false,
          nsis: {
            oneClick: true,
            perMachine: true,
            allowToChangeInstallationDirectory: false,
            createDesktopShortcut: true,
            createStartMenuShortcut: true,
            shortcutName: 'Enow CTRL',
          },
        },
        project: process.cwd(),

      })
    },
  }
}
