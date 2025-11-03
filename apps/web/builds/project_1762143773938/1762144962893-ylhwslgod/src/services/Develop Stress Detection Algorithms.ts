```typescript
/**
 * @fileoverview Stress detection algorithm service for analyzing physiological and behavioral data
 */

import { EventEmitter } from 'events';

type PhysiologicalData = {
  heartRate: number;
  respirationRate: number;
  skinConductance: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
};

type BehavioralData = {
  keystrokeDynamics: number[];
  mouseMovements: {x: number, y: number}[];
  voiceFeatures: {
    pitch: number;
    intensity: number;
    speakingRate: number;
  };
};

type StressLevel = 'low' | 'medium' | 'high';

interface StressMetrics {
  overallStressScore: number;
  stressLevel: StressLevel;
  confidenceScore: number;
  timestamp: Date;
}

/**
 * Service for detecting and analyzing stress levels from physiological and behavioral data
 */
export class StressDetectionService extends EventEmitter {
  private readonly STRESS_THRESHOLD_MEDIUM = 0.5;
  private readonly STRESS_THRESHOLD_HIGH = 0.8;
  
  /**
   * Analyzes physiological data to detect stress patterns
   * @param data - Physiological sensor data
   * @returns Analyzed stress metrics
   * @throws Error if data is invalid
   */
  public analyzePhysiologicalData(data: PhysiologicalData): StressMetrics {
    try {
      this.validatePhysiologicalData(data);
      
      const hrScore = this.normalizeHeartRate(data.heartRate);
      const rrScore = this.normalizeRespirationRate(data.respirationRate);
      const scScore = this.normalizeSkinConductance(data.skinConductance);
      const bpScore = this.normalizeBloodPressure(data.bloodPressure);
      
      const overallScore = (hrScore + rrScore + scScore + bpScore) / 4;
      
      return {
        overallStressScore: overallScore,
        stressLevel: this.determineStressLevel(overallScore),
        confidenceScore: this.calculateConfidence([hrScore, rrScore, scScore, bpScore]),
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to analyze physiological data: ${error.message}`);
    }
  }

  /**
   * Analyzes behavioral data to detect stress patterns
   * @param data - Behavioral tracking data
   * @returns Analyzed stress metrics
   * @throws Error if data is invalid
   */
  public analyzeBehavioralData(data: BehavioralData): StressMetrics {
    try {
      this.validateBehavioralData(data);
      
      const keystrokeScore = this.analyzeKeystrokeDynamics(data.keystrokeDynamics);
      const mouseScore = this.analyzeMouseMovements(data.mouseMovements);
      const voiceScore = this.analyzeVoiceFeatures(data.voiceFeatures);
      
      const overallScore = (keystrokeScore + mouseScore + voiceScore) / 3;
      
      return {
        overallStressScore: overallScore,
        stressLevel: this.determineStressLevel(overallScore),
        confidenceScore: this.calculateConfidence([keystrokeScore, mouseScore, voiceScore]),
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to analyze behavioral data: ${error.message}`);
    }
  }

  /**
   * Combines physiological and behavioral analyses for comprehensive stress detection
   * @param physData - Physiological sensor data
   * @param behavData - Behavioral tracking data
   * @returns Combined stress metrics
   */
  public detectStress(physData: PhysiologicalData, behavData: BehavioralData): StressMetrics {
    try {
      const physMetrics = this.analyzePhysiologicalData(physData);
      const behavMetrics = this.analyzeBehavioralData(behavData);
      
      const combinedScore = (physMetrics.overallStressScore + behavMetrics.overallStressScore) / 2;
      const combinedConfidence = (physMetrics.confidenceScore + behavMetrics.confidenceScore) / 2;
      
      const result = {
        overallStressScore: combinedScore,
        stressLevel: this.determineStressLevel(combinedScore),
        confidenceScore: combinedConfidence,
        timestamp: new Date()
      };

      this.emit('stressDetected', result);
      return result;
    } catch (error) {
      throw new Error(`Stress detection failed: ${error.message}`);
    }
  }

  private validatePhysiologicalData(data: PhysiologicalData): void {
    if (!data.heartRate || !data.respirationRate || !data.skinConductance || !data.bloodPressure) {
      throw new Error('Invalid physiological data format');
    }
  }

  private validateBehavioralData(data: BehavioralData): void {
    if (!Array.isArray(data.keystrokeDynamics) || 
        !Array.isArray(data.mouseMovements) || 
        !data.voiceFeatures) {
      throw new Error('Invalid behavioral data format');
    }
  }

  private normalizeHeartRate(hr: number): number {
    return Math.min(Math.max((hr - 60) / (120 - 60), 0), 1);
  }

  private normalizeRespirationRate(rr: number): number {
    return Math.min(Math.max((rr - 12) / (20 - 12), 0), 1);
  }

  private normalizeSkinConductance(sc: number): number {
    return Math.min(Math.max(sc / 20, 0), 1);
  }

  private normalizeBloodPressure(bp: {systolic: number, diastolic: number}): number {
    const systolicScore = (bp.systolic - 90) / (140 - 90);
    const diastolicScore = (bp.diastolic - 60) / (90 - 60);
    return Math.min(Math.max((systolicScore + diastolicScore) / 2, 0), 1);
  }

  private analyzeKeystrokeDynamics(dynamics: number[]): number {
    return dynamics.reduce((acc, val) => acc + val, 0) / dynamics.length;
  }

  private analyzeMouseMovements(movements: {x: number, y: number}[]): number {
    const velocities = movements.slice(1).map((move, i) => {
      const prev = movements[i];
      const dx = move.x - prev.x;
      const dy = move.y - prev.y;
      return Math.sqrt(dx * dx + dy * dy);
    });
    return Math.min(Math.max(velocities.reduce((acc, val) => acc + val, 0) / velocities.length / 100, 0), 1);
  }

  private analyzeVoiceFeatures(features: {pitch: number, intensity: number, speakingRate: number}): number {
    const pitchScore = features.pitch / 500;
    const intensityScore = features.intensity / 100;
    const rateScore = features.speakingRate / 200;
    return (pitchScore + intensityScore + rateScore) / 3;
  }

  private determineStressLevel(score: number): StressLevel {
    if (score >= this.STRESS_THRESHOLD_HIGH) return 'high';
    if (score >= this.STRESS_THRESHOLD_MEDIUM) return 'medium';
    return 'low';
  }

  private calculateConfidence(scores: number[]): number {
    const variance = scores.reduce((acc, score) => {
      const diff = score - (scores.reduce((a, b) => a + b, 0) / scores.length);
      return acc + (diff * diff);
    }, 0) / scores.length;
    
    return 1 - Math.min(variance, 1);
  }
}
```