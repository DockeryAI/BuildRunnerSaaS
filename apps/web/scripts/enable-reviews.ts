/**
 * Script to enable post-build code reviews
 * Run with: npx tsx scripts/enable-reviews.ts
 */

import { setReviewEnabled } from '../lib/post-build-review';

// Enable reviews for next 100 builds
setReviewEnabled(true, 100);

console.log('✅ Post-build reviews enabled for next 100 builds!');
console.log('📋 Reviews will automatically query 7 LLMs after each build');
console.log('🔧 Consensus errors will be auto-fixed');
console.log('📚 Results will feed into Phase 3 learning system');
console.log('');
console.log('To disable reviews, run: npx tsx scripts/disable-reviews.ts');
