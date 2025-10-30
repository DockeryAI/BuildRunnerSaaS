import fs from 'fs-extra';
import path from 'path';
import { validateSpec } from '../utils/schemaValidator.js';

export async function lintCommand(specPath?: string): Promise<void> {
  const planPath = specPath || path.join(process.cwd(), 'buildrunner/specs/plan.json');
  
  try {
    console.log(`Linting build spec: ${planPath}`);
    
    if (!await fs.pathExists(planPath)) {
      console.error(`❌ Build spec not found: ${planPath}`);
      process.exit(1);
    }
    
    const planData = await fs.readJSON(planPath);
    const result = validateSpec(planData);
    
    if (result.valid) {
      console.log('✅ Build spec validation passed - 0 validation errors');
    } else {
      console.error('❌ Build spec validation failed:');
      result.errors?.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error}`);
      });
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error reading or parsing build spec:', error);
    process.exit(1);
  }
}
