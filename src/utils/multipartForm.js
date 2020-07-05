const Debug = require('debug')

const debug = new Debug('octolistener:utils:multipartform')

const json2multi = (json, boundary) => {
  const result = Object.keys(json)
    .sort()
    .reduce((acc, key) => {
      const isBuffer = typeof json[key] === 'object'
      return [
        boundary,
        `Content-Disposition: form-data; name="${key}"${
          isBuffer ? `; filename="${json[key].filename}"\r\nContent-Type: ${json[key].type}` : ''
        }`,
        '',
        isBuffer ? json[key].data : json[key],
        acc
      ].join('\r\n')
    }, '')
  return result + (result ? `${boundary}\r\n` : '')
}

const multi2json = (multipartData, boundary) => {
  debug(`Converting multi-part form data ${typeof multipartData} to json: %o`, multipartData)
  debug(`NUMBER OF LINES ${multipartData.split(boundary).filter(e => e && e.length > 4).length}`)
  const parts = multipartData
    .split(boundary)
    .filter(e => e && e.length > 4)
    .reduce((o, line) => {
      const entry = {}
      debug(`${line.length}: %o`, line)
      try {
        let [[, name, value]] = line.matchAll(/name="(.*)"(?:\r\n)+(.*)\r\n$/g)
        try {
          value = JSON.parse(value)
        } catch (err) {
          value += ''
        }
        debug(`Parsed name: ${name} and value ${value}`)
        entry[name] = value
      } catch (err) {
        debug(`Error parsing name, attempting metadata parsing: ${err}`)
        const [[, name, filename, contentType, imageBuffer]] = line.matchAll(
          /name="(\w+)"; filename="(.*)"(?:\r\n)+Content-Type: (\w+\/\w+)(?:\r\n)+((\r|\n|.)+)\r\n$/g
        )
        entry[name] = { filename, data: imageBuffer, type: contentType }
        debug(`Parsed metdata: %o`, entry[name])
      }

      return Object.assign(o, entry)
    }, {})
  return parts
}

module.exports = {
  json2multi,
  multi2json
}
