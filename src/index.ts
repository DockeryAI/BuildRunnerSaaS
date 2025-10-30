#!/usr/bin/env node
import 'dotenv/config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { lintCommand } from './commands/lint.js';
import { syncCommand } from './commands/sync.js';
import { statusCommand } from './commands/status.js';

yargs(hideBin(process.argv))
  .scriptName('buildrunner')
  .command('init', 'Initialize local runner state', () => {}, async () => {
    console.log('[stub] init: create runner_state.json from template');
  })
  .command('sync', 'Sync local state with remote', (yargs) => {
    yargs
      .option('push', {
        describe: 'Push local spec to remote',
        type: 'boolean'
      })
      .option('pull', {
        describe: 'Pull remote spec to local',
        type: 'boolean'
      });
  }, async (argv) => {
    await syncCommand({ push: argv.push as boolean, pull: argv.pull as boolean });
  })
  .command('status', 'Show milestone/step/microstep status', () => {}, async () => {
    await statusCommand();
  })
  .command('lint [spec]', 'Validate build spec against schema', (yargs) => {
    yargs.positional('spec', {
      describe: 'Path to build spec file',
      type: 'string'
    });
  }, async (argv) => {
    await lintCommand(argv.spec as string);
  })
  .demandCommand()
  .help()
  .parse();
