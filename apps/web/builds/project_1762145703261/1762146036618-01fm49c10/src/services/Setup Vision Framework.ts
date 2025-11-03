/**
 * @file VisionService.ts
 * Handles setup and configuration of device vision/camera capabilities
 */

import { Camera, CameraDevice, CameraPermissionStatus } from '@types/camera';

export interface VisionConfig {
  preferredCamera?: 'front' | 'back';
  resolution?: {
    width: number;
    height: number;
  };
  frameRate?: number;
  autoFocus?: boolean;
}

export class VisionService {
  private static instance: VisionService;
  private currentCamera: CameraDevice | null = null;
  private isInitialized = false;

  private defaultConfig: VisionConfig = {
    preferredCamera: 'back',
    resolution: {
      width: 1280,
      height: 720
    },
    frameRate: 30,
    autoFocus: true
  };

  private constructor() {}

  /**
   * Gets singleton instance of VisionService
   * @returns VisionService instance
   */
  public static getInstance(): VisionService {
    if (!VisionService.instance) {
      VisionService.instance = new VisionService();
    }
    return VisionService.instance;
  }

  /**
   * Initializes the vision framework with provided config
   * @param config - Vision configuration options
   * @throws Error if initialization fails
   * @returns Promise that resolves when initialization is complete
   */
  public async initialize(config?: Partial<VisionConfig>): Promise<void> {
    try {
      if (this.isInitialized) {
        return;
      }

      const mergedConfig = { ...this.defaultConfig, ...config };

      const permissionStatus = await this.requestCameraPermission();
      if (permissionStatus !== CameraPermissionStatus.AUTHORIZED) {
        throw new Error('Camera permission denied');
      }

      const devices = await Camera.getAvailableCameraDevices();
      if (!devices.length) {
        throw new Error('No camera devices found');
      }

      const selectedDevice = this.selectCamera(devices, mergedConfig.preferredCamera!);
      if (!selectedDevice) {
        throw new Error(`${mergedConfig.preferredCamera} camera not available`);
      }

      await this.setupCamera(selectedDevice, mergedConfig);
      this.isInitialized = true;

    } catch (error) {
      throw new Error(`Failed to initialize vision framework: ${error.message}`);
    }
  }

  /**
   * Requests camera permissions from the user
   * @returns Promise resolving to permission status
   */
  private async requestCameraPermission(): Promise<CameraPermissionStatus> {
    try {
      return await Camera.requestCameraPermission();
    } catch (error) {
      throw new Error(`Failed to request camera permission: ${error.message}`);
    }
  }

  /**
   * Selects appropriate camera device based on preference
   * @param devices - Available camera devices
   * @param preference - Preferred camera position
   * @returns Selected camera device or null if not found
   */
  private selectCamera(devices: CameraDevice[], preference: 'front' | 'back'): CameraDevice | null {
    return devices.find(device => device.position === preference) || null;
  }

  /**
   * Configures and sets up selected camera device
   * @param device - Camera device to setup
   * @param config - Vision configuration
   */
  private async setupCamera(device: CameraDevice, config: VisionConfig): Promise<void> {
    try {
      await Camera.setupDevice(device, {
        resolution: config.resolution,
        frameRate: config.frameRate,
        autoFocus: config.autoFocus
      });
      this.currentCamera = device;
    } catch (error) {
      throw new Error(`Failed to setup camera: ${error.message}`);
    }
  }

  /**
   * Releases camera resources and resets service state
   */
  public async release(): Promise<void> {
    try {
      if (this.currentCamera) {
        await Camera.releaseDevice(this.currentCamera);
        this.currentCamera = null;
      }
      this.isInitialized = false;
    } catch (error) {
      throw new Error(`Failed to release camera: ${error.message}`);
    }
  }

  /**
   * Gets current camera device
   * @returns Current camera device or null if not initialized
   */
  public getCurrentCamera(): CameraDevice | null {
    return this.currentCamera;
  }

  /**
   * Checks if vision framework is initialized
   * @returns True if initialized, false otherwise
   */
  public isVisionInitialized(): boolean {
    return this.isInitialized;
  }
}

export default VisionService.getInstance();