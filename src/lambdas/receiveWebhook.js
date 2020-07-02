const Debug = require('debug')
const Responses = require('../utils/apiResponses')
const { uploadImageAndAddUrl } = require('../utils/image')
const { sendSlackMessage, createSlackPayload } = require('../utils/slack')

const debug = Debug('handlers:receiveWebhook')

module.exports.handler = async event => {
  debug('Incoming event, %o', event)
  const image_urls = await uploadImageAndAddUrl(event)
  const payload = await createSlackPayload(event, image_urls)
  const { message, response } = await sendSlackMessage(payload)
  debug(`%o`, response)
  return Responses._200({ message })
}
