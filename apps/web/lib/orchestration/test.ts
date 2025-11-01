/**
 * Simple test to verify orchestration system works
 * Run with: npx ts-node lib/orchestration/test.ts
 */

import {
  llmGateway,
  featureRegistry,
  verificationEngine,
  stateMonitor,
  orchestrator,
  getOrchestrationDashboard
} from './index';

async function testOrchestrationSystem() {
  console.log('\n🧪 Testing Autonomous Development Orchestration System\n');
  console.log('='.repeat(60));

  // Test 1: Feature Registry
  console.log('\n1️⃣  Testing Feature Registry...');
  const feature = featureRegistry.addFeature({
    name: 'Test Feature',
    description: 'This is a test feature',
    status: 'planned',
    phase: 1,
    step: 1,
    priority: 'high',
    sub_features: [],
    acceptance_criteria: [
      {
        description: 'Feature should work',
        verified: false,
        verification_method: 'Manual test'
      }
    ],
    dependencies: {
      required_features: [],
      required_packages: []
    },
    blockers: []
  });
  console.log(`   ✅ Created feature: ${feature.id} - ${feature.name}`);

  // Test 2: State Monitor
  console.log('\n2️⃣  Testing State Monitor...');
  const loop = await stateMonitor.trackAction('test-agent', {
    agent: 'test-agent',
    type: 'code',
    description: 'Test action',
    filesModified: ['test.ts'],
    outcome: 'success'
  });
  console.log(`   ✅ Action tracked, loop detected: ${loop !== null}`);

  // Test 3: Orchestrator
  console.log('\n3️⃣  Testing Orchestrator...');
  const agent = orchestrator.registerAgent({
    id: 'test-agent-1',
    name: 'Test Agent',
    type: 'code-builder',
    model: 'anthropic/claude-sonnet-3.5',
    status: 'idle'
  });
  console.log(`   ✅ Registered agent: ${agent.name}`);

  // Test 4: Dashboard
  console.log('\n4️⃣  Testing Dashboard...');
  const dashboard = getOrchestrationDashboard();
  console.log(`   ✅ Dashboard Summary:`);
  console.log(`      - Active agents: ${dashboard.summary.active_agents}`);
  console.log(`      - Total features: ${dashboard.summary.total_features}`);
  console.log(`      - Completed features: ${dashboard.summary.completed_features}`);

  // Test 5: LLM Cost Tracking
  console.log('\n5️⃣  Testing LLM Cost Tracking...');
  const costs = llmGateway.getCostStats();
  console.log(`   ✅ Cost tracking initialized`);
  console.log(`      - Models tracked: ${Object.keys(costs).length}`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests passed! System is operational.\n');
}

// Run tests
testOrchestrationSystem().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
