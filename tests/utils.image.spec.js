const { uploadImageAndAddUrl } = require('../src/utils/image')
const fs = require('fs')
const { S3 } = require('aws-sdk')

const snapshotFixture = Buffer.from(fs.readFileSync('./tests/fixtures/upload.jpg')).toString(
  'binary'
)

const spy = jest.fn()
S3.prototype.putObject = spy

describe('Test uploadImageAndAddUrl()', () => {
  beforeEach(() => {
    const s3 = new S3({ region: 'us-east-1' })
    s3.putObject = jest.fn((params, cb) => {
      cb(null, { url: 'something', thumb_url: 'something else' })
    })
  })

  describe('should run correctly', () => {
    it('with a body but no images and not return anything', async done => {
      expect(await uploadImageAndAddUrl({ body: { test: 1 } })).toBe(undefined)
      done()
    })

    it('with a body and images should be normal', async done => {
      expect(
        await uploadImageAndAddUrl({ body: { snapshot: { data: snapshotFixture } } })
      ).toHaveProperty('url')
      done()
    })
  })

  describe('should fail', () => {
    it('run with no input and not return anything', async done => {
      await expect(uploadImageAndAddUrl()).rejects.toThrow(TypeError)
      done()
    })
  })
})
