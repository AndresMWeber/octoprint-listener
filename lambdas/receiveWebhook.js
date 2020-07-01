const Debug = require('debug');
const { S3, SecretsManager } = require('aws-sdk');
const Responses = require('./utils/apiResponses');
const axios = require('axios');

const params = { region: 'us-east-1' };
const secrets = new SecretsManager(params);
const s3 = new S3(params);
const debug = Debug('handlers:receiveWebhook');

const MESSAGE_PAYLOAD = {
  channel: '#3dprinting',
  username: 'AWS Lambda 3D Printerbot',
  text: '',
  icon_emoji: ':aws:'
};
const WEBHOOK_URL = 'https://hooks.slack.com/services/';
const Bucket = process.env.SNAPSHOT_BUCKET;

const uploadImageAndAddUrl = async event => {
  const Key = `screenshot_${new Date()}.jpg`;
  debug(`Starting to upload snapshot -> ${Key}.`);

  if (event.snapshot) {
    const snapshotBuffer = event.snapshot;

    const response = await s3.putObject({
      Bucket,
      Key,
      Body: Buffer.from(snapshotBuffer, 'base64').toString(),
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    });

    if (response.ResponseMetadata && response.ResponseMetadata.HTTPStatusCode === 200) {
      const url = 'https://{BUCKET}.s3.amazonaws.com/{KEY}';
      debug(`Successfully uploaded image to s3: ${url}`);
      return { url: url, thumb_url: url };
    }
  }
};

module.exports.handler = async event => {
  debug('Incoming event, %o', event);
  const {
    job__user: USER,
    topic: TOPIC,
    deviceIdentifier: DEVICE,
    job__file__name: FILE_NAME,
    message: MESSAGE,
    progress__completion: JOB_COMPLETION,
    job__estimatedPrintTime: JOB_ESTIMATED,
    job__averagePrintTime: JOB_AVERAGE,
    job__lastPrintTime: JOB_LAST_PRINT,
    progress__printTime: TIME_PROGRESS,
    progress__printTimeLeft: TIME_LEFT
  } = event.body;

  const message = `
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
  `;

  const image_urls = await uploadImageAndAddUrl(event);
  const SLACK_URL =
    WEBHOOK_URL + (await secrets.getSecretValue({ SecretId: 'AWCREDS' })['AW-SLACK']);

  const payload = { ...MESSAGE_PAYLOAD };
  payload.headers = { 'Content-Type': 'application/json' };
  payload.text = message;

  if (image_urls) {
    debug(image_urls);
    payload.attachments = [
      {
        fallback: 'OctoPrint Screenshot.',
        text: 'Screenshot',
        image_url: image_urls.url,
        thumb_url: image_urls.thumb_url
      }
    ];
  }
  const response = await axios.post(SLACK_URL, payload);
  debug(`%o`, response);
  return Responses._200({ message });
};
