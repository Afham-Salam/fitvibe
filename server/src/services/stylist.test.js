import test from 'node:test'
import assert from 'node:assert/strict'
import { suggestStyles, validateResult } from './stylist.js'
import { validImage } from '../routes/stylist.js'

const outfit = { title: 'Casual', reason: 'Neutral colors balance blue.', pieces: ['Blue shirt', 'Beige chinos'], colors: ['#0000ff', '#ddccaa'], tip: 'Roll the sleeves.' }
const result = { isClothing: true, message: 'A blue shirt.', garment: { name: 'Shirt', color: 'Blue', pattern: 'Solid', style: 'Casual' }, outfits: [outfit, outfit, outfit], similar: Array.from({ length: 3 }, () => ({ name: 'Linen shirt', reason: 'Similar relaxed shape.', category: 'tops' })) }
test('validates structured results and rejects unusable colors or missing outfits', () => {
  assert.deepEqual(validateResult(result), result)
  assert.throws(() => validateResult({ ...result, outfits: [] }))
  assert.throws(() => validateResult({ ...result, outfits: [{ ...outfit, colors: ['red'] }, outfit, outfit] }))
  assert.deepEqual(validateResult({ isClothing: false, message: 'No clothing found.' }), { isClothing: false, message: 'No clothing found.' })
})
test('rejects spoofed image types', () => {
  assert.equal(validImage({ mimetype: 'image/png', buffer: Buffer.from('not an image') }), false)
  assert.equal(validImage({ mimetype: 'image/png', buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]) }), true)
  assert.equal(validImage({ mimetype: 'image/webp', buffer: Buffer.from('RIFF0000WEBPdata') }), true)
})
test('provider integration handles config, quota, malformed replies, and valid replies', async () => {
  const originalKey = process.env.GEMINI_API_KEY
  const originalFetch = globalThis.fetch
  const file = { mimetype: 'image/jpeg', buffer: Buffer.from('test') }
  const prefs = { occasion: 'Everyday', preference: 'Any style', correction: '' }
  try {
    delete process.env.GEMINI_API_KEY
    await assert.rejects(suggestStyles(file, prefs), { status: 503 })
    process.env.GEMINI_API_KEY = 'test-key'
    globalThis.fetch = async () => ({ ok: false, status: 429 })
    await assert.rejects(suggestStyles(file, prefs), { status: 429 })
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ candidates: [{ finishReason: 'MAX_TOKENS' }] }) })
    await assert.rejects(suggestStyles(file, prefs), { status: 502 })
    globalThis.fetch = async (_url, options) => {
      assert.equal(options.headers['x-goog-api-key'], 'test-key')
      const body = JSON.parse(options.body)
      const outfitSchema = body.generationConfig.responseSchema.properties.outfits.items.properties
      assert.equal(outfitSchema.pieces.minItems, 2)
      assert.equal(outfitSchema.pieces.maxItems, 6)
      assert.equal(outfitSchema.colors.minItems, 2)
      assert.equal(outfitSchema.colors.maxItems, 5)
      assert.match(outfitSchema.colors.items.description, /hexadecimal/)
      assert.equal(body.contents[0].parts[1].inlineData.mimeType, 'image/jpeg')
      return { ok: true, json: async () => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(result) }] } }] }) }
    }
    assert.deepEqual(await suggestStyles(file, prefs), result)
  } finally {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY
    else process.env.GEMINI_API_KEY = originalKey
    globalThis.fetch = originalFetch
  }
})
