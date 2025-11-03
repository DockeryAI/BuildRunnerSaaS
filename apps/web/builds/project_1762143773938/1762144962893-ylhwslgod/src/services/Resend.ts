```typescript
import { Resend } from 'resend';

/**
 * Configuration options for the ResendService
 */
interface ResendConfig {
  apiKey: string;
}

/**
 * Email message structure
 */
interface EmailMessage {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

/**
 * Service for sending emails via the Resend API
 */
export class ResendService {
  private resend: Resend;
  
  /**
   * Creates a new instance of ResendService
   * @param config - Configuration options
   */
  constructor(config: ResendConfig) {
    if (!config.apiKey) {
      throw new Error('Resend API key is required');
    }
    this.resend = new Resend(config.apiKey);
  }

  /**
   * Sends an email using Resend
   * @param message - The email message to send
   * @returns Promise resolving to the sent message ID
   * @throws Error if sending fails
   */
  public async sendEmail(message: EmailMessage): Promise<string> {
    try {
      if (!message.from || !message.to || !message.subject) {
        throw new Error('From, to and subject fields are required');
      }

      if (!message.html && !message.text) {
        throw new Error('Either HTML or text content is required');
      }

      const response = await this.resend.emails.send({
        from: message.from,
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        cc: message.cc ? (Array.isArray(message.cc) ? message.cc : [message.cc]) : undefined,
        bcc: message.bcc ? (Array.isArray(message.bcc) ? message.bcc : [message.bcc]) : undefined,
        reply_to: message.replyTo
      });

      if ('error' in response) {
        throw new Error(`Failed to send email: ${response.error.message}`);
      }

      return response.id;

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Email sending failed: ${error.message}`);
      }
      throw new Error('Email sending failed with unknown error');
    }
  }

  /**
   * Validates an email address format
   * @param email - Email address to validate
   * @returns boolean indicating if email is valid
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates an array of email addresses
   * @param emails - Array of email addresses to validate
   * @returns boolean indicating if all emails are valid
   */
  private validateEmails(emails: string[]): boolean {
    return emails.every(email => this.validateEmail(email));
  }

  /**
   * Gets the Resend instance
   * @returns The Resend instance
   */
  public getResendInstance(): Resend {
    return this.resend;
  }
}
```