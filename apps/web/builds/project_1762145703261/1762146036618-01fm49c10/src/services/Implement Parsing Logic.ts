/**
 * @fileoverview Parsing service for handling data transformation and validation
 */

type ParseOptions = {
  trim?: boolean;
  lowercase?: boolean;
  removeSpecialChars?: boolean;
};

type ValidationRule = {
  type: 'required' | 'regex' | 'custom';
  value?: RegExp | ((value: any) => boolean);
  message: string;
};

/**
 * Service for parsing and validating data
 */
export class ParsingService {
  /**
   * Parses a string value according to provided options
   * @param value - The string value to parse
   * @param options - Parsing options configuration
   * @returns The parsed string value
   */
  public parseString(value: string, options: ParseOptions = {}): string {
    try {
      let parsed = String(value);

      if (options.trim) {
        parsed = parsed.trim();
      }

      if (options.lowercase) {
        parsed = parsed.toLowerCase();
      }

      if (options.removeSpecialChars) {
        parsed = parsed.replace(/[^a-zA-Z0-9\s]/g, '');
      }

      return parsed;
    } catch (error) {
      throw new Error(`Failed to parse string: ${error.message}`);
    }
  }

  /**
   * Parses a number value with validation
   * @param value - The value to parse as number
   * @returns The parsed number or null if invalid
   */
  public parseNumber(value: string | number): number | null {
    try {
      const num = Number(value);
      return isNaN(num) ? null : num;
    } catch {
      return null;
    }
  }

  /**
   * Validates a value against provided rules
   * @param value - The value to validate
   * @param rules - Array of validation rules to check
   * @returns Validation result with any error messages
   */
  public validate(value: any, rules: ValidationRule[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const rule of rules) {
      switch (rule.type) {
        case 'required':
          if (value === undefined || value === null || value === '') {
            errors.push(rule.message);
          }
          break;

        case 'regex':
          if (rule.value instanceof RegExp && !rule.value.test(String(value))) {
            errors.push(rule.message);
          }
          break;

        case 'custom':
          if (typeof rule.value === 'function' && !rule.value(value)) {
            errors.push(rule.message);
          }
          break;

        default:
          throw new Error(`Invalid validation rule type: ${rule.type}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Safely parses JSON string with error handling
   * @param jsonString - The JSON string to parse
   * @returns Parsed object or null if invalid
   */
  public parseJSON<T>(jsonString: string): T | null {
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      return null;
    }
  }

  /**
   * Converts an object to query string
   * @param params - Object containing query parameters
   * @returns Formatted query string
   */
  public toQueryString(params: Record<string, any>): string {
    try {
      return Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return value
              .map(item => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`)
              .join('&');
          }
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .join('&');
    } catch (error) {
      throw new Error(`Failed to convert to query string: ${error.message}`);
    }
  }

  /**
   * Parses a query string into an object
   * @param queryString - The query string to parse
   * @returns Parsed query parameters object
   */
  public parseQueryString(queryString: string): Record<string, string | string[]> {
    try {
      const params: Record<string, string | string[]> = {};
      const searchParams = new URLSearchParams(queryString);

      searchParams.forEach((value, key) => {
        if (params[key]) {
          if (Array.isArray(params[key])) {
            (params[key] as string[]).push(value);
          } else {
            params[key] = [params[key] as string, value];
          }
        } else {
          params[key] = value;
        }
      });

      return params;
    } catch (error) {
      throw new Error(`Failed to parse query string: ${error.message}`);
    }
  }
}

export default new ParsingService();