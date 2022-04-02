import {
  getImageUrlsFromHtml,
  getUrlsFromCss,
  descape,
  removeQuotes,
} from './lib'
import { Options, BuildSvgDataURI } from './types'
export { fetcher } from './fetcher'

const serialize = (node: Node) => new XMLSerializer().serializeToString(node)

const useFetcher = async (
  resources: string[],
  fetcher: Required<Options>['fetcher']
) => {
  const results = [] as Array<[string, string]>

  const promises = resources.map(async resource => {
    const result = await fetcher(removeQuotes(descape(resource)))
    results.push([resource, result])
  })

  await Promise.all(promises)

  return results
}

export const buildSvgDataURI: BuildSvgDataURI = async (node, options) => {
  let css = ''

  let { width, height } = options

  for (const styleSheet of document.styleSheets) {
    if (
      !styleSheet.href ||
      styleSheet.href.startsWith(window.location.origin)
    ) {
      for (const { cssText } of styleSheet.cssRules) {
        css += cssText
      }
    }
  }

  if (typeof options.css === 'function') {
    let result = await options.css(css)

    if (result) css = result
  }

  let content = serialize(node)

  if (options.fetcher) {
    /*
     * Get all the resources from `url(...)` in the CSS
     */

    let resources = getUrlsFromCss(css)

    /*
     * Get all the resources from `<img src="...">` and `<image href="...">` in the HTML
     */

    resources = resources.concat(getImageUrlsFromHtml(content))

    /*
     * Get all the resources from styles inlined in html (e.g. <div style="background: url(...)"></div>)
     */

    resources = resources.concat(getUrlsFromCss(content))

    /*
     * Filter out duplicates
     */

    let uniqueResources = Array.from(new Set(resources))

    if (options.filterer) {
      uniqueResources = uniqueResources.filter(options.filterer)
    }

    const base64Resources = await useFetcher(uniqueResources, options.fetcher)

    for (const [url, base64] of base64Resources) {
      css = css.replaceAll(url, base64)
      content = content.replaceAll(url, base64)
    }
  }

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><foreignObject x='0' y='0' width='${width}' height='${height}'><style>${css}</style>${content}</foreignObject></svg>`

  const dataURI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

  return dataURI
}

export const renderToBase64Png = (dataURI: string): Promise<string> => {
  return new Promise(resolve => {
    const img = document.createElement('img')

    const controller = () => {
      const canvas = document.createElement('canvas')

      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

      ctx.drawImage(img, 0, 0, img.width, img.height)

      const png = canvas.toDataURL('image/png', 1.0)

      resolve(png)
    }

    img.src = dataURI

    img.onload = controller
    img.onerror = controller
  })
}

export { Options }
