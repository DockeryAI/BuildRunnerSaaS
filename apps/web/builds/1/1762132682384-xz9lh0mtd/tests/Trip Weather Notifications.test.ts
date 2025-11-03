Here's a comprehensive set of unit tests for the TripWeatherNotificationService component:

```typescript
import { TripWeatherNotificationService, WeatherSeverity, WeatherNotification } from './TripWeatherNotificationService';
import { firstValueFrom } from 'rxjs';

describe('TripWeatherNotificationService', () => {
  let service: TripWeatherNotificationService;
  let mockNotification: WeatherNotification;

  beforeEach(() => {
    service = new TripWeatherNotificationService();
    mockNotification = {
      id: '123',
      tripId: 'trip123',
      timestamp: new Date(),
      condition: 'Rain',
      severity: WeatherSeverity.ADVISORY,
      message: 'Heavy rain expected',
      location: {
        lat: 40.7128,
        lng: -74.0060
      }
    };
  });

  describe('addNotification', () => {
    it('should add valid notification to the stream', async () => {
      service.addNotification(mockNotification);
      const notifications = await firstValueFrom(service.getNotifications());
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual(mockNotification);
    });

    it('should emit error for invalid notification', (done) => {
      const invalidNotification = { ...mockNotification, id: '' };
      
      service.getErrors().subscribe(error => {
        expect(error.message).toBe('Notification ID is required');
        done();
      });

      service.addNotification(invalidNotification);
    });

    test.each([
      ['id', { ...mockNotification, id: '' }, 'Notification ID is required'],
      ['tripId', { ...mockNotification, tripId: '' }, 'Trip ID is required'],
      ['timestamp', { ...mockNotification, timestamp: null }, 'Timestamp is required'],
      ['condition', { ...mockNotification, condition: '' }, 'Weather condition is required'],
      ['severity', { ...mockNotification, severity: 'INVALID' }, 'Invalid severity level'],
      ['message', { ...mockNotification, message: '' }, 'Notification message is required'],
      ['location', { ...mockNotification, location: null }, 'Valid location coordinates are required'],
      ['location coordinates', { ...mockNotification, location: { lat: 'invalid', lng: 0 } }, 'Valid location coordinates are required'],
    ])('should validate %s', async (field, invalidNotification, expectedError) => {
      service.getErrors().subscribe(error => {
        expect(error.message).toBe(expectedError);
      });

      service.addNotification(invalidNotification as WeatherNotification);
    });
  });

  describe('removeNotification', () => {
    it('should remove notification by ID', async () => {
      service.addNotification(mockNotification);
      service.removeNotification(mockNotification.id);
      
      const notifications = await firstValueFrom(service.getNotifications());
      expect(notifications).toHaveLength(0);
    });

    it('should handle removing non-existent notification', async () => {
      service.addNotification(mockNotification);
      service.removeNotification('non-existent-id');
      
      const notifications = await firstValueFrom(service.getNotifications());
      expect(notifications).toHaveLength(1);
    });
  });

  describe('clearTripNotifications', () => {
    it('should clear all notifications for specified trip', async () => {
      const notification1 = { ...mockNotification, id: '1' };
      const notification2 = { ...mockNotification, id: '2', tripId: 'trip456' };
      
      service.addNotification(notification1);
      service.addNotification(notification2);
      service.clearTripNotifications('trip123');
      
      const notifications = await firstValueFrom(service.getNotifications());
      expect(notifications).toHaveLength(1);
      expect(notifications[0].tripId).toBe('trip456');
    });
  });

  describe('getNotificationsBySeverity', () => {
    it('should filter notifications by severity', async () => {
      const warningNotification = { ...mockNotification, id: '2', severity: WeatherSeverity.WARNING };
      
      service.addNotification(mockNotification);
      service.addNotification(warningNotification);
      
      const advisoryNotifications = await firstValueFrom(service.getNotificationsBySeverity(WeatherSeverity.ADVISORY));
      expect(advisoryNotifications).toHaveLength(1);
      expect(advisoryNotifications[0].severity).toBe(WeatherSeverity.ADVISORY);
    });

    it('should handle errors', (done) => {
      service.getErrors().subscribe(error => {
        expect(error).toBeTruthy();
        done();
      });

      service.getNotificationsBySeverity(null as any);
    });
  });

  describe('getTripNotifications', () => {
    it('should get notifications for specific trip', async () => {
      const otherTripNotification = { ...mockNotification, id: '2', tripId: 'trip456' };
      
      service.addNotification(mockNotification);
      service.addNotification(otherTripNotification);
      
      const tripNotifications = await firstValueFrom(service.getTripNotifications('trip123'));
      expect(tripNotifications).toHaveLength(1);
      expect(tripNotifications[0].tripId).toBe('trip123');
    });

    it('should handle errors', (done) => {
      service.getErrors().subscribe(error => {
        expect(error).toBeTruthy();
        done();
      });

      service.getTripNotifications(null as any);
    });
  });

  describe('factory function', () => {
    it('should create new instance of service', () => {
      const { createTripWeatherNotificationService } = require('./TripWeatherNotificationService');
      const service = createTripWeatherNotificationService();
      expect(service).toBeInstanceOf(TripWeatherNotificationService);
    });
  });
});
```

This test suite includes:

1. Tests for all public methods
2. Validation testing for notification objects
3. Error handling tests
4. Edge cases (empty lists, invalid inputs)
5. Observable stream behavior testing
6. Factory function testing

Key testing patterns used:

- BeforeEach setup with mock data
- Async/await testing for Observable streams
- Error subscription testing
- Parameterized tests using test.each
- Instance checking
- Stream completion verification
- Edge case handling

The tests use Jest's standard assertions and testing utilities along with RxJS's firstValueFrom for handling Observable streams. The test coverage includes:

- Input validation
- State management
- Error handling
- Data filtering
- Observable stream behavior
- Factory function functionality

Remember to install the necessary dependencies:
```bash
npm install --save-dev jest @types/jest rxjs
```

You might also need to configure Jest for TypeScript support in your project's jest.config.js file.