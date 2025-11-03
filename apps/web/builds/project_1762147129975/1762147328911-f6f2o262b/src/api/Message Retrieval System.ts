// types.ts
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export interface MessageResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface MessageError {
  code: string;
  message: string;
}

// messageService.ts
import { Message, MessageResponse, MessageError } from './types';

/**
 * Service for retrieving messages from the API
 */
export class MessageService {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetches messages for a given user
   * @param userId - ID of user to fetch messages for
   * @param limit - Max number of messages to retrieve
   * @param cursor - Pagination cursor
   * @returns Promise with messages response
   * @throws MessageError if request fails
   */
  public async getMessages(
    userId: string, 
    limit: number = 20,
    cursor?: string
  ): Promise<MessageResponse> {
    try {
      const params = new URLSearchParams({
        userId,
        limit: limit.toString(),
        ...(cursor && { cursor })
      });

      const response = await fetch(
        `${this.baseUrl}/messages?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as MessageResponse;

    } catch (error) {
      throw {
        code: 'MESSAGE_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch messages'
      } as MessageError;
    }
  }
}

// MessageList.tsx
import React, { useEffect, useState } from 'react';
import { Message, MessageError } from './types';
import { MessageService } from './messageService';

interface MessageListProps {
  userId: string;
  messageService: MessageService;
}

/**
 * Component for displaying a list of messages
 */
export const MessageList: React.FC<MessageListProps> = ({ 
  userId,
  messageService
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<MessageError | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  useEffect(() => {
    loadMessages();
  }, [userId]);

  const loadMessages = async (cursor?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await messageService.getMessages(userId, 20, cursor);
      
      setMessages(prevMessages => 
        cursor ? [...prevMessages, ...response.messages] : response.messages
      );
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);

    } catch (err) {
      setError(err as MessageError);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadMessages(nextCursor);
    }
  };

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  return (
    <div className="message-list">
      {messages.map(message => (
        <div key={message.id} className="message">
          <div className="message-content">{message.content}</div>
          <div className="message-timestamp">
            {message.timestamp.toLocaleString()}
          </div>
          <div className="message-status">{message.status}</div>
        </div>
      ))}
      
      {loading && <div className="loading">Loading...</div>}
      
      {hasMore && !loading && (
        <button onClick={loadMore} className="load-more">
          Load More
        </button>
      )}
    </div>
  );
};

// hooks/useMessages.ts
import { useState, useEffect } from 'react';
import { Message, MessageError } from '../types';
import { MessageService } from '../messageService';

interface UseMessagesResult {
  messages: Message[];
  loading: boolean;
  error: MessageError | null;
  hasMore: boolean;
  loadMore: () => void;
}

/**
 * Hook for managing message retrieval state
 */
export const useMessages = (
  userId: string,
  messageService: MessageService
): UseMessagesResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<MessageError | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  useEffect(() => {
    loadMessages();
  }, [userId]);

  const loadMessages = async (cursor?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await messageService.getMessages(userId, 20, cursor);
      
      setMessages(prevMessages => 
        cursor ? [...prevMessages, ...response.messages] : response.messages
      );
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);

    } catch (err) {
      setError(err as MessageError);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadMessages(nextCursor);
    }
  };

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMore
  };
};