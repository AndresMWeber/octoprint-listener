require('dotenv').config()

const IMAGES_BUCKET = process.env.AW_BUCKET
const SLACK_WEBHOOK_BASE_URL = `https://hooks.slack.com/services/`
const SLACK_WEBHOOK_URLS = {
  octoprint: `${SLACK_WEBHOOK_BASE_URL}${process.env.AW_SLACK_URL}`
}

module.exports = {
  IMAGES_BUCKET,
  SLACK_WEBHOOK_BASE_URL,
  SLACK_WEBHOOK_URLS
}
