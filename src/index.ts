import {
  descape,
  getImageUrlsFromFromHtml,
  getUrlsFromCssString,
  removeQuotes,
} from './lib'

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

const getResourceAsBase64 = async (
  url: string
): Promise<{
  url: string
  base64: string
}> => {
  try {
    const res = await fetch(
      url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('//')
        ? 'https://images.weserv.nl/?url=' + encodeURIComponent(descape(url))
        : descape(url)
    )

    const blob = await res.blob()

    const base64encoded = (await binaryStringToBase64(blob)) || ''

    return {
      url,
      base64: base64encoded,
    }
  } catch {
    return {
      url,
      base64: '', // just ignore image
    }
  }
}

const getMultipleResourcesAsBase64 = (
  urls: string[]
): Promise<Array<{ url: string; base64: string }>> => {
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
  let urlsFoundInCss = []

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
    cssStyles = cssStyles.replaceAll(resource.url, resource.base64)
  }

  const fetchedResources = await getMultipleResourcesAsBase64(
    getImageUrlsFromFromHtml(contentHtml)
  )
  for (const resource of fetchedResources) {
    contentHtml = contentHtml.replaceAll(resource.url, resource.base64)
  }

  const styleElem = document.createElement('style')
  styleElem.innerHTML = cssStyles

  const contentRootElem = document.createElement('div')
  contentRootElem.innerHTML = serialize(styleElem) + contentHtml
  contentRootElem.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')

  const contentRootElemString = serialize(contentRootElem)

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><g transform='translate(0, 0) rotate(0)'><foreignObject x='0' y='0' width='${width}' height='${height}'>${contentRootElemString}</foreignObject></g></svg>`

  const dataURI = `data:image/svg+xml;base64,${base64encode(svg)}`

  return dataURI
}

export const renderToImage = (dataURI: string): Promise<HTMLImageElement> => {
  return new Promise(resolve => {
    const img = document.createElement('img')

    img.src = dataURI

    img.addEventListener('load', () => resolve(img))
  })
}

export const renderToCanvas = async (
  dataURI: string
): Promise<HTMLCanvasElement | undefined> => {
  const img = await renderToImage(dataURI)

  const canvas = document.createElement('canvas')

  canvas.width = img.width
  canvas.height = img.height

  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return
  }

  ctx.drawImage(img, 0, 0, img.width, img.height)

  return canvas
}

export const renderToBase64Png = async (dataURI: string): Promise<string> => {
  const canvas = await renderToCanvas(dataURI)

  return canvas?.toDataURL('image/png') || ''
}
