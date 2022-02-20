export type Thenable<T> = Promise<T> | T
export type HookName = Required<Pick<Options, 'css' | 'html'>>
export type HookParameter<T extends keyof HookName> = Parameters<HookName[T]>[0]
export type BuildSvgDataURI = (
  html: string,
  options: Options
) => Promise<string>

export interface Options {
  filterer?: (value: string, index?: number, array?: string[]) => boolean
  fetcher: (url: string) => Promise<string>
  css?: (value: string) => Thenable<string | void>
  html?: (value: string) => Thenable<string | void>
  width: number
  height: number
}
