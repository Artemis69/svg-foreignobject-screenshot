import { test } from 'uvu'
import * as assert from 'uvu/assert'
import {
  removeQuotes,
  getImageUrlsFromHtml,
  getUrlsFromCss,
  descape,
  isEmptyString,
  isDataUrl,
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

test('getUrlsFromCss', () => {
  assert.equal(getUrlsFromCss(`background: url('data:image/svg+xml,')`), [])
  assert.equal(getUrlsFromCss(`background: url("data:image/svg+xml,")`), [])
  assert.equal(getUrlsFromCss(`background: url(data:image/svg+xml,)`), [])
  assert.equal(getUrlsFromCss(`background: url('./grape.jpg')`), [
    './grape.jpg',
  ])
  assert.equal(getUrlsFromCss(`background: url("./grape.jpg")`), [
    './grape.jpg',
  ])
  assert.equal(getUrlsFromCss(`background: url(./grape.jpg)`), ['./grape.jpg'])
  assert.equal(getUrlsFromCss(`clip-path:url(#B)`), [])
})

test('descape', () => {
  assert.is(descape('&quot;'), '"')
  assert.is(descape('&#39;'), "'")
  assert.is(descape('&amp;'), '&')
  assert.is(descape('&lt;'), '<')
  assert.is(descape('&gt;'), '>')
})

test('isEmptyString', () => {
  assert.is(isEmptyString(''), true)
})

test('isDataUrl', () => {
  assert.is(isDataUrl('data:image/svg+xml,<svg></svg>'), true)
  assert.is(isDataUrl('#path'), true)
})

test('descape and removeQuotes combined', () => {
  assert.is(removeQuotes(descape('&quot;stars.jpg&quot;')), 'stars.jpg')
})

test.run()
