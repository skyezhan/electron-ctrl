import { protocol } from 'electron'
import fs from 'fs'
import path from 'path'

protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    standard: true,
    supportFetchAPI: true,
    bypassCSP: true,
    corsEnabled: true,
    stream: true,
  },
}])

const getMimeType = (extension: string) => {
  let mimeType = ''
  if (extension === '.js') {
    mimeType = 'text/javascript'
  } else if (extension === '.html') {
    mimeType = 'text/html'
  } else if (extension === '.css') {
    mimeType = 'text/css'
  } else if (extension === '.svg') {
    mimeType = 'image/svg+xml'
  } else if (extension === '.json') {
    mimeType = 'application/json'
  }
  return mimeType
}

export const registerScheme = () => {
  protocol.registerStreamProtocol('app', (request, callback) => {
    let pathName = new URL(request.url).pathname
    let extension = path.extname(pathName).toLowerCase()
    if (extension === '') {
      pathName = 'index.html'
      extension = '.html'
    }
    const tarFile = path.join(__dirname, pathName)
    callback({
      statusCode: 200,
      headers: { 'content-type': getMimeType(extension) },
      data: fs.createReadStream(tarFile),
    })
  })
}
