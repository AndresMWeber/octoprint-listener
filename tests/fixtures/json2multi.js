module.exports.json2multi = (json, boundary) => {
  return (
    Object.keys(json).reduce((acc, key) => {
      console.log(key, json[key])
      return [boundary, `Content-Disposition: form-data; name="${key}"`, '', json[key], acc].join(
        '\r\n'
      )
    }, '') + `\r\n${boundary}\r\n`
  )
}
