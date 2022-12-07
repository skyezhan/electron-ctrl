import type { AppInfo } from '../../types'

export abstract class Adapter {
  abstract readApps(): Promise<(AppInfo)[]>
  abstract readAppByPath(path: string): Promise<AppInfo | null>
}
