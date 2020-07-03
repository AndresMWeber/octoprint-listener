const { createSlackPayload, formatOctoWebhookMessage } = require('../src/utils/slack')
const webhookPayload = require('./fixtures/webhook_flat.json')
const Debug = require('debug')

const debug = new Debug('tests:slack')
const REQUIRED_ENTRIES = [
  'job__user',
  'topic',
  'deviceIdentifier',
  'job__file__name',
  'message',
  'progress__completion',
  'job__estimatedPrintTime',
  'job__averagePrintTime',
  'job__lastPrintTime',
  'progress__printTime',
  'progress__printTimeLeft'
]

describe('formatOctoWebhookMessage()', () => {
  describe('should run correctly', () => {
    beforeEach(() => {
      this.EVENT_PROP = {
        body: {
          job__user: 'John',
          topic: 'Cows',
          deviceIdentifier: 'A cool device',
          job__file__name: 'test.file',
          message: 'completed a bit',
          progress__completion: 50,
          job__estimatedPrintTime: 120,
          job__averagePrintTime: 100,
          job__lastPrintTime: 80,
          progress__printTime: 60,
          progress__printTimeLeft: 60
        }
      }
    })

    it('correct message is sent from a full payload', () => {
      const message = formatOctoWebhookMessage(this.EVENT_PROP)
      debug(message)
      debug(this.EVENT_PROP.body)
      REQUIRED_ENTRIES.forEach(key => {
        debug(key, this.EVENT_PROP.body[key])
        expect(message.includes(this.EVENT_PROP.body[key])).toBeTruthy()
      })
    })

    it('correct message is sent with an extended payload', () => {
      const message = formatOctoWebhookMessage({ body: webhookPayload })
      debug(message)
      debug(webhookPayload)
      REQUIRED_ENTRIES.forEach(key => {
        debug(key, webhookPayload[key])
        expect(message.includes(webhookPayload[key])).toBeTruthy()
      })
    })

    it('with a half full payload', () => {
      delete this.EVENT_PROP.body.message
      delete this.EVENT_PROP.body.progress__completion
      delete this.EVENT_PROP.body.job__averagePrintTime
      delete this.EVENT_PROP.body.deviceIdentifier
      expect(createSlackPayload(this.EVENT_PROP)).toStrictEqual({
        channel: '#3dprinting',
        icon_emoji: ':aws:',
        text:
          '\n' +
          '  🖨️John@ ** 👾::📜Cows 🗃️ _test.file_ 🗃️\n' +
          '\n' +
          '  > \n' +
          '\n' +
          '  ```\n' +
          '  Percent Complete: ⏳ %\n' +
          '  Estimated Print Time: ⏲ 120s\n' +
          '  Average Print Time:  ⌛ s\n' +
          '  Last Print Time: ⏱ 80s\n' +
          '  Progress Print Time: 60s\n' +
          '  Progress Print Time Left: 60s\n' +
          '  ```\n' +
          '  Check it live:  http://ender3octopi.local/ || http://ender3octopi.local:80/webcam/\n' +
          '  ',
        username: 'AWS Lambda 3D Printerbot'
      })
    })
  })

  describe('should fail', () => {
    describe('with an incomplete payload:', () => {
      it('with an empty payload', () => {
        expect(() => createSlackPayload({})).toThrow(TypeError)
      })
    })

    describe('with non object input:', () => {
      it('string', () => {
        expect(() => formatOctoWebhookMessage('asdf')).toThrow(TypeError)
      })

      it('number', () => {
        expect(() => formatOctoWebhookMessage(1)).toThrow(TypeError)
      })

      it('boolean', () => {
        expect(() => formatOctoWebhookMessage(true)).toThrow(TypeError)
      })
    })
  })
})

describe('createSlackPayload()', () => {
  beforeEach(() => {
    this.EVENT_PROP = {
      body: {
        job__user: 'John',
        topic: 'Cows',
        deviceIdentifier: 'A cool device',
        job__file__name: 'test.file',
        message: 'completed a bit',
        progress__completion: 50,
        job__estimatedPrintTime: 120,
        job__averagePrintTime: 100,
        job__lastPrintTime: 80,
        progress__printTime: 60,
        progress__printTimeLeft: 60
      }
    }
  })

  describe('should run correctly', () => {
    it('correct payload is created from an event with no images', () => {
      const message = createSlackPayload(this.EVENT_PROP)
      expect(message).toHaveProperty('text')
      expect(message).toHaveProperty('channel')
      expect(message).toHaveProperty('channel')
      expect(message).toHaveProperty('icon_emoji')
      expect(message).not.toHaveProperty('attachments')
    })

    it('with a half full payload', () => {
      delete this.EVENT_PROP.body.message
      delete this.EVENT_PROP.body.progress__completion
      delete this.EVENT_PROP.body.job__averagePrintTime
      delete this.EVENT_PROP.body.deviceIdentifier
      expect(createSlackPayload(this.EVENT_PROP)).toStrictEqual({
        channel: '#3dprinting',
        icon_emoji: ':aws:',
        text: `
  🖨️John@ ** 👾::📜Cows 🗃️ _test.file_ 🗃️

  > 

  \`\`\`
  Percent Complete: ⏳ %
  Estimated Print Time: ⏲ 120s
  Average Print Time:  ⌛ s
  Last Print Time: ⏱ 80s
  Progress Print Time: 60s
  Progress Print Time Left: 60s
  \`\`\`
  Check it live:  http://ender3octopi.local/ || http://ender3octopi.local:80/webcam/
  `,
        username: 'AWS Lambda 3D Printerbot'
      })
    })

    it('correct message is created from a payload with a single image', () => {
      const payload = createSlackPayload(this.EVENT_PROP, {
        url: 'www.blah.com/blah.jpg',
        thumb_url: 'www.blargon.com/schmiffles.jpg'
      })
      expect(payload.attachments).toStrictEqual([
        {
          fallback: 'OctoPrint Screenshot.',
          image_url: 'www.blah.com/blah.jpg',
          text: 'Screenshot',
          thumb_url: 'www.blargon.com/schmiffles.jpg'
        }
      ])
    })

    it('correct message is created from a payload with a no thumbnail', () => {
      const payload = createSlackPayload(this.EVENT_PROP, { url: 'www.blah.com/blah.jpg' })
      expect(payload.attachments).toStrictEqual([
        {
          fallback: 'OctoPrint Screenshot.',
          image_url: 'www.blah.com/blah.jpg',
          text: 'Screenshot',
          thumb_url: undefined
        }
      ])
    })
  })

  describe('should fail', () => {
    describe('with incomplete payload:', () => {
      it('with an empty payload', () => {
        expect(() => createSlackPayload({})).toThrow(TypeError)
      })
    })

    describe('with non object input:', () => {
      it('string', () => {
        expect(() => createSlackPayload('asdf')).toThrow(TypeError)
      })

      it('number', () => {
        expect(() => createSlackPayload(1)).toThrow(TypeError)
      })

      it('boolean', () => {
        expect(() => createSlackPayload(true)).toThrow(TypeError)
      })
    })
  })
})
