```typescript
/**
 * @fileoverview Service for launching and managing marketing campaigns
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Campaign status enum
 */
export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED', 
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

/**
 * Campaign type enum
 */
export enum CampaignType {
  EMAIL = 'EMAIL',
  SOCIAL = 'SOCIAL',
  DISPLAY = 'DISPLAY',
  SEARCH = 'SEARCH'
}

/**
 * Campaign interface
 */
export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: Date;
  endDate: Date;
  budget: number;
  targetAudience: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Campaign creation params interface
 */
export interface CreateCampaignParams {
  name: string;
  type: CampaignType;
  startDate: Date;
  endDate: Date;
  budget: number;
  targetAudience: string[];
}

/**
 * Service class for managing marketing campaigns
 */
export class MarketingCampaignService {
  private campaigns: Map<string, Campaign>;

  constructor() {
    this.campaigns = new Map();
  }

  /**
   * Creates a new marketing campaign
   * @param params Campaign creation parameters
   * @returns The created campaign
   * @throws Error if dates are invalid
   */
  public createCampaign(params: CreateCampaignParams): Campaign {
    this.validateDates(params.startDate, params.endDate);
    
    const campaign: Campaign = {
      id: uuidv4(),
      status: CampaignStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...params
    };

    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  /**
   * Launches a campaign
   * @param campaignId ID of campaign to launch
   * @returns Updated campaign
   * @throws Error if campaign not found or invalid status
   */
  public launchCampaign(campaignId: string): Campaign {
    const campaign = this.getCampaign(campaignId);

    if (campaign.status !== CampaignStatus.DRAFT && 
        campaign.status !== CampaignStatus.PAUSED) {
      throw new Error('Campaign must be in DRAFT or PAUSED status to launch');
    }

    const now = new Date();
    if (campaign.startDate <= now && campaign.endDate >= now) {
      campaign.status = CampaignStatus.ACTIVE;
    } else if (campaign.startDate > now) {
      campaign.status = CampaignStatus.SCHEDULED;
    } else {
      throw new Error('Campaign dates are invalid for launch');
    }

    campaign.updatedAt = now;
    this.campaigns.set(campaignId, campaign);
    return campaign;
  }

  /**
   * Pauses an active campaign
   * @param campaignId ID of campaign to pause
   * @returns Updated campaign
   * @throws Error if campaign not found or not active
   */
  public pauseCampaign(campaignId: string): Campaign {
    const campaign = this.getCampaign(campaignId);

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new Error('Only active campaigns can be paused');
    }

    campaign.status = CampaignStatus.PAUSED;
    campaign.updatedAt = new Date();
    this.campaigns.set(campaignId, campaign);
    return campaign;
  }

  /**
   * Cancels a campaign
   * @param campaignId ID of campaign to cancel
   * @returns Updated campaign
   * @throws Error if campaign not found or already completed/cancelled
   */
  public cancelCampaign(campaignId: string): Campaign {
    const campaign = this.getCampaign(campaignId);

    if (campaign.status === CampaignStatus.COMPLETED || 
        campaign.status === CampaignStatus.CANCELLED) {
      throw new Error('Campaign is already completed or cancelled');
    }

    campaign.status = CampaignStatus.CANCELLED;
    campaign.updatedAt = new Date();
    this.campaigns.set(campaignId, campaign);
    return campaign;
  }

  /**
   * Gets a campaign by ID
   * @param campaignId Campaign ID to retrieve
   * @returns Campaign if found
   * @throws Error if campaign not found
   */
  public getCampaign(campaignId: string): Campaign {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found with ID: ${campaignId}`);
    }
    return campaign;
  }

  /**
   * Lists all campaigns
   * @returns Array of all campaigns
   */
  public listCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }

  /**
   * Updates campaign status based on dates
   * @returns Number of campaigns updated
   */
  public updateCampaignStatuses(): number {
    let updatedCount = 0;
    const now = new Date();

    this.campaigns.forEach(campaign => {
      let newStatus = campaign.status;

      if (campaign.status !== CampaignStatus.CANCELLED && 
          campaign.status !== CampaignStatus.COMPLETED) {
        if (campaign.endDate < now) {
          newStatus = CampaignStatus.COMPLETED;
        } else if (campaign.startDate <= now && campaign.status === CampaignStatus.SCHEDULED) {
          newStatus = CampaignStatus.ACTIVE;
        }

        if (newStatus !== campaign.status) {
          campaign.status = newStatus;
          campaign.updatedAt = now;
          this.campaigns.set(campaign.id, campaign);
          updatedCount++;
        }
      }
    });

    return updatedCount;
  }

  /**
   * Validates campaign start and end dates
   * @param startDate Campaign start date
   * @param endDate Campaign end date
   * @throws Error if dates are invalid
   */
  private validateDates(startDate: Date, endDate: Date): void {
    if (startDate >= endDate) {
      throw new Error('End date must be after start date');
    }
  }
}
```