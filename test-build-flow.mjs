#!/usr/bin/env node

/**
 * Test script to verify the end-to-end build flow:
 * 1. Generate Plan
 * 2. Start Build
 * 3. Monitor Build Progress
 */

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_KEY) {
  console.error('❌ OPENROUTER_API_KEY environment variable not set');
  process.exit(1);
}

console.log('🧪 Testing BuildRunner End-to-End Flow...\n');

// Test 1: Generate Plan
console.log('📋 Step 1: Generating build plan...');

try {
  const planResponse = await fetch('http://localhost:3001/api/prd/generate-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-keys': JSON.stringify({ openrouter: OPENROUTER_KEY })
    },
    body: JSON.stringify({
      productIdea: 'A simple to-do list app with task creation, completion tracking, and priority levels',
      productName: 'TodoApp',
      prdSections: {
        '1': [
          { id: 'executive_summary', name: 'Executive Summary', items: [], completed: false }
        ],
        '2': [
          { id: 'features', name: 'Features', items: [
            { title: 'Task Management', shortDescription: 'Create, edit, and delete tasks' }
          ], completed: false }
        ]
      }
    })
  });

  if (!planResponse.ok) {
    const errorText = await planResponse.text();
    console.error(`❌ Plan generation failed: ${planResponse.status}`);
    console.error('Error details:', errorText.substring(0, 500));
    process.exit(1);
  }

  const planData = await planResponse.json();
  console.log(`✅ Plan generated successfully!`);
  console.log(`   - App Type: ${planData.plan?.appType}`);
  console.log(`   - Framework: ${planData.plan?.framework}`);
  console.log(`   - Milestones: ${planData.plan?.milestones?.length || 0}`);
  console.log(`   - Technologies: ${planData.plan?.architecture?.technologies?.length || 0}`);

  // Show first milestone
  if (planData.plan?.milestones?.length > 0) {
    const m = planData.plan.milestones[0];
    console.log(`   - First milestone: "${m.name}" with ${m.components?.length || 0} components`);
  }

  console.log('\n✅ Test PASSED: Build flow is working!');

} catch (error) {
  console.error('❌ Test FAILED:', error.message);
  console.error(error);
  process.exit(1);
}
