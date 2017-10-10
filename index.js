#!/usr/bin/env node
'use strict'

const inquirer = require('inquirer')
const meow = require('meow')
const { bold, italic } = require('chalk')
const updateNotifier = require('update-notifier')
const SaveLocal = require('save-local')
const shoutSuccess = require('shout-success')
const shoutError = require('shout-error')
const shoutMessage = require('shout-message')
const clipboardy = require('clipboardy')

const saveLocal = new SaveLocal('save-me')

const cli = meow(
  `
  Usage:
    $ save-me          Save an item
    $ save-me <item>   Search and return an item

  Example:
    $ save-me
    $ save-me <item> --copy
    $ save-me -l
    $ save-me -r <item>

  Options:
    -r, --remove       Remove item selected
    -l, --list         List all saved items
    -c, --copy         Copy item to clipboard
    -h, --help         Show help options
    -v, --version      Show version
`,
  {
    alias: {
      r: 'remove',
      l: 'list',
      h: 'help',
      v: 'version',
      c: 'copy'
    }
  }
)

updateNotifier({ pkg: cli.pkg }).notify()

const run = async () => {
  const input = cli.input[0]
  const { list, remove, copy } = cli.flags

  if (input) {
    const item = await saveLocal.get(input)

    if (copy) {
      clipboardy.writeSync(item)
    }

    const message = item
      ? shoutSuccess(`The value for ${bold(input)} is ${italic(item)}.`)
      : shoutError(`${bold(input)} does not exist!`)

    return message
  }

  if (list) {
    const items = await saveLocal.list()
    const plural = items.length > 1 ? 'items' : 'item'

    shoutMessage(`Found ${bold(items.length)} ${plural}\n`)

    return items.map(({ name, value }) =>
      console.log(`${bold('⇢ ', name)}: ${value}`)
    )
  }

  if (remove) {
    const item = await saveLocal.remove(remove)
    const message = item
      ? shoutSuccess(`${bold(remove)} was deleted!`)
      : shoutError(`${bold(remove)} does not exist!`)

    return message
  }

  const { name, value } = await inquirer.prompt([
    { name: 'name', message: 'Name' },
    { name: 'value', message: 'Value' }
  ])

  await saveLocal.set({ name, value })

  return shoutSuccess(`${italic(value)} was saved under ${bold(name)}.`)
}

run()
