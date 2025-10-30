import fs from 'fs-extra';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function syncCommand(options: { push?: boolean; pull?: boolean }): Promise<void> {
  const planPath = path.join(process.cwd(), 'buildrunner/specs/plan.json');
  const statePath = path.join(process.cwd(), 'buildrunner/state/runner_state.json');

  try {
    if (options.push) {
      console.log('🔄 Pushing local spec to remote...');
      
      if (!await fs.pathExists(planPath)) {
        console.error('❌ Build spec not found:', planPath);
        process.exit(1);
      }

      const planData = await fs.readJSON(planPath);
      
      // Call spec-sync function
      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/spec-sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Sync failed: ${error}`);
      }

      const result = await response.json();
      console.log(`✅ Synced ${result.records_synced} records to remote`);
      
      // Update local state
      if (await fs.pathExists(statePath)) {
        const state = await fs.readJSON(statePath);
        state.sync = {
          lastLocalUpdate: new Date().toISOString(),
          lastRemoteUpdate: new Date().toISOString(),
          specHash: result.spec_hash
        };
        await fs.writeJSON(statePath, state, { spaces: 2 });
      }

    } else if (options.pull) {
      console.log('🔄 Pulling remote spec to local...');
      console.log('[stub] pull: GET from Supabase → write plan.json and runner_state.json');
      
    } else {
      console.log('❌ Please specify --push or --pull');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}
