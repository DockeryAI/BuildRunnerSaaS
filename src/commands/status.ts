import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function statusCommand(): Promise<void> {
  try {
    console.log('📊 BuildRunner Status');
    console.log('====================');
    
    // Test Supabase connection
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1);

    if (error) {
      console.log('🔴 Supabase: ERROR -', error.message);
    } else {
      console.log('🟢 Supabase: OK');
    }

    // TODO: Add more status checks
    console.log('[stub] status: print summary table');

  } catch (error) {
    console.error('❌ Status check failed:', error);
    console.log('🔴 Supabase: ERROR');
  }
}
