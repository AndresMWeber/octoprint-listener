'use strict';

module.exports.hello = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
```
import urllib3
import json
import asyncio
from base64 import b64decode, b64encode
from datetime import datetime
from boto3 import client as aws_client
import email


MESSAGE_TEMPLATE  = '''🖨️{USER}@ *{DEVICE}* 👾::📜`{TOPIC}` 
🗃️ _{FILE_NAME}_ 🗃️

> {MESSAGE}

\`\`\`
Percent Complete: ⏳ {JOB_COMPLETION}%
Estimated Print Time: ⏲ {JOB_ESTIMATED}s
Average Print Time:  ⌛ {JOB_AVERAGE}s
Last Print Time: ⏱ {JOB_LAST_PRINT}s
Progress Print Time: {TIME_PROGRESS}s
Progress Print Time Left: {TIME_LEFT}s
\`\`\`
Check it live:  http://ender3octopi.local/ || http://ender3octopi.local:80/webcam/
'''

MESSAGE_PAYLOAD = {
    "channel": "#3dprinting", 
    "username": "AWS Lambda 3D Printerbot", 
    "text": "",
    "icon_emoji": ":aws:"
}

WEBHOOK_URL = 'https://hooks.slack.com/services/%s' % 'T2U6PFY6N/B015T06KUNN/IGHgVt3jnqdoKDwafGRFqcPb'

loop = asyncio.get_event_loop()
http = urllib3.PoolManager()
client = aws_client('s3')
BUCKET = "aw-octoprint-images"

async def upload_image_and_add_url(event):
    KEY = "screenshot_{TIME}.jpg".format(TIME=datetime.utcnow()).replace(' ', '_')
    print('Starting to upload snapshot.')
    
    if event.get('snapshot', False):
        snapshotBuffer = event.get('snapshot')
        
        response = client.put_object(
            Bucket=BUCKET,
            Key=KEY,
            Body=base64.b64decode(snapshotBuffer),
            ContentType='image/jpeg',
            ACL='public-read'
        )
        if (response['ResponseMetadata']['HTTPStatusCode'] == 200):
            url = f'https://{BUCKET}.s3.amazonaws.com/{KEY}'
            print(f'Successfully uploaded image to s3: {url}')
            return {"url": url, "thumb_url": url}
    return 
    
def lambda_handler(event, context):
    print(f'Incoming event {event}')
    
    msg = email.message_from_string(b64decode(event['body']))
    print(msg)
    if msg.is_multipart():
        print('is multipart')
        for part in msg.get_payload():
            name = part.get_param('name', header='content-disposition')
            filename = part.get_param('filename', header='content-disposition')
            # print 'name %s' % name # "always" there
            # print 'filename %s' % filename # only there for files...
            payload = part.get_payload(decode=True)
            print(payload[:100]) # output first 100 characters
    
    image_urls = loop.run_until_complete(upload_image_and_add_url(body))
    
    formattedMessage = MESSAGE_TEMPLATE.format(
        USER=body.get("job__user", ''),
        TOPIC=body.get("topic", ''),
        DEVICE=body.get("deviceIdentifier", ''),
        FILE_NAME=body.get("job__file__name", ''),
        MESSAGE=body.get("message", ''),
        JOB_COMPLETION=body.get("progress__completion", ''),
        JOB_ESTIMATED=body.get("job__estimatedPrintTime", ''),
        JOB_AVERAGE=body.get("job__averagePrintTime", ''),
        JOB_LAST_PRINT=event.get("job__lastPrintTime", ''),
        TIME_PROGRESS=event.get("progress__printTime", ''),
        TIME_LEFT=body.get("progress__printTimeLeft", '')
    )

    payload = MESSAGE_PAYLOAD.copy()
    payload["text"] = formattedMessage
    if (image_urls):
        print(image_urls)
        payload['attachments'] = [{
            "fallback": "OctoPrint Screenshot.",
            "text": "Screenshot",
            "image_url": image_urls['url'],
            "thumb_url": image_urls['thumb_url']
        }]
    print(f'Sending payload: {payload}')
    
    formatted_payload = json.dumps(payload, indent=4, sort_keys=True, ensure_ascii=False).encode('utf-8')
    
    response = http.request('POST', WEBHOOK_URL, body = formatted_payload, headers = {'Content-Type': 'application/json'}, retries = False)

    return { 'statusCode': 200, 'body': formattedMessage }
```