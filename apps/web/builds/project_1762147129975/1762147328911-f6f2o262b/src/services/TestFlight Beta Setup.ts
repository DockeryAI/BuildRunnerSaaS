/**
 * @fileoverview TestFlight Beta Setup component for web applications
 * Provides functionality to handle beta testing enrollment and management
 */

import React, { useState, useCallback } from 'react';

interface TestFlightSetupProps {
  projectId: string;
  onEnrollmentComplete?: (success: boolean) => void;
}

interface EnrollmentStatus {
  isEnrolled: boolean;
  email?: string;
  enrollmentDate?: Date;
}

/**
 * TestFlightSetup component for managing beta testing enrollment
 * @param {TestFlightSetupProps} props Component props
 * @returns {JSX.Element} Rendered component
 */
export const TestFlightSetup: React.FC<TestFlightSetupProps> = ({ 
  projectId,
  onEnrollmentComplete 
}) => {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<EnrollmentStatus>({
    isEnrolled: false
  });

  /**
   * Handles beta enrollment submission
   * @param {React.FormEvent} e Form submission event
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate email
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Mock API call - replace with actual enrollment endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStatus({
        isEnrolled: true,
        email,
        enrollmentDate: new Date()
      });

      onEnrollmentComplete?.(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll in beta');
      onEnrollmentComplete?.(false);
    } finally {
      setLoading(false);
    }
  }, [email, onEnrollmentComplete]);

  if (status.isEnrolled) {
    return (
      <div className="testflight-success">
        <h3>Successfully Enrolled!</h3>
        <p>Thank you for joining our beta program.</p>
        <p>Enrollment details have been sent to: {status.email}</p>
        <small>
          Enrolled on: {status.enrollmentDate?.toLocaleDateString()}
        </small>
      </div>
    );
  }

  return (
    <div className="testflight-setup">
      <h2>Join Our Beta Program</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
            required
          />
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="enroll-button"
        >
          {loading ? 'Enrolling...' : 'Enroll in Beta'}
        </button>
      </form>

      <style jsx>{`
        .testflight-setup {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        label {
          display: block;
          margin-bottom: 5px;
        }

        input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .error-message {
          color: #dc3545;
          margin: 10px 0;
        }

        .enroll-button {
          width: 100%;
          padding: 10px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .enroll-button:disabled {
          background: #ccc;
        }

        .testflight-success {
          text-align: center;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

export default TestFlightSetup;