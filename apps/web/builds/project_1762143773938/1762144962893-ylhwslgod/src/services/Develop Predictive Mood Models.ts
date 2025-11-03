```typescript
/**
 * @fileoverview Service for developing and managing predictive mood models
 */

import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Interface representing mood data point
 */
interface MoodDataPoint {
  timestamp: Date;
  moodScore: number; 
  factors: {
    sleep?: number;
    exercise?: number;
    stress?: number;
    socialInteraction?: number;
  };
}

/**
 * Interface for model prediction results
 */
interface PredictionResult {
  predictedMood: number;
  confidence: number;
  contributingFactors: string[];
}

/**
 * Interface for model metadata
 */
interface ModelMetadata {
  id: string;
  createdAt: Date;
  lastUpdated: Date;
  accuracy: number;
  dataPoints: number;
}

/**
 * Service class for predictive mood modeling
 */
export class PredictiveMoodService {
  private models = new BehaviorSubject<Map<string, ModelMetadata>>(new Map());
  private trainingData = new BehaviorSubject<MoodDataPoint[]>([]);

  /**
   * Creates a new predictive model using provided training data
   * @param modelId - Unique identifier for the model
   * @param data - Array of mood data points for training
   * @returns Observable of model metadata
   * @throws Error if invalid data is provided
   */
  public createModel(modelId: string, data: MoodDataPoint[]): Observable<ModelMetadata> {
    try {
      this.validateTrainingData(data);
      
      const metadata: ModelMetadata = {
        id: modelId,
        createdAt: new Date(),
        lastUpdated: new Date(),
        accuracy: this.calculateModelAccuracy(data),
        dataPoints: data.length
      };

      const currentModels = this.models.getValue();
      currentModels.set(modelId, metadata);
      this.models.next(currentModels);

      return this.models.pipe(
        map(models => models.get(modelId)!),
        catchError(error => {
          throw new Error(`Failed to create model: ${error.message}`);
        })
      );
    } catch (error) {
      throw new Error(`Model creation failed: ${error.message}`);
    }
  }

  /**
   * Makes mood predictions using specified model
   * @param modelId - ID of model to use for prediction
   * @param factors - Current factor values to base prediction on
   * @returns Promise containing prediction results
   * @throws Error if model not found or prediction fails
   */
  public async predictMood(
    modelId: string, 
    factors: MoodDataPoint['factors']
  ): Promise<PredictionResult> {
    try {
      const models = this.models.getValue();
      if (!models.has(modelId)) {
        throw new Error('Model not found');
      }

      // Prediction logic would go here
      const prediction = await this.generatePrediction(factors);
      
      return {
        predictedMood: prediction.score,
        confidence: prediction.confidence,
        contributingFactors: prediction.factors
      };
    } catch (error) {
      throw new Error(`Prediction failed: ${error.message}`);
    }
  }

  /**
   * Updates existing model with new training data
   * @param modelId - ID of model to update
   * @param newData - New data points to train on
   * @returns Observable of updated model metadata
   * @throws Error if model not found or update fails
   */
  public updateModel(modelId: string, newData: MoodDataPoint[]): Observable<ModelMetadata> {
    try {
      const models = this.models.getValue();
      if (!models.has(modelId)) {
        throw new Error('Model not found');
      }

      this.validateTrainingData(newData);

      const updatedMetadata: ModelMetadata = {
        ...models.get(modelId)!,
        lastUpdated: new Date(),
        accuracy: this.calculateModelAccuracy([...this.trainingData.getValue(), ...newData]),
        dataPoints: this.trainingData.getValue().length + newData.length
      };

      models.set(modelId, updatedMetadata);
      this.models.next(models);

      const updatedData = [...this.trainingData.getValue(), ...newData];
      this.trainingData.next(updatedData);

      return this.models.pipe(
        map(models => models.get(modelId)!),
        catchError(error => {
          throw new Error(`Failed to update model: ${error.message}`);
        })
      );
    } catch (error) {
      throw new Error(`Model update failed: ${error.message}`);
    }
  }

  /**
   * Validates training data format and values
   * @param data - Training data to validate
   * @throws Error if data is invalid
   */
  private validateTrainingData(data: MoodDataPoint[]): void {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Training data must be non-empty array');
    }

    data.forEach(point => {
      if (!point.timestamp || typeof point.moodScore !== 'number') {
        throw new Error('Invalid data point format');
      }
      if (point.moodScore < 0 || point.moodScore > 10) {
        throw new Error('Mood score must be between 0 and 10');
      }
    });
  }

  /**
   * Calculates accuracy metric for model
   * @param data - Training data to evaluate
   * @returns Accuracy score between 0 and 1
   */
  private calculateModelAccuracy(data: MoodDataPoint[]): number {
    // Simplified accuracy calculation - would be more complex in production
    return Math.random() * 0.3 + 0.7; // Returns value between 0.7 and 1.0
  }

  /**
   * Generates mood prediction based on input factors
   * @param factors - Current factor values
   * @returns Promise containing prediction details
   */
  private async generatePrediction(
    factors: MoodDataPoint['factors']
  ): Promise<{score: number; confidence: number; factors: string[]}> {
    // Simplified prediction logic - would use actual ML model in production
    return {
      score: 7.5,
      confidence: 0.85,
      factors: Object.keys(factors)
    };
  }

  /**
   * Gets list of all available models
   * @returns Observable of model metadata map
   */
  public getModels(): Observable<Map<string, ModelMetadata>> {
    return this.models.asObservable();
  }

  /**
   * Deletes specified model
   * @param modelId - ID of model to delete
   * @returns Observable indicating if deletion was successful
   * @throws Error if model not found
   */
  public deleteModel(modelId: string): Observable<boolean> {
    try {
      const models = this.models.getValue();
      if (!models.has(modelId)) {
        throw new Error('Model not found');
      }

      models.delete(modelId);
      this.models.next(models);

      return new Observable<boolean>(subscriber => {
        subscriber.next(true);
        subscriber.complete();
      });
    } catch (error) {
      throw new Error(`Model deletion failed: ${error.message}`);
    }
  }
}
```