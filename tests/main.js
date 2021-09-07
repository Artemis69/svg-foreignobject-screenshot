import { test } from 'uvu'
import * as assert from 'uvu/assert'
import {
  removeQuotes,
  getImageUrlsFromFromHtml,
  getUrlsFromCssString,
  descape,
} from '../dist/lib.js'

test('removeQuotes', () => {
  assert.is(removeQuotes(`'""'`), `""`)
  assert.is(removeQuotes(`"''"`), `''`)
  assert.is(removeQuotes(`""""`), `""`)
  assert.is(removeQuotes(`''''`), `''`)
})

test('getImageUrlsFromFromHtml', () => {
  assert.is(
    getImageUrlsFromFromHtml(`<img src="https://example.com/first.jpg"/>`)[0],
    'https://example.com/first.jpg'
  )
  assert.is(
    getImageUrlsFromFromHtml(
      `<img class="max-h-10" src="https://example.com/second.jpg" alt="Sunny Cactus"/>`
    )[0],
    'https://example.com/second.jpg'
  )
  assert.is(
    getImageUrlsFromFromHtml(
      `<img data-src="https://cactus-shop.com/cactus.webp" src="" alt="cactus" />`
    )[0],
    'https://cactus-shop.com/cactus.webp'
  )
  assert.is(
    getImageUrlsFromFromHtml(`
      <svg>
        <image xlink:href="https://example.com/buldge.jpg" />
      </svg>
  `)[0],
    'https://example.com/buldge.jpg'
  )
  assert.is(
    getImageUrlsFromFromHtml(`
      <svg>
        <image href="https://example.com/concave.jpg" />
      </svg>
  `)[0],
    'https://example.com/concave.jpg'
  )
  assert.is(
    getImageUrlsFromFromHtml(`<img src="data:image/svg+xml,..." />`).length,
    0
  )
  assert.is(
    getImageUrlsFromFromHtml(`
    <svg>
      <image href="#cute-face" />
    </svg>
  `).length,
    0
  )
  assert.is(
    getImageUrlsFromFromHtml(
      `<a href="https://artemiys-toolbox.pages.dev/">Do not click me</a>`
    ).length,
    0
  )
})

test('getUrlsFromCssString', () => {
  assert.is(
    getUrlsFromCssString(`background: url('data:image/svg+xml,')`).length,
    0
  )
  assert.is(
    getUrlsFromCssString(`background: url("data:image/svg+xml,")`).length,
    0
  )
  assert.is(
    getUrlsFromCssString(`background: url(data:image/svg+xml,)`).length,
    0
  )
  assert.is(
    getUrlsFromCssString(`background: url('./grape.jpg')`)[0],
    `./grape.jpg`
  )
  assert.is(
    getUrlsFromCssString(`background: url("./grape.jpg")`)[0],
    `./grape.jpg`
  )
  assert.is(
    getUrlsFromCssString(`background: url(./grape.jpg)`)[0],
    `./grape.jpg`
  )
})

test('descape', () => {
  assert.is(descape('&quot;'), '"')
  assert.is(descape('&#39;'), "'")
  assert.is(descape('&amp;'), '&')
  assert.is(descape('&lt;'), '<')
  assert.is(descape('&gt;'), '>')
})

test.run()
