import 'dotenv/config';

const required = ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'] as const;
const missing = required.filter(k => !process.env[k]);

if (missing.length) {
  console.error('Missing env vars:', missing.join(', '));
  process.exit(1);
}

console.log('Env OK');
