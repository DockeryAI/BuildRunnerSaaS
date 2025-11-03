Here's a comprehensive set of unit tests for the MarketingCampaignService using Jest:

```typescript
import { MarketingCampaignService, CampaignStatus, CampaignType, Campaign, CreateCampaignParams } from './MarketingCampaignService';

describe('MarketingCampaignService', () => {
  let service: MarketingCampaignService;
  let mockCampaignParams: CreateCampaignParams;
  
  beforeEach(() => {
    service = new MarketingCampaignService();
    mockCampaignParams = {
      name: 'Test Campaign',
      type: CampaignType.EMAIL,
      startDate: new Date(Date.now() + 86400000), // tomorrow
      endDate: new Date(Date.now() + 172800000),  // day after tomorrow
      budget: 1000,
      targetAudience: ['segment1', 'segment2']
    };
  });

  describe('createCampaign', () => {
    it('should create a campaign with valid parameters', () => {
      const campaign = service.createCampaign(mockCampaignParams);

      expect(campaign).toMatchObject({
        ...mockCampaignParams,
        status: CampaignStatus.DRAFT
      });
      expect(campaign.id).toBeDefined();
      expect(campaign.createdAt).toBeInstanceOf(Date);
      expect(campaign.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error when end date is before start date', () => {
      const invalidParams = {
        ...mockCampaignParams,
        startDate: new Date('2023-12-02'),
        endDate: new Date('2023-12-01')
      };

      expect(() => service.createCampaign(invalidParams))
        .toThrow('End date must be after start date');
    });
  });

  describe('launchCampaign', () => {
    let campaignId: string;

    beforeEach(() => {
      const campaign = service.createCampaign(mockCampaignParams);
      campaignId = campaign.id;
    });

    it('should set status to SCHEDULED for future campaign', () => {
      const updatedCampaign = service.launchCampaign(campaignId);
      expect(updatedCampaign.status).toBe(CampaignStatus.SCHEDULED);
    });

    it('should set status to ACTIVE for current campaign', () => {
      const currentCampaign = service.createCampaign({
        ...mockCampaignParams,
        startDate: new Date(Date.now() - 3600000), // 1 hour ago
        endDate: new Date(Date.now() + 3600000)    // 1 hour from now
      });

      const updatedCampaign = service.launchCampaign(currentCampaign.id);
      expect(updatedCampaign.status).toBe(CampaignStatus.ACTIVE);
    });

    it('should throw error for invalid campaign ID', () => {
      expect(() => service.launchCampaign('invalid-id'))
        .toThrow('Campaign not found');
    });

    it('should throw error for completed campaign', () => {
      const campaign = service.getCampaign(campaignId);
      campaign.status = CampaignStatus.COMPLETED;
      service.campaigns.set(campaignId, campaign);

      expect(() => service.launchCampaign(campaignId))
        .toThrow('Campaign must be in DRAFT or PAUSED status to launch');
    });
  });

  describe('pauseCampaign', () => {
    let activeCampaignId: string;

    beforeEach(() => {
      const campaign = service.createCampaign({
        ...mockCampaignParams,
        startDate: new Date(Date.now() - 3600000),
        endDate: new Date(Date.now() + 3600000)
      });
      activeCampaignId = campaign.id;
      service.launchCampaign(activeCampaignId);
    });

    it('should pause an active campaign', () => {
      const pausedCampaign = service.pauseCampaign(activeCampaignId);
      expect(pausedCampaign.status).toBe(CampaignStatus.PAUSED);
    });

    it('should throw error when pausing non-active campaign', () => {
      const campaign = service.createCampaign(mockCampaignParams);
      expect(() => service.pauseCampaign(campaign.id))
        .toThrow('Only active campaigns can be paused');
    });
  });

  describe('cancelCampaign', () => {
    let campaignId: string;

    beforeEach(() => {
      const campaign = service.createCampaign(mockCampaignParams);
      campaignId = campaign.id;
    });

    it('should cancel an active campaign', () => {
      const cancelledCampaign = service.cancelCampaign(campaignId);
      expect(cancelledCampaign.status).toBe(CampaignStatus.CANCELLED);
    });

    it('should throw error when cancelling completed campaign', () => {
      const campaign = service.getCampaign(campaignId);
      campaign.status = CampaignStatus.COMPLETED;
      service.campaigns.set(campaignId, campaign);

      expect(() => service.cancelCampaign(campaignId))
        .toThrow('Campaign is already completed or cancelled');
    });
  });

  describe('updateCampaignStatuses', () => {
    it('should update scheduled campaigns to active', () => {
      const campaign = service.createCampaign({
        ...mockCampaignParams,
        startDate: new Date(Date.now() - 3600000),
        endDate: new Date(Date.now() + 3600000)
      });
      service.launchCampaign(campaign.id);

      const updatedCount = service.updateCampaignStatuses();
      const updatedCampaign = service.getCampaign(campaign.id);

      expect(updatedCount).toBe(1);
      expect(updatedCampaign.status).toBe(CampaignStatus.ACTIVE);
    });

    it('should update expired campaigns to completed', () => {
      const campaign = service.createCampaign({
        ...mockCampaignParams,
        startDate: new Date(Date.now() - 172800000),
        endDate: new Date(Date.now() - 86400000)
      });
      service.launchCampaign(campaign.id);

      const updatedCount = service.updateCampaignStatuses();
      const updatedCampaign = service.getCampaign(campaign.id);

      expect(updatedCount).toBe(1);
      expect(updatedCampaign.status).toBe(CampaignStatus.COMPLETED);
    });
  });

  describe('listCampaigns', () => {
    it('should return all campaigns', () => {
      service.createCampaign(mockCampaignParams);
      service.createCampaign({
        ...mockCampaignParams,
        name: 'Second Campaign'
      });

      const campaigns = service.listCampaigns();
      expect(campaigns).toHaveLength(2);
    });

    it('should return empty array when no campaigns exist', () => {
      const campaigns = service.listCampaigns();
      expect(campaigns).toHaveLength(0);
    });
  });
});
```

This test suite includes:

1. Proper setup with beforeEach hooks to create a fresh service instance
2. Tests for all public methods
3. Coverage of success and error cases
4. Testing of status transitions
5. Validation of date handling
6. Error condition testing
7. Edge cases testing

Key testing patterns used:

- Arrange-Act-Assert pattern
- Error case testing using expect().toThrow()
- Date manipulation for testing time-dependent features
- Mocking of complex objects
- State verification
- Boundary testing

To run these tests:

1. Make sure you have Jest installed in your project
2. Save the test file as `MarketingCampaignService.test.ts`
3. Run `npm test` or `jest`

Note: You might need to configure Jest to handle TypeScript files properly in your project.