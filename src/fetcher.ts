import type { Options } from './types'

export const fetcher: Options['fetcher'] = url => {
  return new Promise(async resolve => {
    try {
      const response = await fetch(url)

      const blob = await response.blob()

      const reader = new FileReader()

      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve('')

      reader.readAsDataURL(blob)
    } catch {
      return resolve('')
    }
  })
}
