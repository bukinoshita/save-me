#!/usr/bin/env node
'use strict'

const inquirer = require('inquirer')
const meow = require('meow')
const updateNotifier = require('update-notifier')
const storage = require('./storage')

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

    -h, --help         Show help options
    -v, --version      Show version
    -c, --copy         Copy item to clipboard
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

const run = () => {
  if (cli.input[0]) {
    return storage.get(cli.input[0], { copyClipboard: cli.flags.copy })
  } else if (cli.flags.list) {
    return storage.list()
  } else if (cli.flags.remove) {
    return storage.del(cli.flags.remove)
  }

  inquirer
    .prompt([
      { name: 'title', message: 'Title' },
      { name: 'description', message: 'Description' }
    ])
    .then(result => {
      const { title, description } = result
      storage.save(title, description)
    })
}

run(cli)
