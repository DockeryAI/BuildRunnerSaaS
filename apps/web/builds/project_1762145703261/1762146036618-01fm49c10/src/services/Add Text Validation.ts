/**
 * @class TextValidationService
 * @description Service for validating text input against common patterns and rules
 */
export class TextValidationService {
  /**
   * Validates if input contains only alphanumeric characters
   * @param {string} text - Text to validate
   * @returns {boolean} True if valid, false otherwise
   */
  public isAlphanumeric(text: string): boolean {
    try {
      if (!text) return false;
      return /^[a-zA-Z0-9]+$/.test(text);
    } catch (error) {
      console.error('Error in isAlphanumeric validation:', error);
      return false;
    }
  }

  /**
   * Validates if input contains only alphabetic characters
   * @param {string} text - Text to validate
   * @returns {boolean} True if valid, false otherwise
   */
  public isAlphabetic(text: string): boolean {
    try {
      if (!text) return false;
      return /^[a-zA-Z]+$/.test(text);
    } catch (error) {
      console.error('Error in isAlphabetic validation:', error);
      return false;
    }
  }

  /**
   * Validates if input is a valid email address
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid, false otherwise
   */
  public isValidEmail(email: string): boolean {
    try {
      if (!email) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    } catch (error) {
      console.error('Error in email validation:', error);
      return false;
    }
  }

  /**
   * Validates text length is within specified range
   * @param {string} text - Text to validate
   * @param {number} minLength - Minimum allowed length
   * @param {number} maxLength - Maximum allowed length
   * @returns {boolean} True if valid, false otherwise
   */
  public isValidLength(text: string, minLength: number, maxLength: number): boolean {
    try {
      if (!text) return false;
      const length = text.length;
      return length >= minLength && length <= maxLength;
    } catch (error) {
      console.error('Error in length validation:', error);
      return false;
    }
  }

  /**
   * Validates if text contains at least one number
   * @param {string} text - Text to validate
   * @returns {boolean} True if valid, false otherwise
   */
  public hasNumber(text: string): boolean {
    try {
      if (!text) return false;
      return /\d/.test(text);
    } catch (error) {
      console.error('Error in number validation:', error);
      return false;
    }
  }

  /**
   * Validates if text contains at least one special character
   * @param {string} text - Text to validate
   * @returns {boolean} True if valid, false otherwise
   */
  public hasSpecialCharacter(text: string): boolean {
    try {
      if (!text) return false;
      return /[!@#$%^&*(),.?":{}|<>]/.test(text);
    } catch (error) {
      console.error('Error in special character validation:', error);
      return false;
    }
  }

  /**
   * Validates if text matches a custom regex pattern
   * @param {string} text - Text to validate
   * @param {RegExp} pattern - Regular expression pattern to match against
   * @returns {boolean} True if valid, false otherwise
   */
  public matchesPattern(text: string, pattern: RegExp): boolean {
    try {
      if (!text || !pattern) return false;
      return pattern.test(text);
    } catch (error) {
      console.error('Error in pattern matching validation:', error);
      return false;
    }
  }

  /**
   * Validates if text contains only valid URL characters
   * @param {string} text - Text to validate
   * @returns {boolean} True if valid, false otherwise
   */
  public isValidUrl(text: string): boolean {
    try {
      if (!text) return false;
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
      return urlRegex.test(text);
    } catch (error) {
      console.error('Error in URL validation:', error);
      return false;
    }
  }

  /**
   * Validates if text is a valid date string
   * @param {string} text - Text to validate
   * @returns {boolean} True if valid, false otherwise
   */
  public isValidDate(text: string): boolean {
    try {
      if (!text) return false;
      const date = new Date(text);
      return date instanceof Date && !isNaN(date.getTime());
    } catch (error) {
      console.error('Error in date validation:', error);
      return false;
    }
  }

  /**
   * Validates if text contains only whitespace
   * @param {string} text - Text to validate
   * @returns {boolean} True if text contains only whitespace, false otherwise
   */
  public isWhitespace(text: string): boolean {
    try {
      if (text === undefined || text === null) return false;
      return /^\s*$/.test(text);
    } catch (error) {
      console.error('Error in whitespace validation:', error);
      return false;
    }
  }
}