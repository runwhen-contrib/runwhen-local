'use strict'
const path = require('path')
const fs = require('fs')
const writeFileAtomic = require('write-file-atomic')
const YAML = require('js-yaml')

const main = (fn, fp, data, opts) => {
  if (!fp) {
    throw new TypeError('Expected a filepath')
  }

  if (data === undefined) {
    throw new TypeError('Expected data to stringify')
  }

  opts = opts || {}

  const yaml = YAML.dump(data, opts)

  return fn(fp, yaml, { mode: opts.mode })
}

module.exports = async (fp, data, opts) => {
  await fs.promises.mkdir(path.dirname(fp), { recursive: true })
  return main(writeFileAtomic, fp, data, opts)
}

module.exports.sync = (fp, data, opts) => {
  fs.mkdirSync(path.dirname(fp), { recursive: true })
  main(writeFileAtomic.sync, fp, data, opts)
}
