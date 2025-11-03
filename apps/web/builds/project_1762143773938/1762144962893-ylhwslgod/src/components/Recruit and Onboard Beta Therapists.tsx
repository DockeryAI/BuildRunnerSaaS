```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface TherapistData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  credentials: string[];
  specialties: string[];
  status: 'pending' | 'approved' | 'rejected';
}

interface OnboardingStep {
  id: number;
  title: string;
  completed: boolean;
}

/**
 * Component for recruiting and onboarding beta therapists
 * @returns JSX.Element
 */
export const TherapistOnboarding: React.FC = () => {
  const [therapists, setTherapists] = useState<TherapistData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onboardingSteps: OnboardingStep[] = [
    { id: 1, title: 'Basic Information', completed: false },
    { id: 2, title: 'Credentials Verification', completed: false },
    { id: 3, title: 'Background Check', completed: false },
    { id: 4, title: 'Platform Training', completed: false }
  ];

  /**
   * Fetches list of therapists from API
   */
  const fetchTherapists = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get('/api/therapists');
      setTherapists(response.data);
    } catch (err) {
      setError('Failed to fetch therapists');
      toast.error('Error loading therapist data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates therapist status
   * @param therapistId - ID of therapist to update
   * @param newStatus - New status to set
   */
  const updateTherapistStatus = async (
    therapistId: string,
    newStatus: 'pending' | 'approved' | 'rejected'
  ): Promise<void> => {
    try {
      await axios.patch(`/api/therapists/${therapistId}`, {
        status: newStatus
      });
      
      setTherapists(prevTherapists =>
        prevTherapists.map(therapist =>
          therapist.id === therapistId
            ? { ...therapist, status: newStatus }
            : therapist
        )
      );
      
      toast.success('Therapist status updated successfully');
    } catch (err) {
      toast.error('Failed to update therapist status');
    }
  };

  /**
   * Handles form submission for new therapist
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await axios.post('/api/therapists', {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        credentials: formData.get('credentials')?.toString().split(','),
        specialties: formData.get('specialties')?.toString().split(',')
      });

      setTherapists(prev => [...prev, response.data]);
      toast.success('New therapist added successfully');
    } catch (err) {
      toast.error('Failed to add new therapist');
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="therapist-onboarding-container">
      <h1>Therapist Recruitment & Onboarding</h1>
      
      <form onSubmit={handleSubmit} className="onboarding-form">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          type="text"
          name="credentials"
          placeholder="Credentials (comma-separated)"
          required
        />
        <input
          type="text"
          name="specialties"
          placeholder="Specialties (comma-separated)"
          required
        />
        <button type="submit">Add Therapist</button>
      </form>

      <div className="onboarding-steps">
        {onboardingSteps.map(step => (
          <div key={step.id} className="step">
            <span className={`step-indicator ${step.completed ? 'completed' : ''}`}>
              {step.id}
            </span>
            <span className="step-title">{step.title}</span>
          </div>
        ))}
      </div>

      <div className="therapists-list">
        {therapists.map(therapist => (
          <div key={therapist.id} className="therapist-card">
            <h3>{`${therapist.firstName} ${therapist.lastName}`}</h3>
            <p>{therapist.email}</p>
            <div className="credentials">
              {therapist.credentials.map((credential, index) => (
                <span key={index} className="credential-tag">
                  {credential}
                </span>
              ))}
            </div>
            <div className="specialties">
              {therapist.specialties.map((specialty, index) => (
                <span key={index} className="specialty-tag">
                  {specialty}
                </span>
              ))}
            </div>
            <div className="status-controls">
              <select
                value={therapist.status}
                onChange={(e) => 
                  updateTherapistStatus(
                    therapist.id, 
                    e.target.value as 'pending' | 'approved' | 'rejected'
                  )
                }
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TherapistOnboarding;
```