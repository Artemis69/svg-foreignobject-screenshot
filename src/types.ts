export type NoUndefined<T> = T extends undefined ? never : T
export type Thenable<T> = Promise<T> | T
export type Hook = (value: string) => Thenable<string | void>
export type BuildSvgDataURI = (html: Node, options: Options) => Promise<string>

export interface Options {
  filterer?: (value: string, index?: number, array?: string[]) => boolean
  fetcher?: (url: string) => Promise<string>
  css?: Hook
  width: number
  height: number
}
