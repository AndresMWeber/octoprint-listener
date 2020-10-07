const Debug = require('debug')
const { Responses } = require('../utils/apiResponses')
const { uploadImageAndAddUrl } = require('../utils/image')
const { sendSlackMessage, createSlackPayload } = require('../utils/slack')
const { multi2json } = require('../utils/multipartForm')

const debug = new Debug('octolistener:handlers:receiveWebhook')

module.exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  debug(`Incoming event: ${JSON.stringify(event, 0, 2)}`)
  try {
    const [[, contentType, boundary]] = event.headers['Content-Type'].matchAll(
      /(.*); boundary=(.*)/g
    )
    debug(`Multi-part data contentType: "${contentType}" boundary: "${boundary}"`)

    event.body = multi2json(event.body, boundary)
    debug(`Parsed event body: %o`, event.body)

    const image_urls = await uploadImageAndAddUrl(event)

    const payload = await createSlackPayload(event, image_urls)
    const { message, response } = await sendSlackMessage(payload, {
      headers: { 'Content-Type': 'application/json' }
    })
    debug(`Slack: ${response.status} (${response.statusText}) - %o`, response.data)
    
    debug(`Success handling event: %o`, message)
    callback(null, Responses._200({ message }))
  } catch (err) {
    debug(`Error handling event: %o`, event)
    callback(null, Responses._500(err))
  }
}
