const { uploadImageAndAddUrl } = require('../src/utils/image')

const IMAGE_PROP = ''

describe('Test uploadImageAndAddUrl()', () => {
  describe('should run correctly', () => {
    it('with a body but no images and not return anything', async done => {
      expect(await uploadImageAndAddUrl({ body: { test: 1 } })).toBe(undefined)
      done()
    })

    it('with a body and images should be normal', async done => {
      expect(await uploadImageAndAddUrl({ body: { snapshot: IMAGE_PROP } })).toBe(undefined)
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
