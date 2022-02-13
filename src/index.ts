import { getImageUrlsFromHtml, getUrlsFromCss } from './lib'
export { fetcher } from './fetcher'

const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K
): HTMLElementTagNameMap[K] => document.createElement(tagName)

const serialize = (node: Node) => new XMLSerializer().serializeToString(node)

const useFetcher = async (resources: string[], fetcher: Options['fetcher']) => {
  const results = [] as Array<[string, string]>

  for (const resource of resources) {
    const result = await fetcher(resource)
    results.push([resource, result])
  }

  return results
}

export interface Options {
  filterer?: (value: string, index: number, array: string[]) => boolean
  fetcher: (url: string) => Promise<string>
}

type BuildSvgDataURI = (
  html: string,
  width: number,
  height: number,
  options: Options
) => Promise<string>

export const buildSvgDataURI: BuildSvgDataURI = async (
  html,
  width,
  height,
  options
) => {
  let css = ''

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
    css = css.replace(new RegExp(url, 'g'), base64)
    html = html.replace(new RegExp(url, 'g'), base64)
  }

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

      const png = canvas.toDataURL('image/png')

      resolve(png)
    }

    img.src = dataURI

    img.onload = controller
    img.onerror = controller
  })
}
