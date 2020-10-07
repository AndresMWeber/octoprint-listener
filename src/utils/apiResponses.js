const CommonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Origin': '*'
}

const Responses = {
  _200(data = {}) {
    return {
      isBase64Encoded: false,
      headers: { ...CommonHeaders },
      statusCode: 200,
      body: JSON.stringify(data)
    }
  },
  _404(data = {}) {
    return {
      isBase64Encoded: false,
      headers: { ...CommonHeaders },
      statusCode: 404,
      body: JSON.stringify(data)
    }
  },
  _400(data = {}) {
    return {
      isBase64Encoded: false,
      headers: { ...CommonHeaders },
      statusCode: 400,
      body: JSON.stringify(data)
    }
  },
  _500(err = {}) {
    return {
      isBase64Encoded: false,
      headers: { ...CommonHeaders },
      statusCode: 500,
      body: JSON.stringify(err)
    }
  }
}

module.exports = { Responses }
