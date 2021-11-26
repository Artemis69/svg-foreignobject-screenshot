import {
  descape,
  getImageUrlsFromHtml,
  getUrlsFromCssString,
  shouldProxy,
} from './lib'

const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K
): HTMLElementTagNameMap[K] => document.createElement(tagName)

const serialize = (node: Node) => new XMLSerializer().serializeToString(node)

const base64encode = (str: string): string => {
  // https://stackoverflow.com/a/57459650/14295730
  const encode = encodeURIComponent(str).replace(/%([a-f0-9]{2})/gi, (m, $1) =>
    String.fromCharCode(parseInt($1, 16))
  )
  return btoa(encode)
}

const binaryStringToBase64 = (binaryString: Blob): Promise<string> => {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(binaryString)
  })
}

const getResourceAsBase64 = async (url: string): Promise<[string, string]> => {
  try {
    const isProxied = shouldProxy(url)

    const res = await fetch(
      isProxied
        ? 'https://images.weserv.nl/?encoding=base64&output=jpg&url=' +
            encodeURIComponent(descape(url))
        : descape(url)
    )

    /**
     * https://images.weserv.nl/docs/format.html#base64-data-url
     * images.weserv.nl has an option to encode the image data as base64
     * which is much faster than converting it to base64 on the client side
     */
    if (isProxied) {
      const text = await res.text()
      return [url, text.startsWith('data:image') ? text : '']
    }

    const blob = await res.blob()

    const base64encoded = (await binaryStringToBase64(blob)) || ''

    return [url, base64encoded]
  } catch {
    return [url, '']
  }
}

const getMultipleResourcesAsBase64 = (
  urls: string[]
): Promise<Array<[string, string]>> => {
  const promises = []
  for (const url of urls) {
    promises.push(getResourceAsBase64(url))
  }
  return Promise.all(promises)
}

export const buildSvgDataURI = async (
  contentHtml: string,
  width: number,
  height: number
): Promise<string> => {
  let cssStyles = ''
  let urlsFoundInCss: string[] = []

  const styleSheets = Array.from(document.styleSheets).filter(
    styleSheet =>
      !styleSheet.href || styleSheet.href.startsWith(window.location.origin)
  )

  for (const styleSheet of styleSheets) {
    for (const { cssText } of styleSheet.cssRules) {
      urlsFoundInCss.push(...getUrlsFromCssString(cssText))
      cssStyles += cssText
    }
  }

  const fetchedResourcesFromStylesheets = await getMultipleResourcesAsBase64(
    urlsFoundInCss
  )

  for (const resource of fetchedResourcesFromStylesheets) {
    cssStyles = cssStyles.replaceAll(resource[0], resource[1])
  }

  const urlsFoundInHtml = getUrlsFromCssString(contentHtml)

  const fetchedResourcesFromHtml = await getMultipleResourcesAsBase64(
    urlsFoundInHtml
  )

  for (const resource of fetchedResourcesFromHtml) {
    contentHtml = contentHtml.replaceAll(resource[0], resource[1])
  }

  const fetchedResources = await getMultipleResourcesAsBase64(
    getImageUrlsFromHtml(contentHtml)
  )
  for (const resource of fetchedResources) {
    contentHtml = contentHtml.replaceAll(resource[0], resource[1])
  }

  const styleElem = createElement('style')
  styleElem.innerHTML = cssStyles

  const contentRootElem = createElement('div')
  contentRootElem.innerHTML = serialize(styleElem) + contentHtml
  contentRootElem.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')

  const contentRootElemString = serialize(contentRootElem)

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><g transform='translate(0, 0) rotate(0)'><foreignObject x='0' y='0' width='${width}' height='${height}'>${contentRootElemString}</foreignObject></g></svg>`

  const dataURI = `data:image/svg+xml;base64,${base64encode(svg)}`

  return dataURI
}

export const renderToImage = (dataURI: string): Promise<HTMLImageElement> => {
  return new Promise(resolve => {
    const img = createElement('img')

    img.src = dataURI

    img.onload = () => resolve(img)
    /**
     * Resolve in anyway
     */
    img.onerror = () => resolve(img)
  })
}

export const renderToCanvas = async (
  dataURI: string
): Promise<HTMLCanvasElement> => {
  const img = await renderToImage(dataURI)

  const canvas = createElement('canvas')

  canvas.width = img.width
  canvas.height = img.height

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  ctx.drawImage(img, 0, 0, img.width, img.height)

  return canvas
}

export const renderToBase64Png = async (dataURI: string): Promise<string> => {
  const canvas = await renderToCanvas(dataURI)

  return canvas.toDataURL('image/png')
}
