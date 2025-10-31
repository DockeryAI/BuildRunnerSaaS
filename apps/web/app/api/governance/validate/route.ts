import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';
import { auditLogger } from '../../../../lib/audit';

// Initialize AJV with formats
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const ValidateRequestSchema = z.object({
  policy: z.union([z.string(), z.record(z.any())]),
  format: z.enum(['yaml', 'json']).default('yaml'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { policy, format } = ValidateRequestSchema.parse(body);

    console.log('[GOVERNANCE_VALIDATE] Validating policy');

    // Load schema
    const schemaPath = path.join(process.cwd(), 'governance/policy.schema.json');
    const schema = await fs.readJSON(schemaPath);

    // Parse policy based on format
    let policyData: any;
    try {
      if (format === 'yaml') {
        policyData = typeof policy === 'string' ? yaml.load(policy) : policy;
      } else {
        policyData = typeof policy === 'string' ? JSON.parse(policy) : policy;
      }
    } catch (parseError) {
      return NextResponse.json({
        valid: false,
        errors: [{
          message: `Invalid ${format.toUpperCase()} format`,
          details: parseError instanceof Error ? parseError.message : 'Parse error'
        }]
      }, { status: 400 });
    }

    // Validate against schema
    const validate = ajv.compile(schema);
    const valid = validate(policyData);

    const result = {
      valid,
      errors: valid ? [] : (validate.errors || []).map(error => ({
        path: error.instancePath || error.schemaPath,
        message: error.message,
        value: error.data,
        allowedValues: error.params?.allowedValues,
      })),
      warnings: [],
      metadata: {
        version: policyData?.version,
        project_id: policyData?.project_id,
        updated_at: policyData?.updated_at,
        schema_version: schema.$schema,
      }
    };

    // Add warnings for best practices
    if (valid) {
      const warnings = [];

      // Check for weak secret patterns
      if (policyData.secret_scan?.deny_patterns?.length < 5) {
        warnings.push({
          type: 'security',
          message: 'Consider adding more secret detection patterns for better security',
          suggestion: 'Add patterns for common API keys, tokens, and credentials'
        });
      }

      // Check for missing protected paths
      const criticalPaths = ['/buildrunner/', '/.github/', '/supabase/'];
      const missingPaths = criticalPaths.filter(path => 
        !policyData.protected_paths?.some((p: string) => p.startsWith(path))
      );
      if (missingPaths.length > 0) {
        warnings.push({
          type: 'governance',
          message: `Consider protecting critical paths: ${missingPaths.join(', ')}`,
          suggestion: 'Add these paths to protected_paths for better governance'
        });
      }

      // Check for emergency bypass settings
      if (policyData.emergency?.bypass_enabled && !policyData.emergency?.bypass_requires_justification) {
        warnings.push({
          type: 'security',
          message: 'Emergency bypass is enabled without requiring justification',
          suggestion: 'Enable bypass_requires_justification for audit trail'
        });
      }

      result.warnings = warnings;
    }

    // Log validation event
    await auditLogger.logSystemEvent(
      'system_startup',
      'policy_validated',
      {
        valid,
        error_count: result.errors.length,
        warning_count: result.warnings.length,
        policy_version: policyData?.version,
      },
      valid ? 'medium' : 'high'
    );

    return NextResponse.json(result, { 
      status: valid ? 200 : 400 
    });

  } catch (error) {
    console.error('[GOVERNANCE_VALIDATE] Validation error:', error);
    
    await auditLogger.logSystemEvent(
      'api_error',
      'policy_validation_failed',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'high'
    );

    return NextResponse.json({
      valid: false,
      errors: [{
        message: 'Internal validation error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }]
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return the current policy schema for reference
    const schemaPath = path.join(process.cwd(), 'governance/policy.schema.json');
    const schema = await fs.readJSON(schemaPath);

    return NextResponse.json({
      schema,
      supported_formats: ['yaml', 'json'],
      validation_info: {
        description: 'Validates governance policy against JSON schema',
        required_fields: schema.required || [],
        optional_warnings: true,
      }
    });

  } catch (error) {
    console.error('[GOVERNANCE_VALIDATE] Schema fetch error:', error);
    return NextResponse.json({
      error: 'Failed to load policy schema'
    }, { status: 500 });
  }
}
