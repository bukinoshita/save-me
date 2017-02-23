'use strict'

const path = require('path')
const storage = require('node-persist')
const chalk = require('chalk')
const {encrypt, decrypt} = require('caesar-encrypt')

storage.initSync({
  dir: path.resolve(__dirname, 'save-me')
})

exports.save = (key, value) => {
  const encryptValue = encrypt(value, 20)

  storage.setItem(key, encryptValue, () => {
    console.log(`${chalk.green('✔')} Saved ${chalk.bold(value)} as ${chalk.bold(key)}`)
    storage.persistSync()
  })
}

exports.get = key => {
  if (storage.getItemSync(key)) {
    const matcher = storage.valuesWithKeyMatch(key)[0]

    return `${chalk.bold('⇢ ', key)}: ${decrypt(matcher, 20)}`
  }

  return `${chalk.red('✖')} ${chalk.bold(key)} does not exist, use ${chalk.bold('save-me <item>')} to save your item`
}

exports.del = key => {
  storage.removeItem(key, () => {
    console.log(`${chalk.green('✔')} ${chalk.bold(key)} was removed!`)
    storage.persistSync()
  })
}

exports.list = () => {
  const packages = storage.keys()

  if (packages.length === 0) {
    console.log(`${chalk.red('✖')} You don't have any item saved yet`)
  }

  packages.forEach(pack => {
    storage.getItem(pack)
      .then(res => console.log(`${chalk.bold('⇢ ', pack)}: ${decrypt(res, 20)}`))
  })
}
