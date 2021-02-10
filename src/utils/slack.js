const Debug = require('debug')
const axios = require('axios')
const {
  SLACK_WEBHOOK_URLS: { octoprint: SLACK_URL }
} = require('./env')

const debug = new Debug('octolistener:utils:slack')
const MESSAGE_PAYLOAD = {
  channel: '#3dprinting',
  username: 'AWS Lambda 3D Printerbot',
  text: '',
  icon_emoji: ':aws:'
}

const unixTimestampToDateString = unixTimestamp => new Date(unixTimestamp * 1e3).toISOString()

const sendSlackMessage = async (payload, options) => {
  if (SLACK_URL) {
    debug(`Sending to slack webhook url: ${SLACK_URL}`)
    try {
      const response = await axios.post(SLACK_URL, payload, options)
      return { response, message: payload.text }
    } catch (err) {
      debug(`Failed sending payload %o to slack webhook URL: ${err}`, payload)
      throw new Error(
        `Failed sending payload to slack webhook URL ${
          err.response.data
        } from payload ${JSON.stringify(payload)}`
      )
    }
  }
  throw new Error('Could not determine slack webhook URL endpoint to send to')
}

const formatOctoWebhookMessage = ({
  body: {
    deviceIdentifier: DEVICE = '',
    topic: TOPIC = '',
    message: MESSAGE = '',
    currentTime: CURRENT_TIME = '',
    state,
    extra,
    job: {
      user: USER = '',
      lastPrintTime: JOB_LAST_PRINT = '',
      estimatedPrintTime: JOB_ESTIMATED = '',
      file: { name: FILE_NAME = '' }
    },
    progress: {
      completion: JOB_COMPLETION = '',
      printTime: TIME_PROGRESS = '',
      printTimeLeft: TIME_LEFT = ''
    }
  }
}) => {
  debug(`Received message inputs: %o`, {
    USER,
    TOPIC,
    DEVICE,
    FILE_NAME,
    MESSAGE,
    JOB_COMPLETION,
    JOB_ESTIMATED,
    JOB_LAST_PRINT,
    TIME_PROGRESS,
    TIME_LEFT,
    CURRENT_TIME,
    extra,
    state
  })
  return `
  🖨️${USER}@ *${DEVICE}* 👾::📜${TOPIC} 🗃️ _${FILE_NAME}_ 🗃️
  ⏲ ${unixTimestampToDateString(CURRENT_TIME)} ⏲
  Status(es): ${Object.keys(state.flags).filter(flag => state.flags[flag])}

  > ${MESSAGE}

  \`\`\`
  Percent Complete: ⏳ ${JOB_COMPLETION}%
  Estimated Print Time: ⏲ ${JOB_ESTIMATED}s
  Last Print Time: ⏱ ${JOB_LAST_PRINT}s
  Progress Print Time: ${TIME_PROGRESS}s
  Progress Print Time Left: ${TIME_LEFT}s
  \`\`\`
  Check it live:  http://ender3octopi.local/ || http://ender3octopi.local:80/webcam/
  `
}

const createSlackPayload = (event, image_url) => {
  const payload = { ...MESSAGE_PAYLOAD }
  payload.text = formatOctoWebhookMessage(event)

  if (image_url) {
    payload.attachments = [
      {
        fallback: 'OctoPrint Screenshot.',
        text: 'Screenshot',
        image_url: image_url.url,
        thumb_url: image_url.thumb_url
      }
    ]
  }
  debug(`Created slack message payload %o`, payload)
  return payload
}

module.exports = {
  sendSlackMessage,
  createSlackPayload,
  formatOctoWebhookMessage
}
