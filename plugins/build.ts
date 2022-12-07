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
      const pkg = JSON.parse(fs.readFileSync(
        path.join(process.cwd(), 'package.json'), 'utf-8'),
      )
      delete pkg.build
      fs.writeFileSync(
        path.join(process.cwd(), 'dist', 'package.json'),
        JSON.stringify(pkg),
      )
    },
  }
}
