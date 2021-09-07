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
