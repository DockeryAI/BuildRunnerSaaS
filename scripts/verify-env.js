#!/usr/bin/env node

/**
 * Environment variable verification script
 * Ensures all required environment variables are present and properly configured
 */

const fs = require('fs');
const path = require('path');

// Required environment variables by category
const REQUIRED_ENV_VARS = {
  core: [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ],
  figma: [
    'FIGMA_PROJECT_ID',
    'FIGMA_FILE_ID', 
    'FIGMA_TOKEN'
  ]
};

// Optional environment variables
const OPTIONAL_ENV_VARS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY'
];

function maskSecret(value) {
  if (!value || value.length < 8) {
    return '[MISSING]';
  }
  return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
}

function checkEnvironmentVariables() {
  console.log('🔍 Verifying environment variables...\n');
  
  let hasErrors = false;
  const results = {};

  // Check required variables
  for (const [category, vars] of Object.entries(REQUIRED_ENV_VARS)) {
    console.log(`📋 ${category.toUpperCase()} Variables:`);
    results[category] = {};
    
    for (const varName of vars) {
      const value = process.env[varName];
      const status = value ? '✅' : '❌';
      const maskedValue = value ? maskSecret(value) : '[MISSING]';
      
      console.log(`  ${status} ${varName}: ${maskedValue}`);
      
      results[category][varName] = {
        present: !!value,
        masked: maskedValue
      };
      
      if (!value) {
        hasErrors = true;
      }
    }
    console.log('');
  }

  // Check optional variables
  console.log('🔧 OPTIONAL Variables:');
  results.optional = {};
  
  for (const varName of OPTIONAL_ENV_VARS) {
    const value = process.env[varName];
    const status = value ? '✅' : '⚠️ ';
    const maskedValue = value ? maskSecret(value) : '[NOT SET]';
    
    console.log(`  ${status} ${varName}: ${maskedValue}`);
    
    results.optional[varName] = {
      present: !!value,
      masked: maskedValue
    };
  }

  console.log('');

  // Validate Figma-specific requirements
  if (process.env.FIGMA_TOKEN && process.env.FIGMA_FILE_ID) {
    console.log('🎨 Figma Integration:');
    
    // Validate token format
    const token = process.env.FIGMA_TOKEN;
    if (token.startsWith('figd_')) {
      console.log('  ✅ Token format: Valid Figma token');
    } else {
      console.log('  ⚠️  Token format: May not be a valid Figma token');
    }
    
    // Validate file ID format
    const fileId = process.env.FIGMA_FILE_ID;
    if (fileId.length >= 20 && /^[a-zA-Z0-9]+$/.test(fileId)) {
      console.log('  ✅ File ID format: Valid');
    } else {
      console.log('  ⚠️  File ID format: May not be valid');
    }
    
    console.log('');
  }

  // Summary
  if (hasErrors) {
    console.log('❌ Environment verification FAILED');
    console.log('Please set the missing required environment variables.');
    console.log('Copy .env.example to .env and fill in the values.\n');
    process.exit(1);
  } else {
    console.log('✅ Environment verification PASSED');
    console.log('All required environment variables are present.\n');
  }

  return results;
}

function main() {
  // Load .env file if it exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  }

  try {
    const results = checkEnvironmentVariables();
    
    // Write results to file for CI/CD
    const outputPath = path.join(process.cwd(), '.env-check-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error('❌ Environment verification failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkEnvironmentVariables, maskSecret };
