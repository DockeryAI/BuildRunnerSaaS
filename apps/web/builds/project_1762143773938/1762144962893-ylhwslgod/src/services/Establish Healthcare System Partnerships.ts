```typescript
/**
 * @fileoverview Service for managing healthcare system partnerships
 */

import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Represents a healthcare system partner
 */
export interface HealthcarePartner {
  id: string;
  name: string;
  type: PartnerType;
  contactInfo: ContactInfo;
  partnershipStatus: PartnershipStatus;
  contractStartDate: Date;
  contractEndDate?: Date;
}

/**
 * Contact information for a healthcare partner
 */
export interface ContactInfo {
  primaryContact: string;
  email: string;
  phone: string;
  address: Address;
}

/**
 * Physical address
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Types of healthcare partners
 */
export enum PartnerType {
  HOSPITAL = 'HOSPITAL',
  CLINIC = 'CLINIC',
  LABORATORY = 'LABORATORY',
  PHARMACY = 'PHARMACY',
  INSURANCE = 'INSURANCE'
}

/**
 * Partnership status states
 */
export enum PartnershipStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TERMINATED = 'TERMINATED'
}

/**
 * Service for managing healthcare system partnerships
 */
export class HealthcarePartnershipService {
  private partners$ = new BehaviorSubject<HealthcarePartner[]>([]);
  
  /**
   * Gets all healthcare partners
   * @returns Observable of healthcare partners array
   */
  public getPartners(): Observable<HealthcarePartner[]> {
    return this.partners$.asObservable();
  }

  /**
   * Adds a new healthcare partner
   * @param partner The partner to add
   * @returns Observable of the added partner
   * @throws Error if partner data is invalid
   */
  public addPartner(partner: HealthcarePartner): Observable<HealthcarePartner> {
    try {
      this.validatePartner(partner);
      
      const currentPartners = this.partners$.getValue();
      const newPartners = [...currentPartners, partner];
      this.partners$.next(newPartners);

      return new Observable<HealthcarePartner>(observer => {
        observer.next(partner);
        observer.complete();
      });
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Updates an existing healthcare partner
   * @param partnerId Partner ID to update
   * @param updates Partner data updates
   * @returns Observable of updated partner
   * @throws Error if partner not found or data invalid
   */
  public updatePartner(partnerId: string, updates: Partial<HealthcarePartner>): Observable<HealthcarePartner> {
    return this.partners$.pipe(
      map(partners => {
        const index = partners.findIndex(p => p.id === partnerId);
        if (index === -1) {
          throw new Error(`Partner with ID ${partnerId} not found`);
        }

        const updatedPartner = {
          ...partners[index],
          ...updates
        };

        this.validatePartner(updatedPartner);

        const updatedPartners = [...partners];
        updatedPartners[index] = updatedPartner;
        this.partners$.next(updatedPartners);

        return updatedPartner;
      }),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Removes a healthcare partner
   * @param partnerId Partner ID to remove
   * @returns Observable of operation success
   * @throws Error if partner not found
   */
  public removePartner(partnerId: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const currentPartners = this.partners$.getValue();
      const index = currentPartners.findIndex(p => p.id === partnerId);
      
      if (index === -1) {
        observer.error(new Error(`Partner with ID ${partnerId} not found`));
        return;
      }

      const updatedPartners = currentPartners.filter(p => p.id !== partnerId);
      this.partners$.next(updatedPartners);
      
      observer.next(true);
      observer.complete();
    }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Gets a partner by ID
   * @param partnerId Partner ID to find
   * @returns Observable of found partner
   * @throws Error if partner not found
   */
  public getPartnerById(partnerId: string): Observable<HealthcarePartner> {
    return this.partners$.pipe(
      map(partners => {
        const partner = partners.find(p => p.id === partnerId);
        if (!partner) {
          throw new Error(`Partner with ID ${partnerId} not found`);
        }
        return partner;
      }),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Validates partner data
   * @param partner Partner data to validate
   * @throws Error if validation fails
   */
  private validatePartner(partner: HealthcarePartner): void {
    if (!partner.id || !partner.name) {
      throw new Error('Partner must have an ID and name');
    }

    if (!Object.values(PartnerType).includes(partner.type)) {
      throw new Error('Invalid partner type');
    }

    if (!Object.values(PartnershipStatus).includes(partner.partnershipStatus)) {
      throw new Error('Invalid partnership status');
    }

    if (!partner.contactInfo?.email || !this.isValidEmail(partner.contactInfo.email)) {
      throw new Error('Valid contact email is required');
    }

    if (!partner.contractStartDate) {
      throw new Error('Contract start date is required');
    }
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
}
```