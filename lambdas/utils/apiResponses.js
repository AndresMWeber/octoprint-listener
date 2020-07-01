const CommonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Origin': '*'
};

const Responses = {
  _200(data = {}) {
    return {
      headers: { ...CommonHeaders },
      statusCode: 200,
      body: data
    };
  },
  _404(data = {}) {
    return {
      headers: { ...CommonHeaders },
      statusCode: 404,
      body: data
    };
  },
  _400(data = {}) {
    return {
      headers: { ...CommonHeaders },
      statusCode: 400,
      body: data
    };
  }
};

module.exports = Responses;
