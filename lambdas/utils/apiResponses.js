const CommonHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Origin": "*"
};

const Responses = {
  _200(data = {}) {
    return {
      headers: { ...CommonHeaders },
      statusCode: 200,
      body: JSON.stringify(data, null, 2)
    };
  },
  _404(data = {}) {
    return {
      headers: { ...CommonHeaders },
      statusCode: 404,
      body: JSON.stringify(data, null, 2)
    };
  },
  _400(data = {}) {
    return {
      headers: { ...CommonHeaders },
      statusCode: 400,
      body: JSON.stringify(data, null, 2)
    };
  }
};

module.exports = Responses;
