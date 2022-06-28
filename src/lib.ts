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

const take = (str: string, regex: RegExp, i: number) => {
  const items = Array.from(str.matchAll(regex))

  return items.map(match => removeQuotes(match[i])).filter(filterer)
}

export const getImageUrlsFromHtml = (html: string): string[] => {
  const regex = /<(?:img|image).*?(?:href|src)=(["|'])(.*?)(\1)/gm

  return take(html, regex, 2)
}

export const getUrlsFromCss = (cssRuleString: string): string[] => {
  const regex = /url\((.*?)\)/gi

  return take(cssRuleString, regex, 1)
}

export const removeQuotes = (str: string) => {
  const regex = /^("|').*?(\1)$/m

  return regex.test(str) ? str.slice(1, -1) : str
}
