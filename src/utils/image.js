const { S3 } = require('aws-sdk')
const Debug = require('debug')

const s3 = new S3({ region: 'us-east-1' })
const debug = Debug('utils:image')
const Bucket = process.env.SNAPSHOT_BUCKET

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
      return { url: url, thumb_url: url }
    } else {
      debug('Problem uploading to S3: %o', response)
      throw new Error(`Problem uploading to S3.`)
    }
  }
}

module.exports = { uploadImageAndAddUrl }
