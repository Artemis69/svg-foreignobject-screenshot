# svg-foreignobject-screenshot

_Inspired by [aautar/svg-foreignobject-screenshot](https://github.com/aautar/svg-foreignobject-screenshot)_

## Basic Usage

```ts
import {
  buildSvgDataURI,
  renderToBase64Png,
  fetcher,
} from '@artemis69/svg-foreignobject-screenshot'

const elementToScreenshot: HTMLDivElement = document.querySelector('#app')

;(async () => {
  const dataURI = await buildSvgDataURI(
    elementToScreenshot.outerHTML,
    window.innerWidth,
    window.innerHeight,
    {
      fetcher,
    }
  )
  const base64png = await renderToBase64Png(dataURI)

  const link = document.createElement('a')
  link.download = 'download.png'
  link.href = base64png
  link.click()
})()
```

## Advanced Usage

```ts
import type { Options } from '@artemis69/svg-foreignobject-screenshot'
import {
  buildSvgDataURI,
  renderToBase64Png,
} from '@artemis69/svg-foreignobject-screenshot'

const elementToScreenshot: HTMLDivElement = document.querySelector('#app')

/*
 * Here we are using a custom fetcher.
 * This function should return a promise that resolves data url.
 */
const fetcher: Options['fetcher'] = url => {
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

/*
 * Here we are using a filterer.
 * Want to filter out some resources? Use this.
 *
 * In this example, we are excluding fonts.
 */
const filterer: Options['filterer'] = url => {
  const extensions = ['.eot', '.ttf', '.otf', '.woff', '.woff2']

  for (const extension of extensions) {
    if (url.endsWith(extension)) {
      return true
    }
  }

  return false
}

;(async () => {
  const dataURI = await buildSvgDataURI(
    elementToScreenshot.outerHTML,
    window.innerWidth,
    window.innerHeight,
    {
      fetcher,
      filterer,
    }
  )
  const base64png = await renderToBase64Png(dataURI)

  const link = document.createElement('a')
  link.download = 'download.png'
  link.href = base64png
  link.click()
})()
```
