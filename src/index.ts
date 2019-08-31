#!/usr/bin/env node

import chalk from 'chalk';
import CLI from './util/cli';
import * as figlet  from 'figlet';

let cli = new CLI();


console.log();
console.log();

console.log(
  chalk.bold(
    figlet.textSync('GASSER', { horizontalLayout: 'full', font: 'Broadway' })
  )
);

console.log();
console.log(chalk.green('See --help for a list of available commands.'));
console.log();


cli.processCliArgs();
