const Responses = require('../utils/apiResponses')
const Debug = require('debug')

const debug = new Debug('octolistener:handlers:getUser')

const users = {
  1: { name: 'Anna', age: 25, job: 'preacher' },
  2: { name: 'Kevin', age: 65, job: 'reacher' },
  3: { name: 'Bob', age: 43, job: 'teacher' }
}

module.exports.handler = async event => {
  debug('event: %o', event)
  if (!event.pathParameters || !event.pathParameters.ID) {
    return Responses._400({ message: 'missing the ID from the path' })
  }
  const ID = event.pathParameters.ID
  if (users[ID]) {
    return Responses._200({ data: users[ID] })
  }
  return Responses._404({ message: 'id not found in the database' })
}
