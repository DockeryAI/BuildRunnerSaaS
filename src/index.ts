#!/usr/bin/env node
import 'dotenv/config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .scriptName('buildrunner')
  .command('init', 'Initialize local runner state', () => {}, async () => {
    console.log('[stub] init: create runner_state.json from template');
  })
  .command('sync', 'Sync local state with remote', () => {}, async () => {
    console.log('[stub] sync: compare and push changes (coming in Phase 1 Step 3+)');
  })
  .command('status', 'Show milestone/step/microstep status', () => {}, async () => {
    console.log('[stub] status: print summary table');
  })
  .demandCommand()
  .help()
  .parse();
