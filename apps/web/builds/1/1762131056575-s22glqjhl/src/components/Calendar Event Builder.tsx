```typescript
import React, { useState, useCallback } from 'react';
import { InstagramAPI } from '../services/instagram-api';
import { CalendarEvent, InstagramPost } from '../types';

interface CalendarEventBuilderProps {
  onEventCreated: (event: CalendarEvent) => void;
  instagramApiKey: string;
}

/**
 * Component for building calendar events from Instagram posts
 * @param props Component props
 * @returns Calendar Event Builder component
 */
export const CalendarEventBuilder: React.FC<CalendarEventBuilderProps> = ({ 
  onEventCreated,
  instagramApiKey
}) => {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [eventDescription, setEventDescription] = useState<string>('');

  /**
   * Fetches recent Instagram posts
   */
  const fetchInstagramPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const api = new InstagramAPI(instagramApiKey);
      const posts = await api.getRecentPosts();
      
      if (posts.length > 0) {
        setSelectedPost(posts[0]);
      }
    } catch (err) {
      setError('Failed to fetch Instagram posts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [instagramApiKey]);

  /**
   * Creates a calendar event from form data
   */
  const createEvent = useCallback(() => {
    try {
      if (!selectedPost || !eventTitle || !eventDate) {
        throw new Error('Missing required fields');
      }

      const event: CalendarEvent = {
        id: crypto.randomUUID(),
        title: eventTitle,
        date: new Date(eventDate),
        description: eventDescription,
        instagramPostId: selectedPost.id,
        instagramMediaUrl: selectedPost.mediaUrl,
        createdAt: new Date()
      };

      onEventCreated(event);
      
      // Reset form
      setEventTitle('');
      setEventDate('');
      setEventDescription('');
      setSelectedPost(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      console.error(err);
    }
  }, [selectedPost, eventTitle, eventDate, eventDescription, onEventCreated]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="calendar-event-builder">
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <button
        onClick={fetchInstagramPosts}
        disabled={isLoading}
        className="fetch-posts-btn"
      >
        Fetch Instagram Posts
      </button>

      {selectedPost && (
        <div className="selected-post">
          <img 
            src={selectedPost.mediaUrl} 
            alt="Instagram post preview"
            className="post-preview"
          />
          <p>{selectedPost.caption}</p>
        </div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        createEvent();
      }}>
        <div className="form-group">
          <label htmlFor="eventTitle">Event Title *</label>
          <input
            id="eventTitle"
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="eventDate">Event Date *</label>
          <input
            id="eventDate"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="eventDescription">Description</label>
          <textarea
            id="eventDescription"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            rows={4}
          />
        </div>

        <button 
          type="submit"
          disabled={!selectedPost || !eventTitle || !eventDate}
          className="create-event-btn"
        >
          Create Event
        </button>
      </form>

      <style jsx>{`
        .calendar-event-builder {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .error-message {
          background: #fff3f3;
          color: #dc3545;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .selected-post {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .post-preview {
          max-width: 100%;
          height: auto;
        }

        button {
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          background: #007bff;
          color: white;
          cursor: pointer;
        }

        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .create-event-btn {
          margin-top: 20px;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default CalendarEventBuilder;
```