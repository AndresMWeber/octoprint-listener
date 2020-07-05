const { S3 } = require('aws-sdk')
const { IMAGES_BUCKET: Bucket } = require('./env')
const Debug = require('debug')

const s3 = new S3({ region: 'us-east-1' })
const debug = new Debug('octolistener:utils:image')

const binaryToBuffer = binaryData => Buffer.from(binaryData, 'binary')

const uploadImageAndAddUrl = async event => {
  if (event.body.snapshot) {
    debug(`Preprocessing image data: %o`, event.body.snapshot)
    const Body = binaryToBuffer(event.body.snapshot.data)
    const Key = `snapshot_${new Date().toISOString()}.jpg`
    debug(`Starting to upload snapshot -> ${Bucket}/${Key} with Content %o`, Body)
    try {
      const response = await s3
        .putObject({
          Bucket,
          Key,
          Body,
          ContentType: 'image/jpeg',
          ACL: 'public-read'
        })
        .promise()
      const url = `https://${Bucket}.s3.amazonaws.com/${Key}`
      debug(`Successfully uploaded image to s3: ${url} with response ${response}`)
      return { url, thumb_url: url }
    } catch (err) {
      debug(`Problem uploading to S3 %o`, err)
      throw new Error(`Problem uploading to S3 ${err}`)
    }
  }
  return
}

module.exports = { uploadImageAndAddUrl }
