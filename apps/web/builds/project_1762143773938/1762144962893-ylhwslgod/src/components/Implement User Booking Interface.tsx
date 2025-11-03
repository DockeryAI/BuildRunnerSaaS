```typescript
import React, { useState, useCallback } from 'react';
import { format } from 'date-fns';
import type { Booking, ValidationError } from '../types';

interface BookingFormProps {
  onSubmit: (booking: Booking) => Promise<void>;
  availableSlots: string[];
  isLoading?: boolean;
}

/**
 * User booking interface component that handles scheduling appointments
 * @param props Component props
 * @returns React component
 */
export const BookingForm: React.FC<BookingFormProps> = ({
  onSubmit,
  availableSlots,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Partial<Booking>>({
    name: '',
    email: '',
    date: '',
    time: '',
    notes: ''
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);

  /**
   * Validates the booking form data
   * @param data Partial booking data to validate
   * @returns Array of validation errors
   */
  const validateForm = (data: Partial<Booking>): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!data.name?.trim()) {
      errors.push({ field: 'name', message: 'Name is required' });
    }

    if (!data.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }

    if (!data.date) {
      errors.push({ field: 'date', message: 'Date is required' });
    }

    if (!data.time) {
      errors.push({ field: 'time', message: 'Time slot is required' });
    }

    return errors;
  };

  /**
   * Handles form field changes
   * @param e Change event
   */
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  /**
   * Handles form submission
   * @param e Submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      try {
        await onSubmit(formData as Booking);
        setFormData({
          name: '',
          email: '',
          date: '',
          time: '',
          notes: ''
        });
      } catch (error) {
        setErrors([{ field: 'submit', message: 'Failed to submit booking' }]);
      }
    }
  };

  const hasError = (field: string) => 
    errors.some(error => error.field === field);

  const getErrorMessage = (field: string) => 
    errors.find(error => error.field === field)?.message;

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <div className="form-group">
        <label htmlFor="name">Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={hasError('name') ? 'error' : ''}
          disabled={isLoading}
        />
        {hasError('name') && <span className="error-message">{getErrorMessage('name')}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={hasError('email') ? 'error' : ''}
          disabled={isLoading}
        />
        {hasError('email') && <span className="error-message">{getErrorMessage('email')}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="date">Date *</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          min={format(new Date(), 'yyyy-MM-dd')}
          className={hasError('date') ? 'error' : ''}
          disabled={isLoading}
        />
        {hasError('date') && <span className="error-message">{getErrorMessage('date')}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="time">Time Slot *</label>
        <select
          id="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          className={hasError('time') ? 'error' : ''}
          disabled={isLoading}
        >
          <option value="">Select a time</option>
          {availableSlots.map(slot => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </select>
        {hasError('time') && <span className="error-message">{getErrorMessage('time')}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="notes">Additional Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      {hasError('submit') && (
        <div className="error-message submit-error">
          {getErrorMessage('submit')}
        </div>
      )}

      <button 
        type="submit" 
        className="submit-button"
        disabled={isLoading}
      >
        {isLoading ? 'Submitting...' : 'Book Appointment'}
      </button>
    </form>
  );
};

export default BookingForm;
```