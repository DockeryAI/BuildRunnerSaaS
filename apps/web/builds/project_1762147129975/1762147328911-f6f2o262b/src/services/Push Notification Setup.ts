/**
 * @fileoverview Push Notification Service for web applications
 */

interface PushNotificationState {
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  supported: boolean;
}

interface PushNotificationService {
  initialize(): Promise<void>;
  requestPermission(): Promise<NotificationPermission>;
  subscribe(): Promise<PushSubscription | null>;
  unsubscribe(): Promise<boolean>;
  sendNotification(title: string, options?: NotificationOptions): void;
}

export class WebPushNotificationService implements PushNotificationService {
  private state: PushNotificationState = {
    permission: 'default',
    subscription: null,
    supported: false
  };

  /**
   * Initializes the push notification service
   * @returns Promise that resolves when initialization is complete
   */
  public async initialize(): Promise<void> {
    try {
      this.state.supported = 'Notification' in window && 'serviceWorker' in navigator;
      
      if (!this.state.supported) {
        throw new Error('Push notifications are not supported');
      }

      this.state.permission = Notification.permission;

      if (this.state.permission === 'granted') {
        await this.setupServiceWorker();
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      throw error;
    }
  }

  /**
   * Requests permission to show notifications
   * @returns Promise with the permission status
   */
  public async requestPermission(): Promise<NotificationPermission> {
    try {
      const permission = await Notification.requestPermission();
      this.state.permission = permission;
      
      if (permission === 'granted') {
        await this.setupServiceWorker();
      }
      
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      throw error;
    }
  }

  /**
   * Subscribes to push notifications
   * @returns Promise with the push subscription
   */
  public async subscribe(): Promise<PushSubscription | null> {
    try {
      if (!this.state.supported || this.state.permission !== 'granted') {
        throw new Error('Push notifications are not enabled');
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
      });

      this.state.subscription = subscription;
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribes from push notifications
   * @returns Promise indicating success
   */
  public async unsubscribe(): Promise<boolean> {
    try {
      if (!this.state.subscription) {
        return false;
      }

      const result = await this.state.subscription.unsubscribe();
      this.state.subscription = null;
      return result;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  /**
   * Sends a notification
   * @param title Notification title
   * @param options Notification options
   */
  public sendNotification(title: string, options?: NotificationOptions): void {
    try {
      if (!this.state.supported || this.state.permission !== 'granted') {
        throw new Error('Push notifications are not enabled');
      }

      new Notification(title, options);
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Sets up the service worker
   * @returns Promise that resolves when setup is complete
   */
  private async setupServiceWorker(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await registration.update();
    } catch (error) {
      console.error('Failed to setup service worker:', error);
      throw error;
    }
  }

  /**
   * Converts VAPID key from base64 to Uint8Array
   * @param base64String Base64 encoded string
   * @returns Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
}

// React hook for using push notifications
export const usePushNotifications = () => {
  const [service] = React.useState<WebPushNotificationService>(
    () => new WebPushNotificationService()
  );

  React.useEffect(() => {
    service.initialize().catch(console.error);
  }, [service]);

  return service;
};