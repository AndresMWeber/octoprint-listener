const { handler } = require('../src/lambdas/receiveWebhook')
const fs = require('fs')

const snapshotFixture = Buffer.from(fs.readFileSync('./tests/fixtures/test.jpg'), 'binary').toString(
  'base64'
)

describe('Test receiveWebhook()', () => {
  beforeEach(() => {
    this.EVENT_PROP = {
      headers: {
        'Content-Type':
          'multipart/form-data; boundary=--------------------------465539635644023356091430'
      },
      body:
        '----------------------------465539635644023356091430\r\n' +
        'Content-Disposition: form-data; name="job__user"\r\n' +
        '\r\n' +
        'John\r\n' +
        '----------------------------465539635644023356091430\r\n' +
        'Content-Disposition: form-data; name="topic"\r\n' +
        '\r\n' +
        'Cows\r\n' +
        '----------------------------465539635644023356091430\r\n' +
        'Content-Disposition: form-data; name="job__file__name"\r\n' +
        '\r\n' +
        'test.file\r\n' +
        '----------------------------465539635644023356091430\r\n' +
        'Content-Disposition: form-data; name="message"\r\n' +
        '\r\n' +
        'completed a bit\r\n' +
        '----------------------------465539635644023356091430\r\n' +
        'Content-Disposition: form-data; name="progress__completion"\r\n' +
        '\r\n' +
        '50\r\n' +
        '----------------------------465539635644023356091430\r\n' +
        'Content-Disposition: form-data; name="job__estimatedPrintTime"\r\n' +
        '\r\n' +
        '120\r\n' +
        '----------------------------465539635644023356091430\r\n' +
        'Content-Disposition: form-data; name="job__averagePrintTime"\r\n' +
        '\r\n' +
        '100\r\n' +
        '----------------------------465539635644023356091430\r\n' +
        'Content-Disposition: form-data; name="job__lastPrintTime"\r\n' +
        '\r\n' +
        '80\r\n' +
        '----------------------------465539635644023356091430\r\n' +
        'Content-Disposition: form-data; name="progress__printTime"\r\n' +
        '\r\n' +
        '60\r\n' +
        '----------------------------465539635644023356091430\r\n' +
        'Content-Disposition: form-data; name="progress__printTimeLeft"\r\n' +
        '\r\n' +
        '60\r\n' +
        '----------------------------465539635644023356091430\r\n' +
        'Content-Disposition: form-data; name="deviceIdentifier"\r\n' +
        '\r\n' +
        'A Cool Device\r\n' +
        '----------------------------465539635644023356091430\r\n' +
        'Content-Disposition: form-data; name="snapshot"; filename="test.jpg"\r\n' +
        'Content-Type: image/jpeg\r\n' +
        '\r\n' +
        snapshotFixture +
        '\r\n' +
        '----------------------------465539635644023356091430--\r\n',
      isBase64Encoded: false
    }
  })

  describe('works when', () => {
    it('a webhook is provided in the event body', async done => {
      const values = await handler(this.EVENT_PROP)
      expect(values).toBeTruthy()
      done()
    })
  })

  describe('fails when', () => {
    it('no webhook is provided in the event body', async () => {
      await expect(handler({ body: 'this is a body' })).rejects.toThrow(Error)
    })
  })
})
