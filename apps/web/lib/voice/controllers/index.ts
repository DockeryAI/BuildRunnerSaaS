/**
 * Voice Controllers Index
 * Central export for all voice controllers
 */

export { PRDVoiceController } from './PRDVoiceController';
export { WorkbenchVoiceController } from './WorkbenchVoiceController';
export { ProjectsVoiceController } from './ProjectsVoiceController';
export { PlanVoiceController } from './PlanVoiceController';
export { CostVoiceController } from './CostVoiceController';
export { AnalyticsVoiceController } from './AnalyticsVoiceController';
export { SettingsVoiceController } from './SettingsVoiceController';

// Export event emitters
export { workbenchEvents } from './WorkbenchVoiceController';
export { projectEvents } from './ProjectsVoiceController';
export { planEvents } from './PlanVoiceController';
export { costEvents } from './CostVoiceController';
export { analyticsEvents } from './AnalyticsVoiceController';
export { settingsEvents } from './SettingsVoiceController';
