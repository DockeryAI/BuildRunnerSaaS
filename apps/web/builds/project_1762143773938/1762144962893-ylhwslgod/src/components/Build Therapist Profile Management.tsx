```typescript
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';

interface TherapistProfile {
  id: string;
  firstName: string;
  lastName: string;
  credentials: string;
  specialties: string[];
  bio: string;
  yearsExperience: number;
  availableHours: {
    start: string;
    end: string;
  }[];
  profileImage?: string;
}

interface TherapistProfileFormData extends Omit<TherapistProfile, 'id'> {}

/**
 * Component for managing therapist profile information
 * @returns JSX.Element
 */
export const TherapistProfileManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<TherapistProfile | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TherapistProfileFormData>();

  /**
   * Fetches therapist profile data from the API
   */
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<TherapistProfile>('/api/therapist/profile');
      setProfile(response.data);
      reset(response.data);
    } catch (error) {
      toast.error('Failed to load profile data');
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles form submission to update therapist profile
   * @param data - Form data to be submitted
   */
  const onSubmit = async (data: TherapistProfileFormData) => {
    try {
      setIsLoading(true);
      await axios.put('/api/therapist/profile', data);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="therapist-profile-management">
      <h1>Profile Management</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            {...register('firstName', { required: 'First name is required' })}
          />
          {errors.firstName && (
            <span className="error">{errors.firstName.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            {...register('lastName', { required: 'Last name is required' })}
          />
          {errors.lastName && (
            <span className="error">{errors.lastName.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="credentials">Credentials</label>
          <input
            type="text"
            id="credentials"
            {...register('credentials', { required: 'Credentials are required' })}
          />
          {errors.credentials && (
            <span className="error">{errors.credentials.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="specialties">Specialties</label>
          <select
            multiple
            id="specialties"
            {...register('specialties', { required: 'Select at least one specialty' })}
          >
            <option value="anxiety">Anxiety</option>
            <option value="depression">Depression</option>
            <option value="trauma">Trauma</option>
            <option value="relationships">Relationships</option>
            <option value="addiction">Addiction</option>
          </select>
          {errors.specialties && (
            <span className="error">{errors.specialties.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            {...register('bio', {
              required: 'Bio is required',
              minLength: { value: 100, message: 'Bio must be at least 100 characters' }
            })}
          />
          {errors.bio && <span className="error">{errors.bio.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="yearsExperience">Years of Experience</label>
          <input
            type="number"
            id="yearsExperience"
            {...register('yearsExperience', {
              required: 'Years of experience is required',
              min: { value: 0, message: 'Must be 0 or greater' }
            })}
          />
          {errors.yearsExperience && (
            <span className="error">{errors.yearsExperience.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="profileImage">Profile Image URL</label>
          <input
            type="url"
            id="profileImage"
            {...register('profileImage')}
          />
          {errors.profileImage && (
            <span className="error">{errors.profileImage.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default TherapistProfileManagement;

// CSS Module
const styles = `
.therapist-profile-management {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 150px;
}

.error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.submit-button {
  padding: 0.75rem 1.5rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
`;
```