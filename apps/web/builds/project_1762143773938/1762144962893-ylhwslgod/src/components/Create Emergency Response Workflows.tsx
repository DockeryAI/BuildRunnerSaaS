```typescript
import React, { useState, useEffect } from 'react';
import { useOpenRouter } from '@/hooks/useOpenRouter';
import { WorkflowStep, Workflow, EmergencyType } from '@/types/workflows';

interface EmergencyWorkflowProps {
  onWorkflowCreated: (workflow: Workflow) => void;
  onError: (error: Error) => void;
}

/**
 * Component for creating emergency response workflows
 * @param props Component properties
 * @returns JSX element
 */
export const EmergencyWorkflowCreator: React.FC<EmergencyWorkflowProps> = ({ onWorkflowCreated, onError }) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [workflowName, setWorkflowName] = useState('');
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('FIRE');
  const { generateWorkflowSteps } = useOpenRouter();

  const emergencyTypes: EmergencyType[] = ['FIRE', 'MEDICAL', 'SECURITY', 'NATURAL_DISASTER'];

  /**
   * Handles workflow creation submission
   * @param e Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!workflowName) {
        throw new Error('Workflow name is required');
      }

      const generatedSteps = await generateWorkflowSteps(emergencyType);
      
      const newWorkflow: Workflow = {
        id: crypto.randomUUID(),
        name: workflowName,
        type: emergencyType,
        steps: generatedSteps,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onWorkflowCreated(newWorkflow);
      resetForm();
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to create workflow'));
    }
  };

  /**
   * Resets form to initial state
   */
  const resetForm = () => {
    setWorkflowName('');
    setSteps([]);
    setEmergencyType('FIRE');
  };

  /**
   * Adds a new step to the workflow
   * @param step Step to add
   */
  const addStep = (step: WorkflowStep) => {
    setSteps(prevSteps => [...prevSteps, step]);
  };

  /**
   * Removes a step from the workflow
   * @param stepId ID of step to remove
   */
  const removeStep = (stepId: string) => {
    setSteps(prevSteps => prevSteps.filter(step => step.id !== stepId));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Emergency Response Workflow</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Workflow Name
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Emergency Type
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value as EmergencyType)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {emergencyTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Workflow Steps</h3>
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-2">
              <span className="font-medium">{index + 1}.</span>
              <span>{step.description}</span>
              <button
                type="button"
                onClick={() => removeStep(step.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Workflow
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmergencyWorkflowCreator;
```