/**
 * @fileoverview Message data parsing service for handling message content and metadata
 */

export interface MessageData {
  id: string;
  content: string;
  timestamp: number;
  sender?: string;
  metadata?: Record<string, any>;
}

export interface ParsedMessage extends MessageData {
  parsedContent: string;
  formattedDate: string;
}

export class MessageParsingService {
  /**
   * Parses raw message data into structured format
   * @param message - Raw message data to parse
   * @returns Parsed message with formatted content
   * @throws Error if message is invalid
   */
  static parseMessage(message: MessageData): ParsedMessage {
    try {
      if (!message?.content || !message?.id) {
        throw new Error('Invalid message format');
      }

      return {
        ...message,
        parsedContent: this.parseMessageContent(message.content),
        formattedDate: this.formatTimestamp(message.timestamp)
      };
    } catch (error) {
      throw new Error(`Error parsing message: ${(error as Error).message}`);
    }
  }

  /**
   * Parses message content and applies any necessary transformations
   * @param content - Raw message content
   * @returns Formatted message content
   */
  private static parseMessageContent(content: string): string {
    try {
      // Remove excess whitespace
      let parsedContent = content.trim();

      // Convert URLs to clickable links
      parsedContent = parsedContent.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      );

      // Convert newlines to <br> tags
      parsedContent = parsedContent.replace(/\n/g, '<br>');

      return parsedContent;
    } catch (error) {
      console.error('Error parsing message content:', error);
      return content;
    }
  }

  /**
   * Formats timestamp into human readable date string
   * @param timestamp - Unix timestamp in milliseconds
   * @returns Formatted date string
   */
  private static formatTimestamp(timestamp: number): string {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return new Date(timestamp).toISOString();
    }
  }

  /**
   * Validates message data structure
   * @param message - Message data to validate
   * @returns True if valid, throws error if invalid
   */
  static validateMessage(message: Partial<MessageData>): boolean {
    if (!message) {
      throw new Error('Message data is required');
    }

    if (!message.id) {
      throw new Error('Message ID is required');
    }

    if (!message.content) {
      throw new Error('Message content is required');
    }

    if (!message.timestamp || isNaN(message.timestamp)) {
      throw new Error('Valid timestamp is required');
    }

    return true;
  }

  /**
   * Sanitizes message content to prevent XSS
   * @param content - Raw message content
   * @returns Sanitized content
   */
  static sanitizeContent(content: string): string {
    try {
      return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    } catch (error) {
      console.error('Error sanitizing content:', error);
      return content;
    }
  }

  /**
   * Extracts metadata from message content
   * @param content - Message content to parse
   * @returns Extracted metadata object
   */
  static extractMetadata(content: string): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    try {
      // Extract mentions
      const mentions = content.match(/@[\w-]+/g) || [];
      if (mentions.length) {
        metadata.mentions = mentions.map(m => m.substring(1));
      }

      // Extract hashtags
      const hashtags = content.match(/#[\w-]+/g) || [];
      if (hashtags.length) {
        metadata.hashtags = hashtags.map(h => h.substring(1));
      }

      // Extract URLs
      const urls = content.match(/(https?:\/\/[^\s]+)/g) || [];
      if (urls.length) {
        metadata.urls = urls;
      }

    } catch (error) {
      console.error('Error extracting metadata:', error);
    }

    return metadata;
  }
}