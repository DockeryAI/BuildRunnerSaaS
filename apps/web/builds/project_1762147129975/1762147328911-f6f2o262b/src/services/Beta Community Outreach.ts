import React, { useState, useEffect } from 'react';

/**
 * Interface for community member data
 */
interface CommunityMember {
  id: string;
  name: string;
  email: string;
  joinDate: Date;
  betaAccess: boolean;
}

/**
 * Interface for component props
 */
interface BetaCommunityOutreachProps {
  programId?: string;
  onMemberInvite?: (email: string) => void;
}

/**
 * Component for managing beta community outreach and invitations
 */
export const BetaCommunityOutreach: React.FC<BetaCommunityOutreachProps> = ({
  programId,
  onMemberInvite
}) => {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCommunityMembers();
  }, [programId]);

  /**
   * Fetches current community members
   */
  const fetchCommunityMembers = async (): Promise<void> => {
    try {
      setLoading(true);
      // API call would go here
      const mockMembers: CommunityMember[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          joinDate: new Date(),
          betaAccess: true
        }
      ];
      setMembers(mockMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles inviting a new member
   */
  const handleInvite = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      // API call would go here
      onMemberInvite?.(email);
      setEmail('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validates email format
   */
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <div className="beta-community-outreach">
      <h2>Beta Community Management</h2>

      <form onSubmit={handleInvite} className="invite-form">
        <div className="form-group">
          <label htmlFor="email">Invite New Member</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading || !validateEmail(email)}
          >
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </form>

      <div className="members-list">
        <h3>Current Beta Members ({members.length})</h3>
        {loading ? (
          <p>Loading members...</p>
        ) : (
          <ul>
            {members.map((member) => (
              <li key={member.id}>
                <span>{member.name}</span>
                <span>{member.email}</span>
                <span>Joined: {member.joinDate.toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style jsx>{`
        .beta-community-outreach {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .invite-form {
          margin: 20px 0;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .form-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        input {
          flex: 1;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        button {
          padding: 8px 16px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          color: red;
          margin-top: 10px;
        }

        .members-list {
          margin-top: 20px;
        }

        .members-list ul {
          list-style: none;
          padding: 0;
        }

        .members-list li {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
      `}</style>
    </div>
  );
};