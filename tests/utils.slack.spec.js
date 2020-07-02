const {
  sendSlackMessage,
  createSlackPayload,
  formatOctoWebhookMessage
} = require('../src/utils/slack')

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
      Object.keys(this.EVENT_PROP.body).forEach(key => {
        expect(message.includes(this.EVENT_PROP.body[key]))
      })
    })

    it('with a half full payload', () => {
      delete this.EVENT_PROP.body.message
      delete this.EVENT_PROP.body.progress__completion
      delete this.EVENT_PROP.body.job__averagePrintTime
      delete this.EVENT_PROP.body.deviceIdentifier
      expect(createSlackPayload(this.EVENT_PROP)).toStrictEqual({
        channel: '#3dprinting',
        headers: { 'Content-Type': 'application/json' },
        icon_emoji: ':aws:',
        text: '',
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
      expect(message.headers).toStrictEqual({ 'Content-Type': 'application/json' })
      expect(message).not.toHaveProperty('attachments')
    })

    it('with a half full payload', () => {
      delete this.EVENT_PROP.body.message
      delete this.EVENT_PROP.body.progress__completion
      delete this.EVENT_PROP.body.job__averagePrintTime
      delete this.EVENT_PROP.body.deviceIdentifier
      expect(createSlackPayload(this.EVENT_PROP)).toStrictEqual({
        channel: '#3dprinting',
        headers: { 'Content-Type': 'application/json' },
        icon_emoji: ':aws:',
        text: '',
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
