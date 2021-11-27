import { test } from 'uvu'
import * as assert from 'uvu/assert'
import {
  removeQuotes,
  getImageUrlsFromHtml,
  getUrlsFromCssString,
  descape,
  shouldProxy,
} from '../src/lib'

test('removeQuotes', () => {
  assert.is(removeQuotes(`'""'`), `""`)
  assert.is(removeQuotes(`"''"`), `''`)
  assert.is(removeQuotes(`""""`), `""`)
  assert.is(removeQuotes(`''''`), `''`)
})

test('getImageUrlsFromHtml', () => {
  assert.equal(
    getImageUrlsFromHtml(`<img src="https://example.com/first.jpg"/>`),
    ['https://example.com/first.jpg']
  )
  assert.equal(
    getImageUrlsFromHtml(
      `<img class="max-h-10" src="https://example.com/second.jpg" alt="Sunny Cactus"/>`
    ),
    ['https://example.com/second.jpg']
  )

  assert.equal(
    getImageUrlsFromHtml(
      `<img data-src="https://cactus-shop.com/cactus.webp" src="" alt="cactus" />`
    ),
    ['https://cactus-shop.com/cactus.webp']
  )

  assert.equal(
    getImageUrlsFromHtml(`
      <svg>
        <image xlink:href="https://example.com/buldge.jpg" />
      </svg>
    `),
    ['https://example.com/buldge.jpg']
  )

  assert.equal(
    getImageUrlsFromHtml(`
      <svg>
        <image href="https://example.com/concave.jpg" />
      </svg>
    `),
    ['https://example.com/concave.jpg']
  )

  assert.equal(getImageUrlsFromHtml(`<img src="data:image/svg+xml,..." />`), [])
  assert.equal(
    getImageUrlsFromHtml(`
      <svg>
        <image href="#cute-face" />
      </svg>
    `),
    []
  )
  assert.equal(
    getImageUrlsFromHtml(
      `<a href="https://artemiys-toolbox.pages.dev/">Do not click me</a>`
    ),
    []
  )
})

test('getUrlsFromCssString', () => {
  assert.equal(
    getUrlsFromCssString(`background: url('data:image/svg+xml,')`),
    []
  )
  assert.equal(
    getUrlsFromCssString(`background: url("data:image/svg+xml,")`),
    []
  )
  assert.equal(getUrlsFromCssString(`background: url(data:image/svg+xml,)`), [])
  assert.equal(getUrlsFromCssString(`background: url('./grape.jpg')`), [
    './grape.jpg',
  ])
  assert.equal(getUrlsFromCssString(`background: url("./grape.jpg")`), [
    './grape.jpg',
  ])
  assert.equal(getUrlsFromCssString(`background: url(./grape.jpg)`), [
    './grape.jpg',
  ])
  assert.equal(getUrlsFromCssString(`clip-path:url(#B)`), [])
})

test('descape', () => {
  assert.is(descape('&quot;'), '"')
  assert.is(descape('&#39;'), "'")
  assert.is(descape('&amp;'), '&')
  assert.is(descape('&lt;'), '<')
  assert.is(descape('&gt;'), '>')
})

test('shouldProxy', () => {
  assert.is(shouldProxy('//proxy-me.pls/image.jpg'), true)
  assert.is(shouldProxy('//proxy-me.pls/image.jpeg'), true)
  assert.is(shouldProxy('//proxy-me.pls/image.png'), true)
  assert.is(shouldProxy('//proxy-me.pls/image.gif'), true)
  assert.is(shouldProxy('//proxy-me.pls/image.tiff'), true)
  assert.is(shouldProxy('//proxy-me.pls/image.webp'), true)
  assert.is(shouldProxy('//proxy-me.pls/image.svg'), true)
  assert.is(shouldProxy('//proxy-me.pls/image.avif'), true)

  assert.is(shouldProxy('http://proxy-me.pls/image.jpg'), true)
  assert.is(shouldProxy('http://proxy-me.pls/image.jpeg'), true)
  assert.is(shouldProxy('http://proxy-me.pls/image.png'), true)
  assert.is(shouldProxy('http://proxy-me.pls/image.gif'), true)
  assert.is(shouldProxy('http://proxy-me.pls/image.tiff'), true)
  assert.is(shouldProxy('http://proxy-me.pls/image.webp'), true)
  assert.is(shouldProxy('http://proxy-me.pls/image.svg'), true)
  assert.is(shouldProxy('http://proxy-me.pls/image.avif'), true)

  assert.is(shouldProxy('https://proxy-me.pls/image.jpg'), true)
  assert.is(shouldProxy('https://proxy-me.pls/image.jpeg'), true)
  assert.is(shouldProxy('https://proxy-me.pls/image.png'), true)
  assert.is(shouldProxy('https://proxy-me.pls/image.gif'), true)
  assert.is(shouldProxy('https://proxy-me.pls/image.tiff'), true)
  assert.is(shouldProxy('https://proxy-me.pls/image.webp'), true)
  assert.is(shouldProxy('https://proxy-me.pls/image.svg'), true)
  assert.is(shouldProxy('https://proxy-me.pls/image.avif'), true)

  assert.is(shouldProxy('https://do-not-proxy-me.pls/horny.woff2'), false)
  assert.is(shouldProxy('https://do-not-proxy-me.pls/horny.woff'), false)
  assert.is(shouldProxy('https://do-not-proxy-me.pls/horny.ttf'), false)
})

test.run()
