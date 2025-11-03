/**
 * Gmail API service for handling Gmail API interactions
 */

import { useState, useCallback } from 'react';

// Types
export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: {name: string, value: string}[];
    parts?: any[];
    body?: {
      data?: string;
      size?: number;
    };
  };
}

export interface GmailAPIConfig {
  clientId: string;
  apiKey: string;
  scopes: string[];
}

export interface GmailServiceHook {
  isInitialized: boolean;
  isAuthorized: boolean;
  messages: GmailMessage[];
  error: Error | null;
  initialize: () => Promise<void>;
  authorize: () => Promise<void>;
  loadMessages: () => Promise<void>;
  sendEmail: (to: string, subject: string, body: string) => Promise<void>;
}

const GMAIL_DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';

/**
 * Custom hook for Gmail API functionality
 * @param config Gmail API configuration
 * @returns Gmail service methods and state
 */
export const useGmailService = (config: GmailAPIConfig): GmailServiceHook => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Initialize the Gmail API client
   */
  const initialize = useCallback(async (): Promise<void> => {
    try {
      await new Promise<void>((resolve, reject) => {
        gapi.load('client', {
          callback: resolve,
          onerror: reject
        });
      });

      await gapi.client.init({
        apiKey: config.apiKey,
        clientId: config.clientId,
        discoveryDocs: [GMAIL_DISCOVERY_DOC],
        scope: config.scopes.join(' ')
      });

      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize Gmail API'));
    }
  }, [config]);

  /**
   * Authorize the Gmail API client
   */
  const authorize = useCallback(async (): Promise<void> => {
    if (!isInitialized) {
      setError(new Error('Gmail API not initialized'));
      return;
    }

    try {
      const token = await gapi.auth2.getAuthInstance().signIn();
      if (token) {
        setIsAuthorized(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to authorize Gmail API'));
    }
  }, [isInitialized]);

  /**
   * Load Gmail messages
   */
  const loadMessages = useCallback(async (): Promise<void> => {
    if (!isAuthorized) {
      setError(new Error('Not authorized'));
      return;
    }

    try {
      const response = await gapi.client.gmail.users.messages.list({
        userId: 'me',
        maxResults: 10
      });

      const messagePromises = response.result.messages?.map(async (message) => {
        const details = await gapi.client.gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });
        return details.result;
      }) || [];

      const messageDetails = await Promise.all(messagePromises);
      setMessages(messageDetails);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load messages'));
    }
  }, [isAuthorized]);

  /**
   * Send an email
   * @param to Recipient email address
   * @param subject Email subject
   * @param body Email body
   */
  const sendEmail = useCallback(async (to: string, subject: string, body: string): Promise<void> => {
    if (!isAuthorized) {
      setError(new Error('Not authorized'));
      return;
    }

    try {
      const email = [
        'Content-Type: text/plain; charset="UTF-8"\n',
        'MIME-Version: 1.0\n',
        'Content-Transfer-Encoding: 7bit\n',
        `to: ${to}\n`,
        `subject: ${subject}\n\n`,
        body
      ].join('');

      const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      await gapi.client.gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: encodedEmail
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send email'));
    }
  }, [isAuthorized]);

  return {
    isInitialized,
    isAuthorized,
    messages,
    error,
    initialize,
    authorize,
    loadMessages,
    sendEmail
  };
};