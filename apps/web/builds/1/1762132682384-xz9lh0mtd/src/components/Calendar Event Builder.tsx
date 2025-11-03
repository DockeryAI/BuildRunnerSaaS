```typescript
import { useState, useEffect } from 'react';
import { InstagramAPI } from '../services/instagram-api';

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  location?: string;
  attendees: string[];
  instagramPostId?: string;
}

interface CalendarEventBuilderProps {
  initialEvent?: Partial<CalendarEvent>;
  onSave: (event: CalendarEvent) => void;
  onCancel: () => void;
}

/**
 * Component for building calendar events with optional Instagram integration
 * @param {CalendarEventBuilderProps} props - Component props
 * @returns {JSX.Element} Calendar event builder form
 */
export const CalendarEventBuilder = ({
  initialEvent,
  onSave,
  onCancel
}: CalendarEventBuilderProps): JSX.Element => {
  const [event, setEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    startDate: new Date(),
    endDate: new Date(),
    description: '',
    location: '',
    attendees: [],
    ...initialEvent
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CalendarEvent, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    validateForm();
  }, [event]);

  /**
   * Validates form fields and updates error state
   */
  const validateForm = (): void => {
    const newErrors: Partial<Record<keyof CalendarEvent, string>> = {};

    if (!event.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!event.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!event.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (event.startDate && event.endDate && event.startDate > event.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (event.attendees?.length === 0) {
      newErrors.attendees = 'At least one attendee is required';
    }

    setErrors(newErrors);
  };

  /**
   * Handles form field changes
   * @param {string} field - Field name
   * @param {any} value - New field value
   */
  const handleChange = (field: keyof CalendarEvent, value: any): void => {
    setEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (): Promise<void> => {
    try {
      setIsLoading(true);

      if (Object.keys(errors).length > 0) {
        throw new Error('Please fix form errors before submitting');
      }

      if (event.instagramPostId) {
        await InstagramAPI.verifyPost(event.instagramPostId);
      }

      onSave(event as CalendarEvent);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'An error occurred'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Links Instagram post to event
   * @param {string} postId - Instagram post ID
   */
  const linkInstagramPost = async (postId: string): Promise<void> => {
    try {
      setIsLoading(true);
      await InstagramAPI.verifyPost(postId);
      handleChange('instagramPostId', postId);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        instagramPostId: 'Invalid Instagram post ID'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="calendar-event-builder">
      <form onSubmit={e => {
        e.preventDefault();
        handleSubmit();
      }}>
        <div className="form-group">
          <label htmlFor="title">Title*</label>
          <input
            id="title"
            type="text"
            value={event.title}
            onChange={e => handleChange('title', e.target.value)}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="startDate">Start Date*</label>
          <input
            id="startDate"
            type="datetime-local"
            value={event.startDate?.toISOString().slice(0, 16)}
            onChange={e => handleChange('startDate', new Date(e.target.value))}
            className={errors.startDate ? 'error' : ''}
          />
          {errors.startDate && <span className="error-message">{errors.startDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date*</label>
          <input
            id="endDate"
            type="datetime-local"
            value={event.endDate?.toISOString().slice(0, 16)}
            onChange={e => handleChange('endDate', new Date(e.target.value))}
            className={errors.endDate ? 'error' : ''}
          />
          {errors.endDate && <span className="error-message">{errors.endDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={event.description}
            onChange={e => handleChange('description', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={event.location}
            onChange={e => handleChange('location', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="attendees">Attendees*</label>
          <input
            id="attendees"
            type="text"
            value={event.attendees?.join(', ')}
            onChange={e => handleChange('attendees', e.target.value.split(',').map(x => x.trim()))}
            className={errors.attendees ? 'error' : ''}
          />
          {errors.attendees && <span className="error-message">{errors.attendees}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="instagramPostId">Instagram Post ID</label>
          <input
            id="instagramPostId"
            type="text"
            value={event.instagramPostId}
            onChange={e => linkInstagramPost(e.target.value)}
            className={errors.instagramPostId ? 'error' : ''}
          />
          {errors.instagramPostId && <span className="error-message">{errors.instagramPostId}</span>}
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <div className="button-group">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || Object.keys(errors).length > 0}
          >
            {isLoading ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </form>
    </div>
  );
};
```