/**
 * Core data models and interfaces for the application
 * @module models
 */

/**
 * Base model interface with common properties
 */
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User model interface
 */
export interface User extends BaseModel {
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: UserRole;
}

/**
 * Available user roles
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  message: string;
  code: number;
  details?: Record<string, unknown>;
}

/**
 * API response wrapper interface
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ErrorResponse;
  success: boolean;
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Sort direction enum
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Sort options interface
 */
export interface SortOptions {
  field: string;
  direction: SortDirection;
}

/**
 * Filter operator enum
 */
export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  CONTAINS = 'contains'
}

/**
 * Filter criteria interface
 */
export interface FilterCriteria {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean;
}

/**
 * Query parameters interface
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: SortOptions;
  filters?: FilterCriteria[];
  search?: string;
}

/**
 * Creates a new base model with default values
 */
export function createBaseModel(): BaseModel {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Creates a new user model with default values
 */
export function createUser(params: Partial<User> = {}): User {
  return {
    ...createBaseModel(),
    email: '',
    firstName: '',
    lastName: '',
    isActive: true,
    role: UserRole.USER,
    ...params
  };
}

/**
 * Type guard to check if a value is an ErrorResponse
 */
export function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    'code' in value
  );
}

/**
 * Creates a successful API response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    success: true
  };
}

/**
 * Creates an error API response
 */
export function createErrorResponse(error: ErrorResponse): ApiResponse<never> {
  return {
    error,
    success: false
  };
}

/**
 * Creates pagination metadata
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return {
    page,
    limit,
    total,
    hasMore: page * limit < total
  };
}