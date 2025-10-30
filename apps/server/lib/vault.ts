import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';

const VAULT_DIR = path.join(process.cwd(), '.vault');
const ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY || 'dev-key-change-in-production-32-chars';

interface VaultEntry {
  encrypted: string;
  iv: string;
  timestamp: string;
}

export class Vault {
  private static instance: Vault;
  
  static getInstance(): Vault {
    if (!Vault.instance) {
      Vault.instance = new Vault();
    }
    return Vault.instance;
  }

  private constructor() {
    this.ensureVaultDir();
  }

  private ensureVaultDir(): void {
    if (!fs.existsSync(VAULT_DIR)) {
      fs.mkdirSync(VAULT_DIR, { recursive: true });
    }
  }

  private getKeyHash(): Buffer {
    return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  }

  encrypt(data: string): VaultEntry {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.getKeyHash());
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      timestamp: new Date().toISOString()
    };
  }

  decrypt(entry: VaultEntry): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.getKeyHash());
    let decrypted = decipher.update(entry.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async store(key: string, value: string): Promise<void> {
    const entry = this.encrypt(value);
    const filePath = path.join(VAULT_DIR, `${key}.json`);
    await fs.writeJSON(filePath, entry, { spaces: 2 });
    console.log(`[VAULT] Stored encrypted entry for key: ${this.maskKey(key)}`);
  }

  async retrieve(key: string): Promise<string | null> {
    try {
      const filePath = path.join(VAULT_DIR, `${key}.json`);
      if (!await fs.pathExists(filePath)) {
        return null;
      }
      const entry: VaultEntry = await fs.readJSON(filePath);
      return this.decrypt(entry);
    } catch (error) {
      console.error(`[VAULT] Failed to retrieve key: ${this.maskKey(key)}`, error);
      return null;
    }
  }

  async exists(key: string): Promise<boolean> {
    const filePath = path.join(VAULT_DIR, `${key}.json`);
    return fs.pathExists(filePath);
  }

  private maskKey(key: string): string {
    if (key.length <= 6) return '***';
    return key.substring(0, 3) + '***' + key.substring(key.length - 3);
  }

  maskValue(value: string): string {
    if (value.length <= 10) return '***';
    return value.substring(0, 4) + '***' + value.substring(value.length - 4);
  }
}

export const vault = Vault.getInstance();
