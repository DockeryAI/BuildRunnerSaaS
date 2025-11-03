/**
 * API Error types
 */

export class ApiError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export interface ErrorResponse {
  error: string;
  statusCode: number;
  code?: string;
  details?: any;
}
