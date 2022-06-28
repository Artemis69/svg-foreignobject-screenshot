export type Thenable<T> = Promise<T> | T
export type Hook = (value: string) => Thenable<string | void>
export type BuildSvgDataURI = (html: Node, options: Options) => Promise<string>

declare const array: string[]

export interface Options {
  filterer?: Parameters<typeof array.filter>[0]
  fetcher?: (url: string) => Promise<string>
  css?: Hook
  width: number
  height: number
}
