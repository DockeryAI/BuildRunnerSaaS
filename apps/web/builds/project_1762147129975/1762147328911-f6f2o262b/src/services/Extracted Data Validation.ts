/**
 * @fileoverview Service for validating extracted data against defined schemas and rules
 */

import { useState, useCallback } from 'react';

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  validator?: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationOptions {
  stopOnFirstError?: boolean;
  customRules?: ValidationRule[];
}

/**
 * Service for validating extracted data
 */
export const useDataValidation = () => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  /**
   * Validates data against provided rules
   * @param data - Object containing data to validate
   * @param rules - Array of validation rules to check against
   * @param options - Optional validation configuration
   * @returns Validation result with errors if any
   */
  const validateData = useCallback((
    data: Record<string, any>,
    rules: ValidationRule[],
    options: ValidationOptions = {}
  ): ValidationResult => {
    const errors: ValidationError[] = [];
    const { stopOnFirstError = false, customRules = [] } = options;

    const allRules = [...rules, ...customRules];

    for (const rule of allRules) {
      const value = data[rule.field];

      try {
        switch (rule.type) {
          case 'required':
            if (value === undefined || value === null || value === '') {
              errors.push({
                field: rule.field,
                message: rule.message || `${rule.field} is required`
              });
              if (stopOnFirstError) break;
            }
            break;

          case 'format':
            if (value && rule.validator && !rule.validator(value)) {
              errors.push({
                field: rule.field,
                message: rule.message || `${rule.field} has invalid format`
              });
              if (stopOnFirstError) break;
            }
            break;

          case 'range':
            if (value && rule.validator && !rule.validator(value)) {
              errors.push({
                field: rule.field,
                message: rule.message || `${rule.field} is out of valid range`
              });
              if (stopOnFirstError) break;
            }
            break;

          case 'custom':
            if (rule.validator && !rule.validator(value)) {
              errors.push({
                field: rule.field,
                message: rule.message || `${rule.field} failed validation`
              });
              if (stopOnFirstError) break;
            }
            break;

          default:
            console.warn(`Unknown validation rule type: ${rule.type}`);
        }
      } catch (error) {
        console.error(`Validation error for field ${rule.field}:`, error);
        errors.push({
          field: rule.field,
          message: 'An error occurred during validation'
        });
        if (stopOnFirstError) break;
      }
    }

    setValidationErrors(errors);
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  /**
   * Clears all validation errors
   */
  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  /**
   * Creates a required field validation rule
   * @param field - Field name to validate
   * @param message - Custom error message
   */
  const createRequiredRule = (field: string, message?: string): ValidationRule => ({
    field,
    type: 'required',
    message: message || `${field} is required`
  });

  /**
   * Creates a format validation rule
   * @param field - Field name to validate
   * @param validator - Validation function
   * @param message - Custom error message
   */
  const createFormatRule = (
    field: string,
    validator: (value: any) => boolean,
    message?: string
  ): ValidationRule => ({
    field,
    type: 'format',
    validator,
    message: message || `${field} has invalid format`
  });

  return {
    validateData,
    validationErrors,
    clearValidationErrors,
    createRequiredRule,
    createFormatRule
  };
};