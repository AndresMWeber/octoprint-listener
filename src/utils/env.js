require('dotenv').config()

const IMAGES_BUCKET = process.env.BUCKET
const SLACK_WEBHOOK_BASE_URL = `https://hooks.slack.com/services/`
const SLACK_WEBHOOK_URLS = {
  octoprint: `${SLACK_WEBHOOK_BASE_URL}${process.env.SLACK_URL}`
}

module.exports = {
  IMAGES_BUCKET,
  SLACK_WEBHOOK_BASE_URL,
  SLACK_WEBHOOK_URLS
}
