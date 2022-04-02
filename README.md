# svg-foreignobject-screenshot

_Inspired by [aautar/svg-foreignobject-screenshot](https://github.com/aautar/svg-foreignobject-screenshot)_

## Basic Usage

```ts
import {
  buildSvgDataURI,
  renderToBase64Png,
  fetcher,
} from '@artemis69/svg-foreignobject-screenshot'

// element you want to screenshot
const target: HTMLDivElement = document.querySelector('#app')

;(async () => {
  const dataURI = await buildSvgDataURI(target, {
    width: target.offsetWidth,
    height: target.offsetHeight,
    fetcher,
  })

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
  const dataURI = await buildSvgDataURI(target, {
    width: target.offsetWidth,
    height: target.offsetHeight,
    fetcher,
    filterer,
  })

  const base64png = await renderToBase64Png(dataURI)

  const link = document.createElement('a')
  link.download = 'download.png'
  link.href = base64png
  link.click()
})()
```

## Super-Duper Advanced Usage

```ts
import postcss from 'postcss'
import autoprefixer, { Options } from 'autoprefixer'

const autoprefixerOptions: Options = {
  overrideBrowserslist: ['>0.1%', 'last 4 versions', 'not dead'],
}

const processor = postcss([autoprefixer(autoprefixerOptions)])

const autoprefix = (value: string) => {
  return processor.process(value).css
}

const dataURI = await buildSvgDataURI(target, {
  width: target.offsetWidth,
  height: target.offsetHeight,
  fetcher,
  filterer,
  // modify css before rendering
  css: autoprefix,
})
```
