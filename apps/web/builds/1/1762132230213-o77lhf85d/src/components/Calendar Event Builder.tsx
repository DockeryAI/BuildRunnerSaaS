```typescript
import React, { useState, useCallback } from 'react';
import { format } from 'date-fns';

/**
 * Interface for calendar event data
 */
interface CalendarEvent {
  id?: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  location?: string;
  isAllDay: boolean;
}

/**
 * Props for CalendarEventBuilder component
 */
interface CalendarEventBuilderProps {
  /** Callback when event is created/updated */
  onEventSave: (event: CalendarEvent) => void;
  /** Initial event data for editing (optional) */
  initialEvent?: CalendarEvent;
}

/**
 * Component for building/editing calendar events
 */
export const CalendarEventBuilder: React.FC<CalendarEventBuilderProps> = ({
  onEventSave,
  initialEvent
}) => {
  const [event, setEvent] = useState<CalendarEvent>(
    initialEvent || {
      title: '',
      startDate: new Date(),
      endDate: new Date(),
      description: '',
      location: '',
      isAllDay: false
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof CalendarEvent, string>>>({});

  /**
   * Validates event data
   */
  const validateEvent = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof CalendarEvent, string>> = {};

    if (!event.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (event.endDate < event.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [event]);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (validateEvent()) {
        onEventSave(event);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      setErrors({
        ...errors,
        submit: 'Failed to save event. Please try again.'
      });
    }
  }, [event, validateEvent, onEventSave, errors]);

  /**
   * Handles input changes
   */
  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  }, []);

  /**
   * Handles date changes
   */
  const handleDateChange = useCallback((field: 'startDate' | 'endDate', value: string) => {
    setEvent(prev => ({
      ...prev,
      [field]: new Date(value)
    }));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="calendar-event-builder">
      <div className="form-group">
        <label htmlFor="title">Title *</label>
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
        <label htmlFor="startDate">Start Date *</label>
        <input
          type="datetime-local"
          id="startDate"
          name="startDate"
          value={format(event.startDate, "yyyy-MM-dd'T'HH:mm")}
          onChange={(e) => handleDateChange('startDate', e.target.value)}
          className={errors.startDate ? 'error' : ''}
        />
        {errors.startDate && <span className="error-message">{errors.startDate}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="endDate">End Date *</label>
        <input
          type="datetime-local"
          id="endDate"
          name="endDate"
          value={format(event.endDate, "yyyy-MM-dd'T'HH:mm")}
          onChange={(e) => handleDateChange('endDate', e.target.value)}
          className={errors.endDate ? 'error' : ''}
        />
        {errors.endDate && <span className="error-message">{errors.endDate}</span>}
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
        <label>
          <input
            type="checkbox"
            name="isAllDay"
            checked={event.isAllDay}
            onChange={handleInputChange}
          />
          All Day Event
        </label>
      </div>

      {errors.submit && <div className="error-message">{errors.submit}</div>}

      <button type="submit" className="submit-button">
        Save Event
      </button>
    </form>
  );
};

export default CalendarEventBuilder;
```