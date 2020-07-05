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
  const parts = multipartData
    .split(boundary)
    .map(data => {
      return data
        .replace(/(\r|\n)/g, '')
        .split('; ')
        .splice(1)
    })
    .filter(e => e && e.length && e[0].length)
    .reduce((o, [data, metadata]) => {
      let [[, name, value]] = data.matchAll(/name="([\w-]*)"(.*)/g)
      try {
        value = JSON.parse(value)
      } catch (err) {
        value += ''
      }
      const entry = { [name]: value }
      if (metadata) {
        const [[, filename, imageBuffer]] = metadata.matchAll(
          /filename="(.*)"Content-Type: image\/jpeg(.*)/
        )
        entry[name] = { filename, data: imageBuffer, type: 'image/jpeg' }
      }
      return Object.assign(o, entry)
    }, {})
  return parts
}

module.exports = {
  json2multi,
  multi2json
}
