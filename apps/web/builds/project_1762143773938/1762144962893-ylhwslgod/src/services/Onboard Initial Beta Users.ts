```typescript
/**
 * @fileoverview Service for onboarding initial beta users
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for beta user data
 */
interface BetaUser {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  signupDate: Date;
  status: BetaUserStatus;
}

/**
 * Enum for beta user status
 */
enum BetaUserStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

/**
 * Error class for beta user onboarding errors
 */
class BetaUserOnboardingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BetaUserOnboardingError';
  }
}

/**
 * Service class for managing beta user onboarding
 */
export class BetaUserOnboardingService {
  private betaUsers: Map<string, BetaUser>;
  private readonly maxBetaUsers: number;

  /**
   * Creates a new BetaUserOnboardingService
   * @param maxBetaUsers Maximum number of beta users allowed
   */
  constructor(maxBetaUsers: number = 100) {
    this.betaUsers = new Map();
    this.maxBetaUsers = maxBetaUsers;
  }

  /**
   * Registers a new beta user
   * @param email User's email
   * @param name User's name
   * @param companyName Optional company name
   * @returns The created beta user object
   * @throws {BetaUserOnboardingError} If registration fails
   */
  public async registerBetaUser(
    email: string,
    name: string,
    companyName?: string
  ): Promise<BetaUser> {
    try {
      if (this.betaUsers.size >= this.maxBetaUsers) {
        throw new BetaUserOnboardingError('Beta user limit reached');
      }

      if (!this.isValidEmail(email)) {
        throw new BetaUserOnboardingError('Invalid email format');
      }

      if (this.isEmailRegistered(email)) {
        throw new BetaUserOnboardingError('Email already registered');
      }

      const betaUser: BetaUser = {
        id: uuidv4(),
        email: email.toLowerCase(),
        name,
        companyName,
        signupDate: new Date(),
        status: BetaUserStatus.PENDING
      };

      this.betaUsers.set(betaUser.id, betaUser);
      await this.sendWelcomeEmail(betaUser);

      return betaUser;
    } catch (error) {
      if (error instanceof BetaUserOnboardingError) {
        throw error;
      }
      throw new BetaUserOnboardingError('Failed to register beta user');
    }
  }

  /**
   * Updates a beta user's status
   * @param userId User ID
   * @param status New status
   * @returns Updated beta user object
   * @throws {BetaUserOnboardingError} If update fails
   */
  public updateBetaUserStatus(
    userId: string,
    status: BetaUserStatus
  ): BetaUser {
    const user = this.betaUsers.get(userId);
    
    if (!user) {
      throw new BetaUserOnboardingError('User not found');
    }

    user.status = status;
    this.betaUsers.set(userId, user);
    return user;
  }

  /**
   * Gets a beta user by ID
   * @param userId User ID
   * @returns Beta user object
   * @throws {BetaUserOnboardingError} If user not found
   */
  public getBetaUser(userId: string): BetaUser {
    const user = this.betaUsers.get(userId);
    
    if (!user) {
      throw new BetaUserOnboardingError('User not found');
    }

    return user;
  }

  /**
   * Gets all beta users
   * @returns Array of beta users
   */
  public getAllBetaUsers(): BetaUser[] {
    return Array.from(this.betaUsers.values());
  }

  /**
   * Gets beta users by status
   * @param status Status to filter by
   * @returns Array of filtered beta users
   */
  public getBetaUsersByStatus(status: BetaUserStatus): BetaUser[] {
    return this.getAllBetaUsers().filter(user => user.status === status);
  }

  /**
   * Checks if an email is already registered
   * @param email Email to check
   * @returns Boolean indicating if email is registered
   */
  private isEmailRegistered(email: string): boolean {
    const normalizedEmail = email.toLowerCase();
    return this.getAllBetaUsers().some(user => user.email === normalizedEmail);
  }

  /**
   * Validates email format
   * @param email Email to validate
   * @returns Boolean indicating if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sends welcome email to beta user
   * @param user Beta user to send email to
   */
  private async sendWelcomeEmail(user: BetaUser): Promise<void> {
    try {
      // Implementation would depend on email service being used
      // Placeholder for actual email sending logic
      console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      throw new BetaUserOnboardingError('Failed to send welcome email');
    }
  }
}
```