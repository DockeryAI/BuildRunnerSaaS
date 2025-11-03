import React, { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Interface for calendar event data
 */
interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  location?: string;
  attendees?: string[];
}

/**
 * Interface for form error states
 */
interface FormErrors {
  title?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Calendar Event Creation Component
 * @returns JSX.Element
 */
const CalendarEventCreation: React.FC = () => {
  const [event, setEvent] = useState<CalendarEvent>({
    title: '',
    startDate: new Date(),
    endDate: new Date(),
    description: '',
    location: '',
    attendees: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  /**
   * Validates form fields
   * @returns boolean
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!event.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!event.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!event.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (event.startDate > event.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [event]);

  /**
   * Handles input changes
   * @param e Change event
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setEvent(prev => ({
      ...prev,
      [name]: name.includes('Date') ? new Date(value) : value
    }));
  };

  /**
   * Handles attendee input
   * @param e Change event
   */
  const handleAttendeeInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const attendees = e.target.value.split(',').map(email => email.trim());
    setEvent(prev => ({
      ...prev,
      attendees
    }));
  };

  /**
   * Handles form submission
   * @param e Submit event
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await axios.post('/api/calendar/events', event);
      
      if (response.status === 201) {
        setEvent({
          title: '',
          startDate: new Date(),
          endDate: new Date(),
          description: '',
          location: '',
          attendees: []
        });
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create event'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="calendar-event-form">
      <div className="form-group">
        <label htmlFor="title">Title*</label>
        <input
          type="text"
          id="title"
          name="title"
          value={event.title}
          onChange={handleInputChange}
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="startDate">Start Date*</label>
        <input
          type="datetime-local"
          id="startDate"
          name="startDate"
          value={event.startDate.toISOString().slice(0, 16)}
          onChange={handleInputChange}
          className={errors.startDate ? 'error' : ''}
        />
        {errors.startDate && (
          <span className="error-message">{errors.startDate}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="endDate">End Date*</label>
        <input
          type="datetime-local"
          id="endDate"
          name="endDate"
          value={event.endDate.toISOString().slice(0, 16)}
          onChange={handleInputChange}
          className={errors.endDate ? 'error' : ''}
        />
        {errors.endDate && (
          <span className="error-message">{errors.endDate}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={event.description}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={event.location}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="attendees">Attendees (comma-separated emails)</label>
        <input
          type="text"
          id="attendees"
          name="attendees"
          value={event.attendees?.join(', ')}
          onChange={handleAttendeeInput}
        />
      </div>

      {submitError && <div className="submit-error">{submitError}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Event...' : 'Create Event'}
      </button>
    </form>
  );
};

export default CalendarEventCreation;