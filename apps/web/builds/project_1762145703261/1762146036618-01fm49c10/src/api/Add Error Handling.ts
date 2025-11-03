/**
 * @file errorHandling.ts
 * Custom error handling utilities for API responses
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Custom error class for API-specific errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  error: {
    message: string;
    statusCode: number;
    details?: any;
  };
}

/**
 * Formats an error into a standardized error response
 * @param error - The error to format
 * @returns Formatted error response
 */
export const formatError = (error: unknown): ErrorResponse => {
  if (error instanceof APIError) {
    return {
      error: {
        message: error.message,
        statusCode: error.statusCode,
        details: error.details
      }
    };
  }

  if (error instanceof Error) {
    return {
      error: {
        message: error.message,
        statusCode: 500
      }
    };
  }

  return {
    error: {
      message: 'An unknown error occurred',
      statusCode: 500
    }
  };
};

/**
 * Wraps a promise and handles potential errors
 * @param promise - Promise to handle
 * @returns Result or error response
 */
export const handleAsync = async <T>(
  promise: Promise<T>
): Promise<T | ErrorResponse> => {
  try {
    return await promise;
  } catch (error) {
    return formatError(error);
  }
};

/**
 * Handles Supabase-specific errors
 * @param error - Supabase error object
 * @throws APIError with formatted message
 */
export const handleSupabaseError = (error: any): never => {
  const message = error?.message || 'Database operation failed';
  const statusCode = error?.code === 'PGRST116' ? 404 : 500;
  
  throw new APIError(message, statusCode, {
    code: error?.code,
    details: error?.details
  });
};

/**
 * Validates Supabase client connection
 * @param supabase - Supabase client instance
 * @throws APIError if connection fails
 */
export const validateSupabaseConnection = async (
  supabase: SupabaseClient
): Promise<void> => {
  try {
    const { error } = await supabase.from('health_check').select('*').limit(1);
    if (error) throw error;
  } catch (error) {
    throw new APIError(
      'Failed to connect to database',
      500,
      { originalError: error }
    );
  }
};

/**
 * Middleware to catch and format errors
 * @param error - Error object
 * @param req - Request object 
 * @param res - Response object
 * @param next - Next middleware function
 */
export const errorMiddleware = (
  error: Error,
  req: any,
  res: any,
  next: any
): void => {
  const formattedError = formatError(error);
  res.status(formattedError.error.statusCode).json(formattedError);
};

/**
 * Utility to retry failed operations
 * @param operation - Function to retry
 * @param retries - Number of retries
 * @param delay - Delay between retries in ms
 * @returns Operation result
 */
export const retry = async <T>(
  operation: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(operation, retries - 1, delay);
  }
};