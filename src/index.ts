import {
  getImageUrlsFromHtml,
  getUrlsFromCss,
  descape,
  removeQuotes,
} from './lib'
import { Options, HookName, HookParameter, BuildSvgDataURI } from './types'
export { fetcher } from './fetcher'

const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K
): HTMLElementTagNameMap[K] => document.createElement(tagName)

const serialize = (node: Node) => new XMLSerializer().serializeToString(node)

const useFetcher = async (resources: string[], fetcher: Options['fetcher']) => {
  const results = [] as Array<[string, string]>

  const promises = resources.map(async resource => {
    const result = await fetcher(removeQuotes(descape(resource)))
    results.push([resource, result])
  })

  await Promise.all(promises)

  return results
}

export const buildSvgDataURI: BuildSvgDataURI = async (html, options) => {
  let css = ''

  let { width, height } = options

  const styleSheets = Array.from(document.styleSheets).filter(
    styleSheet =>
      !styleSheet.href || styleSheet.href.startsWith(window.location.origin)
  )

  for (const styleSheet of styleSheets) {
    for (const { cssText } of styleSheet.cssRules) {
      css += cssText
    }
  }

  /*
   * Get all the resources from `url(...)` in the CSS
   */

  let resources = getUrlsFromCss(css)

  /*
   * Get all the resources from `<img src="...">` and `<image href="...">` in the HTML
   */

  resources = resources.concat(getImageUrlsFromHtml(html))

  /*
   * Get all the resources from styles inlined in html (e.g. <div style="background: url(...)"></div>)
   */

  resources = resources.concat(getUrlsFromCss(html))

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
    html = html.replaceAll(url, base64)
  }

  const hook = async <T extends keyof HookName, K extends HookParameter<T>>(
    name: T,
    changer: K
  ) => {
    let fn = options[name]

    if (typeof fn === 'function') {
      return (await fn(changer)) || changer
    }

    return changer
  }

  css = await hook('css', css)
  html = await hook('html', html)

  const style = createElement('style')
  style.innerHTML = css

  const contentRoot = createElement('div')
  contentRoot.innerHTML = html
  contentRoot.appendChild(style)
  contentRoot.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')

  const content = serialize(contentRoot)

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><g transform='translate(0, 0) rotate(0)'><foreignObject x='0' y='0' width='${width}' height='${height}'>${content}</foreignObject></g></svg>`

  const dataURI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

  return dataURI
}

export const renderToBase64Png = (dataURI: string): Promise<string> => {
  return new Promise(resolve => {
    const img = createElement('img')

    const controller = () => {
      const canvas = createElement('canvas')

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
