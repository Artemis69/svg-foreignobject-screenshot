export type Thenable<T> = Promise<T> | T
export type BuildSvgDataURI = (
  html: HTMLElement,
  options: Options
) => Promise<string>

export interface Options {
  filterer?: (value: string, index?: number, array?: string[]) => boolean
  fetcher?: (url: string) => Promise<string>
  css?: (value: string) => Thenable<string | void>
  width: number
  height: number
}
