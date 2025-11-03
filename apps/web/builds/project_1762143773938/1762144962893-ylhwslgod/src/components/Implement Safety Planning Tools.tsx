```typescript
// safetyPlanning.tsx

import React, { useState, useEffect } from 'react';
import { useOpenRouter } from '../hooks/useOpenRouter';
import { SafetyPlan, EmergencyContact, CopingStrategy } from '../types/safety';

interface SafetyPlanningProps {
  userId: string;
  onSave: (plan: SafetyPlan) => Promise<void>;
  existingPlan?: SafetyPlan;
}

/**
 * Safety Planning Tool Component
 * Allows users to create and manage their personal safety plan
 * @param props Component properties
 */
export const SafetyPlanningTool: React.FC<SafetyPlanningProps> = ({ 
  userId,
  onSave,
  existingPlan
}) => {
  const [plan, setPlan] = useState<SafetyPlan>({
    userId,
    emergencyContacts: [],
    copingStrategies: [],
    safeSpaces: [],
    warningSignals: [],
    professionalResources: [],
    lastUpdated: new Date()
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { getAISuggestions } = useOpenRouter();

  useEffect(() => {
    if (existingPlan) {
      setPlan(existingPlan);
    }
  }, [existingPlan]);

  /**
   * Adds an emergency contact to the safety plan
   * @param contact Emergency contact details
   */
  const addEmergencyContact = (contact: EmergencyContact): void => {
    try {
      setPlan(prev => ({
        ...prev,
        emergencyContacts: [...prev.emergencyContacts, contact]
      }));
    } catch (err) {
      setError('Failed to add emergency contact');
    }
  };

  /**
   * Adds a coping strategy to the safety plan
   * @param strategy Coping strategy details
   */
  const addCopingStrategy = async (strategy: CopingStrategy): Promise<void> => {
    try {
      setIsLoading(true);
      const aiSuggestions = await getAISuggestions(strategy.description);
      
      setPlan(prev => ({
        ...prev,
        copingStrategies: [...prev.copingStrategies, {
          ...strategy,
          aiSuggestions
        }]
      }));
    } catch (err) {
      setError('Failed to add coping strategy');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Removes an emergency contact from the safety plan
   * @param contactId ID of contact to remove
   */
  const removeEmergencyContact = (contactId: string): void => {
    try {
      setPlan(prev => ({
        ...prev,
        emergencyContacts: prev.emergencyContacts.filter(c => c.id !== contactId)
      }));
    } catch (err) {
      setError('Failed to remove emergency contact');
    }
  };

  /**
   * Handles form submission and saves the safety plan
   * @param e Form submission event
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await onSave({
        ...plan,
        lastUpdated: new Date()
      });
    } catch (err) {
      setError('Failed to save safety plan');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="safety-plan-error">
        <p>Error: {error}</p>
        <button onClick={() => setError(null)}>Dismiss</button>
      </div>
    );
  }

  return (
    <div className="safety-plan-container">
      <form onSubmit={handleSubmit}>
        <section className="emergency-contacts">
          <h2>Emergency Contacts</h2>
          {plan.emergencyContacts.map(contact => (
            <div key={contact.id} className="contact-card">
              <h3>{contact.name}</h3>
              <p>{contact.phone}</p>
              <p>{contact.relationship}</p>
              <button 
                type="button"
                onClick={() => removeEmergencyContact(contact.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </section>

        <section className="coping-strategies">
          <h2>Coping Strategies</h2>
          {plan.copingStrategies.map(strategy => (
            <div key={strategy.id} className="strategy-card">
              <h3>{strategy.title}</h3>
              <p>{strategy.description}</p>
              {strategy.aiSuggestions && (
                <div className="ai-suggestions">
                  <h4>AI Suggestions</h4>
                  <ul>
                    {strategy.aiSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="safe-spaces">
          <h2>Safe Spaces</h2>
          <ul>
            {plan.safeSpaces.map((space, index) => (
              <li key={index}>{space}</li>
            ))}
          </ul>
        </section>

        <section className="warning-signals">
          <h2>Warning Signals</h2>
          <ul>
            {plan.warningSignals.map((signal, index) => (
              <li key={index}>{signal}</li>
            ))}
          </ul>
        </section>

        <section className="professional-resources">
          <h2>Professional Resources</h2>
          <ul>
            {plan.professionalResources.map((resource, index) => (
              <li key={index}>
                <strong>{resource.name}</strong>
                <p>{resource.contact}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isLoading}
            className="save-button"
          >
            {isLoading ? 'Saving...' : 'Save Safety Plan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SafetyPlanningTool;
```

```typescript
// types/safety.ts

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  aiSuggestions?: string[];
}

export interface ProfessionalResource {
  name: string;
  contact: string;
}

export interface SafetyPlan {
  userId: string;
  emergencyContacts: EmergencyContact[];
  copingStrategies: CopingStrategy[];
  safeSpaces: string[];
  warningSignals: string[];
  professionalResources: ProfessionalResource[];
  lastUpdated: Date;
}
```

```typescript
// hooks/useOpenRouter.ts

import { useState } from 'react';
import { OpenRouterAPI } from '../services/openRouterAPI';

export const useOpenRouter = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAISuggestions = async (prompt: string): Promise<string[]> => {
    try {
      setIsLoading(true);
      const response = await OpenRouterAPI.getSuggestions(prompt);
      return response.suggestions;
    } catch (err) {
      setError('Failed to get AI suggestions');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getAISuggestions,
    isLoading,
    error
  };
};
```