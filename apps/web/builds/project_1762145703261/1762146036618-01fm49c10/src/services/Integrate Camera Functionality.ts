/**
 * @fileoverview Camera service for handling device camera interactions
 */

export interface CameraOptions {
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
  audio?: boolean;
}

export interface CaptureResult {
  imageData: string;
  timestamp: number;
}

export class CameraService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  /**
   * Initialize camera service with video element
   * @param videoElement - HTML video element to display camera feed
   */
  constructor(videoElement?: HTMLVideoElement) {
    this.videoElement = videoElement || document.createElement('video');
  }

  /**
   * Request camera access and start video stream
   * @param options - Camera configuration options
   * @returns Promise resolving when camera is started
   * @throws Error if camera access is denied or not available
   */
  public async startCamera(options: CameraOptions = {}): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: options.width || 1280,
          height: options.height || 720,
          facingMode: options.facingMode || 'user'
        },
        audio: options.audio || false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (this.videoElement) {
        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();
      }
    } catch (error) {
      throw new Error(`Failed to start camera: ${(error as Error).message}`);
    }
  }

  /**
   * Stop camera stream and cleanup resources
   */
  public stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  /**
   * Capture still image from camera stream
   * @returns Promise resolving with capture result containing image data
   * @throws Error if camera is not active
   */
  public async captureImage(): Promise<CaptureResult> {
    if (!this.stream || !this.videoElement) {
      throw new Error('Camera is not active');
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      context.drawImage(this.videoElement, 0, 0);
      
      return {
        imageData: canvas.toDataURL('image/jpeg'),
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`Failed to capture image: ${(error as Error).message}`);
    }
  }

  /**
   * Switch between front and back cameras if available
   * @returns Promise resolving when camera is switched
   * @throws Error if switching fails
   */
  public async switchCamera(): Promise<void> {
    if (!this.stream) {
      throw new Error('Camera is not active');
    }

    const currentFacingMode = this.stream.getVideoTracks()[0].getSettings().facingMode;
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

    this.stopCamera();
    await this.startCamera({ facingMode: newFacingMode });
  }

  /**
   * Check if device has camera capabilities
   * @returns Promise resolving with boolean indicating camera availability
   */
  public static async checkCameraAvailability(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      return false;
    }
  }

  /**
   * Get list of available camera devices
   * @returns Promise resolving with array of media device info
   */
  public static async getAvailableCameras(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      throw new Error(`Failed to get camera devices: ${(error as Error).message}`);
    }
  }
}