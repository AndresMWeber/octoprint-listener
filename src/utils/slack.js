const Debug = require('debug')
const axios = require('axios')
const { SecretsManager } = require('aws-sdk')

const secrets = new SecretsManager({ region: 'us-east-1' })
const debug = Debug('utils:slack')
const WEBHOOK_BASE = 'https://hooks.slack.com/services/'
let SLACK_URL
const MESSAGE_PAYLOAD = {
  channel: '#3dprinting',
  username: 'AWS Lambda 3D Printerbot',
  text: '',
  icon_emoji: ':aws:'
}

const sendSlackMessage = async payload => {
  if (!SLACK_URL) {
    SLACK_URL = WEBHOOK_BASE + (await secrets.getSecretValue({ SecretId: 'AWCREDS' })['AW-SLACK'])
  }
  debug(`Sending to slack webhook url: ${SLACK_URL}`)
  return { response: await axios.post(SLACK_URL, payload), message: payload.text }
}

const formatOctoWebhookMessage = ({
  body: {
    job__user: USER = '',
    topic: TOPIC = '',
    deviceIdentifier: DEVICE = '',
    job__file__name: FILE_NAME = '',
    message: MESSAGE = '',
    progress__completion: JOB_COMPLETION = '',
    job__estimatedPrintTime: JOB_ESTIMATED = '',
    job__averagePrintTime: JOB_AVERAGE = '',
    job__lastPrintTime: JOB_LAST_PRINT = '',
    progress__printTime: TIME_PROGRESS = '',
    progress__printTimeLeft: TIME_LEFT = ''
  }
}) => {
  debug(`Received message inputs: %o`, {
    USER,
    TOPIC,
    DEVICE,
    FILE_NAME,
    MESSAGE,
    JOB_AVERAGE,
    JOB_COMPLETION,
    JOB_ESTIMATED,
    JOB_LAST_PRINT,
    TIME_PROGRESS,
    TIME_LEFT
  })
  return `
  🖨️${USER}@ *${DEVICE}* 👾::📜${TOPIC} 🗃️ _${FILE_NAME}_ 🗃️

  > ${MESSAGE}

  \`\`\`
  Percent Complete: ⏳ ${JOB_COMPLETION}%
  Estimated Print Time: ⏲ ${JOB_ESTIMATED}s
  Average Print Time:  ⌛ ${JOB_AVERAGE}s
  Last Print Time: ⏱ ${JOB_LAST_PRINT}s
  Progress Print Time: ${TIME_PROGRESS}s
  Progress Print Time Left: ${TIME_LEFT}s
  \`\`\`
  Check it live:  http://ender3octopi.local/ || http://ender3octopi.local:80/webcam/
  `
}

const createSlackPayload = (event, image_url) => {
  const payload = {
    headers: { 'Content-Type': 'application/json' },
    text: formatOctoWebhookMessage(event),
    ...MESSAGE_PAYLOAD
  }

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
