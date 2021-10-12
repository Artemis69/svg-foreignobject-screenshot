export const getImageUrlsFromFromHtml = (html: string): string[] => {
  const urls = Array.from(
    html.matchAll(/<(?:img|image).*?(?:href|src)=(["|'])(.*?)(\1)/gm)
  )
    .map(match => match[2])
    .filter(
      url => !url.startsWith('data:') && !url.startsWith('#') && url !== ''
    )
  return urls
}

export const getUrlsFromCssString = (cssRuleString: string): string[] => {
  const urls = Array.from(cssRuleString.matchAll(/url\((.*?)\)/gi))
    .map(match => removeQuotes(match[1]))
    .filter(url => !url.startsWith('data:') && url !== '')

  return urls
}

export const removeQuotes = (str: string) =>
  str.replace(/^("|').*?(\1)$/gm, match => match.slice(1, -1))

const escaped: { [key: string]: string } = {
  '&quot;': '"',
  '&#39;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
}

export const descape = (string: string) =>
  string.replace(/&(quot|#39|amp|lt|gt);/g, match => escaped[match])

/**
 * Because of CORS fetch cannot get some resources. For that we need to use a proxy service or something like cors-anywhere.
 * Since I could not find the equivalent of cors-anywhere, we can only use the image proxy, which is free Images.weserv.nl
 *
 * Why are only some image types supported? See supported file types: https://images.weserv.nl/faq/#which-file-extensions-do-you-support
 */
export const shouldProxy = (url: string) =>
  /^(https?:\/\/|\/\/)(.*?)\.(jpeg|png|gif|tiff|webp|svg|avif)$/im.test(url)
