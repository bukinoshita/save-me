'use strict'

const path = require('path')
const storage = require('node-persist')
const chalk = require('chalk')
const { encrypt, decrypt } = require('caesar-encrypt')
const clipboardy = require('clipboardy')
const logSymbols = require('log-symbols')

storage.initSync({
  dir: path.resolve(__dirname, 'save-me')
})

exports.save = (key, value) => {
  const encryptValue = encrypt(value, 20)

  storage.setItem(key, encryptValue, () => {
    console.log(
      `${chalk.green(logSymbols.success)} Saved ${chalk.bold(
        value
      )} as ${chalk.bold(key)}`
    )
    storage.persistSync()
  })
}

exports.get = (key, { copyClipboard }) => {
  if (storage.getItemSync(key)) {
    const matcher = storage.valuesWithKeyMatch(key)[0]

    if (copyClipboard) {
      clipboardy.writeSync(decrypt(matcher, 20))
    }

    return console.log(`${chalk.bold('⇢ ', key)}: ${decrypt(matcher, 20)}`)
  }

  console.log(
    `${chalk.red(logSymbols.error)} ${chalk.bold(
      key
    )} does not exist, use ${chalk.bold('save-me <item>')} to save your item`
  )
}

exports.del = key => {
  storage.removeItem(key, () => {
    console.log(
      `${chalk.green(logSymbols.success)} ${chalk.bold(key)} was removed!`
    )
    storage.persistSync()
  })
}

exports.list = () => {
  const packages = storage.keys()

  if (packages.length === 0) {
    console.log(
      `${chalk.red(logSymbols.error)} You don't have any item saved yet`
    )
  }

  packages.forEach(pack => {
    storage
      .getItem(pack)
      .then(res =>
        console.log(`${chalk.bold('⇢ ', pack)}: ${decrypt(res, 20)}`)
      )
  })
}
