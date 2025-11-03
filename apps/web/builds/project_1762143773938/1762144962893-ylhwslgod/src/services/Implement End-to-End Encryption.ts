```typescript
/**
 * @fileoverview End-to-end encryption service for securing data
 */

import { webcrypto } from 'crypto';
const { subtle } = webcrypto;

export interface EncryptionKeys {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface EncryptedData {
  encrypted: ArrayBuffer;
  iv: Uint8Array;
}

export class E2EEncryptionService {
  /**
   * Generates a new public/private key pair for asymmetric encryption
   * @returns Promise resolving to the generated key pair
   */
  public static async generateKeyPair(): Promise<EncryptionKeys> {
    try {
      const keyPair = await subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['encrypt', 'decrypt']
      );

      return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey
      };
    } catch (error) {
      throw new Error(`Failed to generate key pair: ${error.message}`);
    }
  }

  /**
   * Encrypts data using AES-GCM symmetric encryption
   * @param data Data to encrypt
   * @param key Encryption key
   * @returns Promise resolving to encrypted data and IV
   */
  public static async encrypt(data: string, key: CryptoKey): Promise<EncryptedData> {
    try {
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(data);
      
      const iv = webcrypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        encodedData
      );

      return {
        encrypted,
        iv
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts AES-GCM encrypted data
   * @param encrypted Encrypted data buffer
   * @param key Decryption key
   * @param iv Initialization vector used for encryption
   * @returns Promise resolving to decrypted string
   */
  public static async decrypt(
    encrypted: ArrayBuffer,
    key: CryptoKey,
    iv: Uint8Array
  ): Promise<string> {
    try {
      const decrypted = await subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generates a symmetric encryption key
   * @returns Promise resolving to generated key
   */
  public static async generateSymmetricKey(): Promise<CryptoKey> {
    try {
      return await subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      throw new Error(`Failed to generate symmetric key: ${error.message}`);
    }
  }

  /**
   * Exports a CryptoKey to raw format
   * @param key Key to export
   * @returns Promise resolving to exported key buffer
   */
  public static async exportKey(key: CryptoKey): Promise<ArrayBuffer> {
    try {
      return await subtle.exportKey('raw', key);
    } catch (error) {
      throw new Error(`Failed to export key: ${error.message}`);
    }
  }

  /**
   * Imports a symmetric key from raw format
   * @param keyData Raw key data
   * @returns Promise resolving to imported CryptoKey
   */
  public static async importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
    try {
      return await subtle.importKey(
        'raw',
        keyData,
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      throw new Error(`Failed to import key: ${error.message}`);
    }
  }

  /**
   * Derives a key from a password using PBKDF2
   * @param password Password to derive key from
   * @param salt Salt for key derivation
   * @returns Promise resolving to derived key
   */
  public static async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    try {
      const encoder = new TextEncoder();
      const keyMaterial = await subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );

      return await subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      throw new Error(`Key derivation failed: ${error.message}`);
    }
  }
}
```