const { handler } = require('../src/lambdas/receiveWebhook')

describe('Test receiveWebhook()', () => {
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

  describe('works when', () => {
    it('a webhook is provided in the event body', async done => {
      const values = await handler(this.EVENT_PROP)
      expect(values).toBeTruthy()
      done()
    })
  })

  describe('fails when', () => {
    it('no webhook is provided in the event body', async () => {
      await expect(handler({ blah: { test: 0 } })).rejects.toThrow(Error)
    })
  })
})
