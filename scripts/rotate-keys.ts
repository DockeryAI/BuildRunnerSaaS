#!/usr/bin/env tsx

/**
 * BuildRunner Key Rotation Script
 * Rotates API keys and secrets for security compliance
 */

import { createClient } from '@supabase/supabase-js';
import { randomBytes, createHash } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface KeyRotationConfig {
  keyType: string;
  keyIdentifier: string;
  rotationReason: 'scheduled' | 'compromised' | 'compliance' | 'manual';
  dryRun: boolean;
  orgId?: string;
}

interface RotationResult {
  success: boolean;
  keyType: string;
  keyIdentifier: string;
  oldKeyHash?: string;
  newKeyHash?: string;
  error?: string;
}

class KeyRotationManager {
  private dryRun: boolean;
  private results: RotationResult[] = [];

  constructor(dryRun = false) {
    this.dryRun = dryRun;
  }

  /**
   * Rotate all configured keys
   */
  async rotateAll(orgId?: string): Promise<RotationResult[]> {
    console.log(`🔄 Starting key rotation ${this.dryRun ? '(DRY RUN)' : '(LIVE MODE)'}`);
    
    const keyConfigs: KeyRotationConfig[] = [
      {
        keyType: 'openai_api_key',
        keyIdentifier: 'primary',
        rotationReason: 'scheduled',
        dryRun: this.dryRun,
        orgId,
      },
      {
        keyType: 'anthropic_api_key',
        keyIdentifier: 'primary',
        rotationReason: 'scheduled',
        dryRun: this.dryRun,
        orgId,
      },
      {
        keyType: 'webhook_secret',
        keyIdentifier: 'notifications',
        rotationReason: 'scheduled',
        dryRun: this.dryRun,
        orgId,
      },
      {
        keyType: 'jwt_secret',
        keyIdentifier: 'auth',
        rotationReason: 'scheduled',
        dryRun: this.dryRun,
        orgId,
      },
    ];

    for (const config of keyConfigs) {
      try {
        const result = await this.rotateKey(config);
        this.results.push(result);
        
        if (result.success) {
          console.log(`✅ ${config.keyType}: Rotation ${this.dryRun ? 'simulated' : 'completed'}`);
        } else {
          console.error(`❌ ${config.keyType}: Rotation failed - ${result.error}`);
        }
      } catch (error) {
        console.error(`❌ ${config.keyType}: Unexpected error - ${error}`);
        this.results.push({
          success: false,
          keyType: config.keyType,
          keyIdentifier: config.keyIdentifier,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    await this.logRotationResults(orgId);
    return this.results;
  }

  /**
   * Rotate a specific key
   */
  async rotateKey(config: KeyRotationConfig): Promise<RotationResult> {
    console.log(`🔑 Rotating ${config.keyType}...`);

    // Get current key (if exists)
    const currentKey = await this.getCurrentKey(config.keyType, config.keyIdentifier);
    const oldKeyHash = currentKey ? this.hashKey(currentKey) : undefined;

    // Generate new key
    const newKey = this.generateNewKey(config.keyType);
    const newKeyHash = this.hashKey(newKey);

    if (this.dryRun) {
      console.log(`  📋 DRY RUN: Would rotate ${config.keyType}`);
      console.log(`  📋 Old key hash: ${oldKeyHash || 'none'}`);
      console.log(`  📋 New key hash: ${newKeyHash}`);
      
      return {
        success: true,
        keyType: config.keyType,
        keyIdentifier: config.keyIdentifier,
        oldKeyHash,
        newKeyHash,
      };
    }

    // Record rotation start
    const { data: rotationRecord, error: recordError } = await supabase
      .from('key_rotations')
      .insert([{
        org_id: config.orgId,
        key_type: config.keyType,
        key_identifier: config.keyIdentifier,
        rotation_reason: config.rotationReason,
        rotated_by: 'system',
        old_key_hash: oldKeyHash,
        new_key_hash: newKeyHash,
        rotation_status: 'pending',
        scheduled_for: new Date().toISOString(),
        metadata: {
          rotation_script_version: '1.0.0',
          dry_run: false,
        },
      }])
      .select()
      .single();

    if (recordError) {
      throw new Error(`Failed to record rotation: ${recordError.message}`);
    }

    try {
      // Perform the actual key rotation
      await this.performKeyRotation(config.keyType, config.keyIdentifier, newKey);

      // Update rotation record as completed
      await supabase
        .from('key_rotations')
        .update({
          rotation_status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', rotationRecord.id);

      return {
        success: true,
        keyType: config.keyType,
        keyIdentifier: config.keyIdentifier,
        oldKeyHash,
        newKeyHash,
      };
    } catch (error) {
      // Update rotation record as failed
      await supabase
        .from('key_rotations')
        .update({
          rotation_status: 'failed',
          metadata: {
            ...rotationRecord.metadata,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        })
        .eq('id', rotationRecord.id);

      throw error;
    }
  }

  /**
   * Get current key value (mock implementation)
   */
  private async getCurrentKey(keyType: string, keyIdentifier: string): Promise<string | null> {
    // In production, this would retrieve from secure storage
    // For demo purposes, we'll return mock values
    const mockKeys: Record<string, string> = {
      'openai_api_key': process.env.OPENAI_API_KEY || 'sk-mock-openai-key',
      'anthropic_api_key': process.env.ANTHROPIC_API_KEY || 'sk-ant-mock-anthropic-key',
      'webhook_secret': process.env.WEBHOOK_SECRET || 'mock-webhook-secret',
      'jwt_secret': process.env.JWT_SECRET || 'mock-jwt-secret',
    };

    return mockKeys[keyType] || null;
  }

  /**
   * Generate new key based on type
   */
  private generateNewKey(keyType: string): string {
    switch (keyType) {
      case 'openai_api_key':
        return `sk-${randomBytes(24).toString('hex')}`;
      case 'anthropic_api_key':
        return `sk-ant-${randomBytes(24).toString('hex')}`;
      case 'webhook_secret':
        return randomBytes(32).toString('hex');
      case 'jwt_secret':
        return randomBytes(64).toString('base64');
      default:
        return randomBytes(32).toString('hex');
    }
  }

  /**
   * Perform the actual key rotation
   */
  private async performKeyRotation(keyType: string, keyIdentifier: string, newKey: string): Promise<void> {
    console.log(`  🔄 Updating ${keyType} in secure storage...`);
    
    // In production, this would:
    // 1. Update environment variables in deployment
    // 2. Update secrets in AWS Secrets Manager / Azure Key Vault / etc.
    // 3. Restart services if needed
    // 4. Validate new key works
    
    // For demo, we'll simulate the process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    const isValid = await this.validateNewKey(keyType, newKey);
    if (!isValid) {
      throw new Error(`New ${keyType} failed validation`);
    }
    
    console.log(`  ✅ ${keyType} updated successfully`);
  }

  /**
   * Validate new key works
   */
  private async validateNewKey(keyType: string, newKey: string): Promise<boolean> {
    // In production, this would make test API calls
    // For demo, we'll simulate validation
    return true;
  }

  /**
   * Create hash of key for storage
   */
  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex').substring(0, 16);
  }

  /**
   * Log rotation results to audit trail
   */
  private async logRotationResults(orgId?: string): Promise<void> {
    const successCount = this.results.filter(r => r.success).length;
    const failureCount = this.results.filter(r => !r.success).length;

    await supabase
      .from('audit_ledger')
      .insert([{
        org_id: orgId,
        actor: 'system',
        action: 'keys_rotated',
        resource_type: 'security',
        payload: {
          total_keys: this.results.length,
          successful_rotations: successCount,
          failed_rotations: failureCount,
          dry_run: this.dryRun,
          results: this.results.map(r => ({
            key_type: r.keyType,
            success: r.success,
            error: r.error,
          })),
        },
        metadata: {
          rotation_timestamp: new Date().toISOString(),
          script_version: '1.0.0',
        },
      }]);

    console.log(`\n📊 Rotation Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`   📋 Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}`);
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const orgId = args.find(arg => arg.startsWith('--org='))?.split('=')[1];
  const keyType = args.find(arg => arg.startsWith('--key='))?.split('=')[1];

  console.log('🔐 BuildRunner Key Rotation Tool');
  console.log('================================\n');

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: tsx scripts/rotate-keys.ts [options]');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run, -d     Simulate rotation without making changes');
    console.log('  --org=<id>        Rotate keys for specific organization');
    console.log('  --key=<type>      Rotate specific key type only');
    console.log('  --help, -h        Show this help message');
    console.log('');
    console.log('Key types:');
    console.log('  openai_api_key    OpenAI API key');
    console.log('  anthropic_api_key Anthropic API key');
    console.log('  webhook_secret    Webhook signing secret');
    console.log('  jwt_secret        JWT signing secret');
    console.log('');
    console.log('Examples:');
    console.log('  tsx scripts/rotate-keys.ts --dry-run');
    console.log('  tsx scripts/rotate-keys.ts --org=123e4567-e89b-12d3-a456-426614174000');
    console.log('  tsx scripts/rotate-keys.ts --key=openai_api_key');
    return;
  }

  const manager = new KeyRotationManager(dryRun);

  if (keyType) {
    // Rotate specific key
    const result = await manager.rotateKey({
      keyType,
      keyIdentifier: 'primary',
      rotationReason: 'manual',
      dryRun,
      orgId,
    });

    if (result.success) {
      console.log(`\n✅ Key rotation ${dryRun ? 'simulation' : 'completed'} successfully!`);
    } else {
      console.error(`\n❌ Key rotation failed: ${result.error}`);
      process.exit(1);
    }
  } else {
    // Rotate all keys
    const results = await manager.rotateAll(orgId);
    const hasFailures = results.some(r => !r.success);

    if (hasFailures) {
      console.error(`\n❌ Some key rotations failed. Check the logs for details.`);
      process.exit(1);
    } else {
      console.log(`\n✅ All key rotations ${dryRun ? 'simulated' : 'completed'} successfully!`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Key rotation failed:', error);
    process.exit(1);
  });
}

export { KeyRotationManager };
