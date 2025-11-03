/**
 * @fileoverview API service registration and configuration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from './types/errors';

/**
 * Configuration interface for API services
 */
interface ApiConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

/**
 * Class responsible for managing API service registration and connections
 */
export class ApiServices {
  private static instance: ApiServices;
  private supabase: SupabaseClient | null = null;
  private config: ApiConfig | null = null;

  private constructor() {}

  /**
   * Gets singleton instance of ApiServices
   * @returns {ApiServices} Singleton instance
   */
  public static getInstance(): ApiServices {
    if (!ApiServices.instance) {
      ApiServices.instance = new ApiServices();
    }
    return ApiServices.instance;
  }

  /**
   * Initializes API services with configuration
   * @param {ApiConfig} config - Configuration object containing API credentials
   * @throws {ApiError} If initialization fails
   */
  public async initialize(config: ApiConfig): Promise<void> {
    try {
      this.config = config;
      this.supabase = createClient(config.supabaseUrl, config.supabaseKey);

      // Verify connection
      const { error } = await this.supabase.auth.getSession();
      if (error) {
        throw new ApiError('Failed to initialize Supabase client', error);
      }
    } catch (error) {
      throw new ApiError('API services initialization failed', error as Error);
    }
  }

  /**
   * Gets initialized Supabase client instance
   * @returns {SupabaseClient} Supabase client instance
   * @throws {ApiError} If client is not initialized
   */
  public getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      throw new ApiError('Supabase client not initialized');
    }
    return this.supabase;
  }

  /**
   * Checks if API services are properly initialized
   * @returns {boolean} Initialization status
   */
  public isInitialized(): boolean {
    return !!this.supabase && !!this.config;
  }

  /**
   * Resets API services instance
   */
  public reset(): void {
    this.supabase = null;
    this.config = null;
  }
}

/**
 * Factory function to create and initialize API services
 * @param {ApiConfig} config - Configuration object
 * @returns {Promise<ApiServices>} Initialized API services instance
 */
export async function createApiServices(config: ApiConfig): Promise<ApiServices> {
  const services = ApiServices.getInstance();
  await services.initialize(config);
  return services;
}

/**
 * Helper function to get current API services instance
 * @returns {ApiServices} API services instance
 * @throws {ApiError} If services are not initialized
 */
export function getApiServices(): ApiServices {
  const services = ApiServices.getInstance();
  if (!services.isInitialized()) {
    throw new ApiError('API services not initialized');
  }
  return services;
}

/**
 * Helper function to check if API services are initialized
 * @returns {boolean} Initialization status
 */
export function isApiServicesInitialized(): boolean {
  return ApiServices.getInstance().isInitialized();
}