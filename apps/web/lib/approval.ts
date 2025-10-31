import { z } from 'zod';
import { auditLogger } from './audit';

// Change request types
export const ChangeRequestSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  type: z.enum([
    'plan_modification',
    'microstep_addition',
    'milestone_change',
    'scope_adjustment',
    'timeline_change',
    'resource_allocation',
    'risk_mitigation',
    'emergency_fix',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  impact_assessment: z.object({
    scope: z.enum(['minimal', 'moderate', 'significant', 'major']),
    timeline: z.enum(['none', 'minor', 'moderate', 'major']),
    resources: z.enum(['none', 'minimal', 'moderate', 'significant']),
    risk: z.enum(['low', 'medium', 'high', 'critical']),
  }),
  proposed_changes: z.record(z.any()),
  current_state: z.record(z.any()),
  rollback_plan: z.string(),
  created_by: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  status: z.enum([
    'draft',
    'submitted',
    'under_review',
    'approved',
    'rejected',
    'implemented',
    'rolled_back',
    'cancelled',
  ]),
  workflow_stage: z.enum([
    'initial_review',
    'technical_review',
    'stakeholder_approval',
    'final_approval',
    'implementation',
    'verification',
    'complete',
  ]),
  approvals: z.array(z.object({
    approver_id: z.string(),
    approver_role: z.string(),
    decision: z.enum(['approved', 'rejected', 'needs_changes']),
    comments: z.string().optional(),
    timestamp: z.string().datetime(),
  })),
  implementation_plan: z.object({
    steps: z.array(z.string()),
    estimated_duration: z.string(),
    rollback_triggers: z.array(z.string()),
    verification_criteria: z.array(z.string()),
  }).optional(),
});

export type ChangeRequest = z.infer<typeof ChangeRequestSchema>;

// Approval workflow configuration
export const WorkflowConfigSchema = z.object({
  stages: z.array(z.object({
    name: z.string(),
    required_approvers: z.number(),
    approver_roles: z.array(z.string()),
    auto_approve_conditions: z.array(z.string()).optional(),
    timeout_hours: z.number().optional(),
  })),
  escalation_rules: z.array(z.object({
    condition: z.string(),
    action: z.string(),
    notify: z.array(z.string()),
  })),
  emergency_bypass: z.object({
    enabled: z.boolean(),
    required_role: z.string(),
    audit_requirements: z.array(z.string()),
  }),
});

export type WorkflowConfig = z.infer<typeof WorkflowConfigSchema>;

/**
 * Change Approval Workflow Manager
 */
export class ApprovalWorkflow {
  private config: WorkflowConfig;

  constructor(config: WorkflowConfig) {
    this.config = config;
  }

  /**
   * Create a new change request
   */
  async createChangeRequest(
    request: Omit<ChangeRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'workflow_stage' | 'approvals'>
  ): Promise<ChangeRequest> {
    const changeRequest: ChangeRequest = {
      ...request,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'draft',
      workflow_stage: 'initial_review',
      approvals: [],
    };

    // Validate the change request
    const validatedRequest = ChangeRequestSchema.parse(changeRequest);

    // Log the creation
    await auditLogger.logUserAction(
      request.created_by,
      'change_request_created',
      { type: 'change_request', id: validatedRequest.id, name: validatedRequest.title },
      {
        type: validatedRequest.type,
        priority: validatedRequest.priority,
        impact: validatedRequest.impact_assessment,
      }
    );

    // Store the change request (in production, save to database)
    await this.persistChangeRequest(validatedRequest);

    return validatedRequest;
  }

  /**
   * Submit change request for approval
   */
  async submitForApproval(requestId: string, submitterId: string): Promise<ChangeRequest> {
    const request = await this.getChangeRequest(requestId);
    
    if (request.status !== 'draft') {
      throw new Error(`Cannot submit request in status: ${request.status}`);
    }

    const updatedRequest = {
      ...request,
      status: 'submitted' as const,
      updated_at: new Date().toISOString(),
    };

    await auditLogger.logUserAction(
      submitterId,
      'change_request_submitted',
      { type: 'change_request', id: requestId, name: request.title },
      { workflow_stage: request.workflow_stage }
    );

    // Notify required approvers
    await this.notifyApprovers(updatedRequest);

    await this.persistChangeRequest(updatedRequest);
    return updatedRequest;
  }

  /**
   * Process approval decision
   */
  async processApproval(
    requestId: string,
    approverId: string,
    approverRole: string,
    decision: 'approved' | 'rejected' | 'needs_changes',
    comments?: string
  ): Promise<ChangeRequest> {
    const request = await this.getChangeRequest(requestId);
    
    if (!['submitted', 'under_review'].includes(request.status)) {
      throw new Error(`Cannot approve request in status: ${request.status}`);
    }

    const approval = {
      approver_id: approverId,
      approver_role: approverRole,
      decision,
      comments,
      timestamp: new Date().toISOString(),
    };

    const updatedRequest = {
      ...request,
      approvals: [...request.approvals, approval],
      updated_at: new Date().toISOString(),
      status: 'under_review' as const,
    };

    // Check if we can advance to next stage
    const nextStage = await this.evaluateWorkflowProgress(updatedRequest);
    if (nextStage) {
      updatedRequest.workflow_stage = nextStage.stage;
      updatedRequest.status = nextStage.status;
    }

    await auditLogger.logUserAction(
      approverId,
      'change_request_approval',
      { type: 'change_request', id: requestId, name: request.title },
      {
        decision,
        comments,
        workflow_stage: updatedRequest.workflow_stage,
      }
    );

    await this.persistChangeRequest(updatedRequest);
    return updatedRequest;
  }

  /**
   * Implement approved change
   */
  async implementChange(requestId: string, implementerId: string): Promise<ChangeRequest> {
    const request = await this.getChangeRequest(requestId);
    
    if (request.status !== 'approved') {
      throw new Error(`Cannot implement request in status: ${request.status}`);
    }

    const updatedRequest = {
      ...request,
      status: 'implemented' as const,
      workflow_stage: 'implementation' as const,
      updated_at: new Date().toISOString(),
    };

    await auditLogger.logUserAction(
      implementerId,
      'change_request_implemented',
      { type: 'change_request', id: requestId, name: request.title },
      {
        proposed_changes: request.proposed_changes,
        implementation_plan: request.implementation_plan,
      }
    );

    // Apply the actual changes (this would integrate with plan modification logic)
    await this.applyChanges(request);

    await this.persistChangeRequest(updatedRequest);
    return updatedRequest;
  }

  /**
   * Rollback implemented change
   */
  async rollbackChange(requestId: string, rollbackBy: string, reason: string): Promise<ChangeRequest> {
    const request = await this.getChangeRequest(requestId);
    
    if (request.status !== 'implemented') {
      throw new Error(`Cannot rollback request in status: ${request.status}`);
    }

    const updatedRequest = {
      ...request,
      status: 'rolled_back' as const,
      updated_at: new Date().toISOString(),
    };

    await auditLogger.logUserAction(
      rollbackBy,
      'change_request_rolled_back',
      { type: 'change_request', id: requestId, name: request.title },
      {
        reason,
        rollback_plan: request.rollback_plan,
      }
    );

    // Execute rollback plan
    await this.executeRollback(request);

    await this.persistChangeRequest(updatedRequest);
    return updatedRequest;
  }

  /**
   * Evaluate workflow progress and determine next stage
   */
  private async evaluateWorkflowProgress(request: ChangeRequest): Promise<{ stage: ChangeRequest['workflow_stage']; status: ChangeRequest['status'] } | null> {
    const currentStageIndex = this.config.stages.findIndex(s => s.name === request.workflow_stage);
    if (currentStageIndex === -1) return null;

    const currentStage = this.config.stages[currentStageIndex];
    const stageApprovals = request.approvals.filter(a => 
      currentStage.approver_roles.includes(a.approver_role) && a.decision === 'approved'
    );

    // Check if current stage is complete
    if (stageApprovals.length >= currentStage.required_approvers) {
      const nextStageIndex = currentStageIndex + 1;
      
      if (nextStageIndex >= this.config.stages.length) {
        // All stages complete
        return { stage: 'complete', status: 'approved' };
      } else {
        // Move to next stage
        const nextStage = this.config.stages[nextStageIndex];
        return { stage: nextStage.name as ChangeRequest['workflow_stage'], status: 'under_review' };
      }
    }

    return null;
  }

  /**
   * Notify required approvers
   */
  private async notifyApprovers(request: ChangeRequest): Promise<void> {
    const currentStage = this.config.stages.find(s => s.name === request.workflow_stage);
    if (!currentStage) return;

    // In production, this would send notifications via email, Slack, etc.
    console.log(`[APPROVAL] Notifying approvers for ${request.title}:`, currentStage.approver_roles);
  }

  /**
   * Apply the approved changes
   */
  private async applyChanges(request: ChangeRequest): Promise<void> {
    // In production, this would integrate with the plan modification system
    console.log(`[APPROVAL] Applying changes for ${request.title}:`, request.proposed_changes);
  }

  /**
   * Execute rollback plan
   */
  private async executeRollback(request: ChangeRequest): Promise<void> {
    // In production, this would execute the rollback plan
    console.log(`[APPROVAL] Executing rollback for ${request.title}:`, request.rollback_plan);
  }

  /**
   * Persist change request to storage
   */
  private async persistChangeRequest(request: ChangeRequest): Promise<void> {
    // In production, this would save to Supabase
    console.log(`[APPROVAL] Persisting change request: ${request.id} - ${request.status}`);
  }

  /**
   * Retrieve change request from storage
   */
  private async getChangeRequest(requestId: string): Promise<ChangeRequest> {
    // In production, this would fetch from Supabase
    // For now, return a mock request
    throw new Error('Change request not found');
  }
}

// Default workflow configuration
export const defaultWorkflowConfig: WorkflowConfig = {
  stages: [
    {
      name: 'initial_review',
      required_approvers: 1,
      approver_roles: ['tech_lead', 'project_manager'],
      timeout_hours: 24,
    },
    {
      name: 'technical_review',
      required_approvers: 1,
      approver_roles: ['senior_engineer', 'architect'],
      timeout_hours: 48,
    },
    {
      name: 'stakeholder_approval',
      required_approvers: 1,
      approver_roles: ['product_owner', 'business_stakeholder'],
      timeout_hours: 72,
    },
    {
      name: 'final_approval',
      required_approvers: 1,
      approver_roles: ['admin', 'director'],
      timeout_hours: 24,
    },
  ],
  escalation_rules: [
    {
      condition: 'timeout_exceeded',
      action: 'escalate_to_manager',
      notify: ['manager', 'admin'],
    },
    {
      condition: 'critical_priority',
      action: 'expedite_approval',
      notify: ['all_approvers'],
    },
  ],
  emergency_bypass: {
    enabled: true,
    required_role: 'admin',
    audit_requirements: ['justification', 'post_review_required'],
  },
};

// Global approval workflow instance
export const approvalWorkflow = new ApprovalWorkflow(defaultWorkflowConfig);
