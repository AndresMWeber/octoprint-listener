const { S3 } = require('aws-sdk')
const { IMAGES_BUCKET: Bucket } = require('./env')
const Debug = require('debug')

const s3 = new S3({ region: 'us-east-1' })
const debug = new Debug('octolistener:utils:image')

const uploadImageAndAddUrl = async event => {
  if (event.body.snapshot) {
    const Body = Buffer.from(event.body.snapshot, 'base64').toString()
    const Key = `screenshot_${new Date()}.jpg`
    debug(`Starting to upload snapshot -> ${Bucket}/${Key}.`)
    const response = await s3.putObject({
      Bucket,
      Key,
      Body,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    })

    if (response.ResponseMetadata && response.ResponseMetadata.HTTPStatusCode === 200) {
      const url = `https://${Bucket}.s3.amazonaws.com/${Key}`
      debug(`Successfully uploaded image to s3: ${url}`)
      return { url, thumb_url: url }
    }
    debug('Problem uploading to S3: %o', response)
    throw new Error(`Problem uploading to S3.`)
  }
  return
}

module.exports = { uploadImageAndAddUrl }
