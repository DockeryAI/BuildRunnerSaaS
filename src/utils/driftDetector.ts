import fs from 'fs-extra';
import crypto from 'crypto';

export async function computeSpecHash(specPath: string): Promise<string> {
  const specData = await fs.readJSON(specPath);
  const specString = JSON.stringify(specData);
  return crypto.createHash('sha256').update(specString).digest('hex');
}

export async function detectDrift(localSpecPath: string, projectId: string): Promise<'equal' | 'drift' | 'no_remote'> {
  try {
    const localHash = await computeSpecHash(localSpecPath);
    
    // Call spec-diff function
    const response = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/spec-diff?project_id=${projectId}&local_hash=${localHash}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Drift detection failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.status === 'equal') {
      return 'equal';
    } else if (result.status === 'drift') {
      return 'drift';
    } else {
      return 'no_remote';
    }

  } catch (error) {
    console.error('Drift detection error:', error);
    return 'no_remote';
  }
}
