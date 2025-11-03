```typescript
/**
 * @fileoverview License verification system component
 */

import { useState, useEffect } from 'react';
import axios from 'axios';

interface License {
  id: string;
  key: string;
  status: 'active' | 'expired' | 'invalid';
  expiryDate: string;
  features: string[];
}

interface LicenseVerificationProps {
  apiKey: string;
  onVerificationComplete?: (isValid: boolean) => void;
  onError?: (error: Error) => void;
}

/**
 * Component for handling license verification
 * @param props - Component props
 * @returns JSX element
 */
export const LicenseVerification: React.FC<LicenseVerificationProps> = ({
  apiKey,
  onVerificationComplete,
  onError
}) => {
  const [license, setLicense] = useState<License | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Verifies the license key with the API
   * @param key - License key to verify
   * @returns Promise resolving to license data
   */
  const verifyLicense = async (key: string): Promise<License> => {
    try {
      const response = await axios.post(
        '/api/verify-license',
        { key },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (err) {
      throw new Error('License verification failed');
    }
  };

  /**
   * Checks if license is valid and not expired
   * @param license - License object to validate
   * @returns boolean indicating if license is valid
   */
  const isLicenseValid = (license: License): boolean => {
    if (!license || license.status !== 'active') {
      return false;
    }

    const expiryDate = new Date(license.expiryDate);
    const now = new Date();
    return expiryDate > now;
  };

  useEffect(() => {
    const storedKey = localStorage.getItem('licenseKey');
    
    if (storedKey) {
      handleVerification(storedKey);
    }
  }, []);

  /**
   * Handles the verification process
   * @param key - License key to verify
   */
  const handleVerification = async (key: string): Promise<void> => {
    setIsVerifying(true);
    setError(null);

    try {
      const licenseData = await verifyLicense(key);
      setLicense(licenseData);
      
      const isValid = isLicenseValid(licenseData);
      if (isValid) {
        localStorage.setItem('licenseKey', key);
      }
      
      onVerificationComplete?.(isValid);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Clears the stored license data
   */
  const clearLicense = (): void => {
    setLicense(null);
    localStorage.removeItem('licenseKey');
  };

  return (
    <div className="license-verification">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {isVerifying ? (
        <div className="verifying">
          Verifying license...
        </div>
      ) : (
        <div className="license-status">
          {license ? (
            <div>
              <p>Status: {license.status}</p>
              <p>Expires: {new Date(license.expiryDate).toLocaleDateString()}</p>
              <button onClick={clearLicense}>
                Clear License
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const key = formData.get('licenseKey') as string;
              handleVerification(key);
            }}>
              <input
                type="text"
                name="licenseKey"
                placeholder="Enter license key"
                required
              />
              <button type="submit">
                Verify License
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Custom hook for using license verification
 * @param apiKey - API key for verification
 * @returns License verification utilities
 */
export const useLicenseVerification = (apiKey: string) => {
  const [isLicensed, setIsLicensed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkLicense = async () => {
      const storedKey = localStorage.getItem('licenseKey');
      
      if (!storedKey) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          '/api/verify-license',
          { key: storedKey },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setIsLicensed(response.data.status === 'active');
      } catch {
        setIsLicensed(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLicense();
  }, [apiKey]);

  return {
    isLicensed,
    isLoading
  };
};

export default LicenseVerification;
```