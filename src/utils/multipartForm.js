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
  debug(
    `Number of lines to parse: ${
      multipartData.split(boundary).filter(e => e && e.length > 4).length
    }`
  )
  debug(`Converting multi-part form data to json (${typeof multipartData}): %o`, multipartData)
  const parts = multipartData
    .split(boundary)
    .filter(e => e && e.length > 4)
    .reduce((o, line) => {
      const entry = {}
      let name
      let value

      try {
        ;[name, value] = parseDefault(line)
        entry[name] = value
      } catch (err) {
        try {
          ;[name, value] = parseContentType(line)
          entry[name] = value
        } catch (err) {
          debug(`Error parsing metadata: %o`, err)
        }
      } finally {
        debug(`Parsed metdata: %o`, entry[name])
      }

      return Object.assign(o, entry)
    }, {})
  const keys = Object.keys(parts)
  debug(`Successfully parsed ${keys.length} lines with keys: ${keys.join(' ')}`)
  return parts
}

const parseContentType = line => {
  debug(`parseContentType: ${typeof line}: "%o"`, line)
  const values = [...line.matchAll(/name="(.*)"(?:\r\n)+(.*)\r\n(?:--)$/g)]
  let [[, name, value]] = values
  try {
    value = JSON.parse(value)
  } catch (err) {
    value += ''
  }
  return [name, value]
}

const parseDefault = line => {
  debug(`parseDefault: ${typeof line}: "%o"`, line)
  const values = [
    ...line.matchAll(
      /name="(\w+)"; filename="(.*)"(?:\r\n)+Content-Type: (\w+\/\w+)(?:\r\n)+((\r|\n|.)+)\r\n(?:--)$/g
    )
  ]
  const [[, name, filename, contentType, imageBuffer]] = values
  return [name, { filename, data: imageBuffer, type: contentType }]
}

module.exports = {
  json2multi,
  multi2json
}
