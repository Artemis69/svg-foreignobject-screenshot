const escaped: Record<string, string> = {
  '&quot;': '"',
  '&#39;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
}

export const descape = (string: string) =>
  string.replace(/&(quot|#39|amp|lt|gt);/g, match => escaped[match])

export const isDataUrl = (url: string) =>
  url.startsWith('data:') || url.startsWith('#')

export const isEmptyString = (url: string) => url === ''

const filterer = (url: string) => !isDataUrl(url) && !isEmptyString(url)

export const getImageUrlsFromHtml = (html: string): string[] => {
  const regex = /<(?:img|image).*?(?:href|src)=(["|'])(.*?)(\1)/gm

  const urls = Array.from(html.matchAll(regex))
    .map(match => match[2])
    .filter(filterer)
  return urls
}

export const getUrlsFromCss = (cssRuleString: string): string[] => {
  const regex = /url\((.*?)\)/gi

  const urls = Array.from(cssRuleString.matchAll(regex))
    .map(match => removeQuotes(match[1]))
    .filter(filterer)

  return urls
}

export const removeQuotes = (str: string) =>
  str.replace(/^("|').*?(\1)$/gm, match => match.slice(1, -1))
