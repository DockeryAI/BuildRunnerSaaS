```typescript
/**
 * Mental health data schema types and interfaces
 */

/**
 * Represents severity levels for symptoms and conditions
 */
export enum Severity {
  NONE = 'none',
  MILD = 'mild', 
  MODERATE = 'moderate',
  SEVERE = 'severe'
}

/**
 * Represents the frequency of symptoms or events
 */
export enum Frequency {
  NEVER = 'never',
  RARELY = 'rarely',
  SOMETIMES = 'sometimes', 
  OFTEN = 'often',
  ALWAYS = 'always'
}

/**
 * Base interface for tracked mental health data
 */
export interface TrackedData {
  id: string;
  userId: string;
  timestamp: Date;
  notes?: string;
}

/**
 * Interface for mood tracking data
 */
export interface MoodEntry extends TrackedData {
  moodRating: number; // 1-10 scale
  emotions: string[];
  triggers?: string[];
  activities?: string[];
}

/**
 * Interface for anxiety tracking data
 */
export interface AnxietyEntry extends TrackedData {
  severityLevel: Severity;
  physicalSymptoms: string[];
  thoughts?: string[];
  copingMethods?: string[];
}

/**
 * Interface for sleep tracking data
 */
export interface SleepEntry extends TrackedData {
  hoursSlept: number;
  quality: number; // 1-5 scale
  disturbances?: string[];
  medications?: string[];
}

/**
 * Interface for medication tracking
 */
export interface MedicationEntry extends TrackedData {
  medicationName: string;
  dosage: string;
  frequency: Frequency;
  sideEffects?: string[];
  effectiveness?: number; // 1-5 scale
}

/**
 * Interface for therapy session notes
 */
export interface TherapySession extends TrackedData {
  therapistId: string;
  topics: string[];
  insights?: string[];
  homework?: string[];
  nextAppointment?: Date;
}

/**
 * Interface for coping strategy tracking
 */
export interface CopingStrategy extends TrackedData {
  strategy: string;
  effectiveness: number; // 1-5 scale
  context?: string;
  duration?: number; // minutes
}

/**
 * Interface for goal tracking
 */
export interface Goal extends TrackedData {
  title: string;
  description?: string;
  targetDate?: Date;
  progress: number; // 0-100
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
}

/**
 * Interface for crisis plan
 */
export interface CrisisPlan {
  id: string;
  userId: string;
  warningSignals: string[];
  copingStrategies: string[];
  supportContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  preferredHospital?: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  lastUpdated: Date;
}

/**
 * Type guard to check if an object is a valid TrackedData
 */
export function isTrackedData(obj: any): obj is TrackedData {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.userId === 'string' &&
    obj.timestamp instanceof Date
  );
}

/**
 * Validates a mood rating is within acceptable range
 */
export function isValidMoodRating(rating: number): boolean {
  return rating >= 1 && rating <= 10;
}

/**
 * Validates sleep quality rating is within acceptable range
 */
export function isValidSleepQuality(quality: number): boolean {
  return quality >= 1 && quality <= 5;
}

/**
 * Error class for invalid mental health data
 */
export class MentalHealthDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MentalHealthDataError';
  }
}

/**
 * Validates a complete mental health data entry
 */
export function validateEntry<T extends TrackedData>(entry: T): boolean {
  try {
    if (!isTrackedData(entry)) {
      throw new MentalHealthDataError('Invalid tracked data format');
    }

    if (entry.hasOwnProperty('moodRating')) {
      const moodEntry = entry as MoodEntry;
      if (!isValidMoodRating(moodEntry.moodRating)) {
        throw new MentalHealthDataError('Invalid mood rating');
      }
    }

    if (entry.hasOwnProperty('quality')) {
      const sleepEntry = entry as SleepEntry;
      if (!isValidSleepQuality(sleepEntry.quality)) {
        throw new MentalHealthDataError('Invalid sleep quality rating');
      }
    }

    return true;
  } catch (error) {
    if (error instanceof MentalHealthDataError) {
      throw error;
    }
    throw new MentalHealthDataError('Validation failed');
  }
}
```