const { json2multi, multi2json } = require('../src/utils/multipartForm')
const webhook_partial = require('./fixtures/webhook_flat_partial.json')
const webhook_full = require('./fixtures/webhook_flat.json')
const webhooks_as_string = require('./fixtures/webhooks_as_string.json')

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'

describe('json2multi()', () => {
  describe('Should create a properly formatted form url encoded string', () => {
    it('when given a partial object with values', () => {
      expect(json2multi(webhook_partial, boundary)).toBe(webhooks_as_string.webhook_partial)
    })

    it('when given a full object with values', () => {
      expect(json2multi(webhook_full, boundary)).toBe(webhooks_as_string.webhook_full)
    })

    it('when given an empty object', () => {
      expect(json2multi({}, boundary)).toBe('')
    })
  })
})

describe('multi2json()', () => {
  describe('Should create a json object from properly formatted form url encoded string', () => {
    it('when given a partial object with values', () => {
      expect(multi2json(webhooks_as_string.webhook_partial, boundary)).toEqual(webhook_partial)
    })

    it('when given a full object with values', () => {
      expect(multi2json(webhooks_as_string.webhook_full, boundary)).toEqual(webhook_full)
    })

    it('when given an empty string', () => {
      expect(multi2json('', boundary)).toStrictEqual({})
    })
  })
})

describe('back-and-forth', () => {
  describe('multi2json -> json2multi', () => {
    it('be equal', () => {
      expect(json2multi(multi2json(webhooks_as_string.webhook_partial, boundary), boundary)).toBe(
        webhooks_as_string.webhook_partial
      )
    })
  })

  describe('json2multi -> multi2json', () => {
    it('be equal', () => {
      expect(multi2json(json2multi(webhook_partial, boundary), boundary)).toEqual(webhook_partial)
    })
  })
})
