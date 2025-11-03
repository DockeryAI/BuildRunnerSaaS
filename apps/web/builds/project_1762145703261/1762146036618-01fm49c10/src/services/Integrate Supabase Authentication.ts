import { createClient, SupabaseClient, User, AuthResponse } from '@supabase/supabase-js';

/**
 * Configuration interface for Supabase authentication
 */
interface SupabaseConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

/**
 * Service class to handle Supabase authentication operations
 */
export class SupabaseAuthService {
  private supabase: SupabaseClient;

  /**
   * Initialize Supabase client with provided configuration
   */
  constructor(config: SupabaseConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  /**
   * Sign up a new user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to AuthResponse
   * @throws Error if signup fails
   */
  public async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response;
    } catch (error) {
      throw new Error(`Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sign in user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to AuthResponse
   * @throws Error if signin fails
   */
  public async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response;
    } catch (error) {
      throw new Error(`Signin failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sign out current user
   * @throws Error if signout fails
   */
  public async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(`Signout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current authenticated user
   * @returns Current user or null if not authenticated
   */
  public async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user;
    } catch (error) {
      throw new Error(`Failed to get current user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reset password for given email
   * @param email - Email address for password reset
   * @throws Error if password reset fails
   */
  public async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(`Password reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update user's password
   * @param newPassword - New password to set
   * @throws Error if password update fails
   */
  public async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error(`Password update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the current session
   * @returns Current session or null if not authenticated
   */
  public async getSession(): Promise<AuthResponse['data']['session']> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return session;
    } catch (error) {
      throw new Error(`Failed to get session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set up auth state change listener
   * @param callback - Function to call when auth state changes
   * @returns Cleanup function to remove listener
   */
  public onAuthStateChange(
    callback: (event: 'SIGNED_IN' | 'SIGNED_OUT', session: AuthResponse['data']['session']) => void
  ): () => void {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }
}