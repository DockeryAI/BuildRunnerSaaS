/**
 * Script to disable post-build code reviews
 * Run with: npx tsx scripts/disable-reviews.ts
 */

import { setReviewEnabled } from '../lib/post-build-review';

// Disable reviews
setReviewEnabled(false);

console.log('✅ Post-build reviews disabled');
console.log('');
console.log('To re-enable reviews, run: npx tsx scripts/enable-reviews.ts');
