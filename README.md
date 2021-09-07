# svg-foreignobject-screenshot

_Inspired by [aautar/svg-foreignobject-screenshot](https://github.com/aautar/svg-foreignobject-screenshot)_

## Usage

```ts
import {
  buildSvgDataURI,
  renderToBase64Png,
  renderToCanvas,
  renderToImage,
} from '@artemis69/svg-foreignobject-screenshot'

const elementToScreenshot: HTMLDivElement = document.querySelector('#app')

;(async () => {
  const dataURI = await buildSvgDataURI(
    elementToScreenshot.outerHTML,
    window.innerWidth,
    window.innerHeight
  )
  const base64png = await renderToBase64Png(dataURI)

  const link = document.createElement('a')
  link.download = 'download.png'
  link.href = base64png
  link.click()
  link.remove()
})()
```

## Examples

[renderToImage example](https://stackblitz.com/edit/svg-foreignobject-screenshot-render-to-image?file=index.ts)

In that example we capture div and then display it's copy near it

[renderToCanvas example](https://stackblitz.com/edit/svg-foreignobject-screenshot-render-to-canvas?file=index.ts)

In that example we capture div but also add image over it and then display it's copy near it

[renderToBase64Png example](https://stackblitz.com/edit/svg-foreignobject-screenshot-render-to-base64-png?file=index.ts)

in that example we capture document.body and then download it as png file

## Thanks

Thanks to [Images.weserv.nl](https://images.weserv.nl/) for proxing images.
