/**
 * @interface ImagePreviewOptions
 * @description Configuration options for image preview
 */
interface ImagePreviewOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * @interface ImagePreviewResult 
 * @description Result object containing preview data
 */
interface ImagePreviewResult {
  previewUrl: string;
  width: number;
  height: number;
  size: number;
  type: string;
}

/**
 * Service for generating image previews from File or Blob objects
 */
export class ImagePreviewService {
  private readonly defaultOptions: Required<ImagePreviewOptions> = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    format: 'image/jpeg'
  };

  /**
   * Creates an image preview from a file or blob
   * @param file - The source image file or blob
   * @param options - Optional configuration options
   * @returns Promise resolving to preview result
   * @throws Error if file is invalid or preview generation fails
   */
  public async createPreview(
    file: File | Blob,
    options?: ImagePreviewOptions
  ): Promise<ImagePreviewResult> {
    try {
      this.validateFile(file);
      
      const settings = { ...this.defaultOptions, ...options };
      const image = await this.loadImage(file);
      
      const { width, height } = this.calculateDimensions(
        image.width,
        image.height,
        settings.maxWidth,
        settings.maxHeight
      );

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(image, 0, 0, width, height);

      const previewUrl = canvas.toDataURL(settings.format, settings.quality);
      const previewSize = this.getDataUrlSize(previewUrl);

      return {
        previewUrl,
        width,
        height,
        size: previewSize,
        type: settings.format
      };
    } catch (error) {
      throw new Error(`Failed to create preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates the input file
   * @param file - File or blob to validate
   * @throws Error if file is invalid
   */
  private validateFile(file: File | Blob): void {
    if (!(file instanceof File || file instanceof Blob)) {
      throw new Error('Invalid input: must be File or Blob');
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type: must be JPEG, PNG, WebP or GIF');
    }
  }

  /**
   * Loads an image from a file or blob
   * @param file - Source file or blob
   * @returns Promise resolving to HTMLImageElement
   */
  private loadImage(file: File | Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculates dimensions maintaining aspect ratio
   * @param srcWidth - Original width
   * @param srcHeight - Original height
   * @param maxWidth - Maximum allowed width
   * @param maxHeight - Maximum allowed height
   * @returns Object containing calculated dimensions
   */
  private calculateDimensions(
    srcWidth: number,
    srcHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let width = srcWidth;
    let height = srcHeight;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return {
      width: Math.floor(width),
      height: Math.floor(height)
    };
  }

  /**
   * Calculates size of data URL in bytes
   * @param dataUrl - The data URL string
   * @returns Size in bytes
   */
  private getDataUrlSize(dataUrl: string): number {
    const base64 = dataUrl.split(',')[1];
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    return (base64.length * 0.75) - padding;
  }
}