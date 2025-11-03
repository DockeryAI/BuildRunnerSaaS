/**
 * @fileoverview Service for handling photo library access and image management
 */

import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

/**
 * Photo library access result interface
 */
export interface PhotoLibraryResult {
  cancelled: boolean;
  assets?: MediaLibrary.Asset[];
  error?: Error;
}

/**
 * Photo library service for managing photo access and permissions
 */
export class PhotoLibraryService {
  /**
   * Requests permission to access the device photo library
   * @returns Promise resolving to boolean indicating if permission was granted
   * @throws Error if permission request fails
   */
  public static async requestPermission(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      throw new Error(`Failed to request photo library permission: ${error}`);
    }
  }

  /**
   * Checks if photo library permissions are granted
   * @returns Promise resolving to boolean indicating permission status
   */
  public static async hasPermission(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      throw new Error(`Failed to check photo library permissions: ${error}`);
    }
  }

  /**
   * Opens photo library picker and allows selecting multiple photos
   * @param options Configuration options for the picker
   * @returns Promise resolving to PhotoLibraryResult
   */
  public static async pickMultiplePhotos(options?: ImagePicker.ImagePickerOptions): Promise<PhotoLibraryResult> {
    try {
      const hasPermission = await this.requestPermission();
      
      if (!hasPermission) {
        throw new Error('Photo library permission not granted');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        ...options
      });

      if (result.cancelled) {
        return { cancelled: true };
      }

      const assets = await Promise.all(
        result.assets.map(asset => MediaLibrary.createAssetAsync(asset.uri))
      );

      return {
        cancelled: false,
        assets
      };

    } catch (error) {
      return {
        cancelled: true,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  }

  /**
   * Saves an image to the device photo library
   * @param uri URI of the image to save
   * @param album Optional album name to save to
   * @returns Promise resolving to the saved asset
   */
  public static async saveImageToLibrary(uri: string, album?: string): Promise<MediaLibrary.Asset> {
    try {
      const hasPermission = await this.requestPermission();
      
      if (!hasPermission) {
        throw new Error('Photo library permission not granted');
      }

      const asset = await MediaLibrary.createAssetAsync(uri);

      if (album) {
        const albums = await MediaLibrary.getAlbumsAsync();
        let targetAlbum = albums.find(a => a.title === album);

        if (!targetAlbum) {
          targetAlbum = await MediaLibrary.createAlbumAsync(album, asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], targetAlbum.id, false);
        }
      }

      return asset;

    } catch (error) {
      throw new Error(`Failed to save image to library: ${error}`);
    }
  }

  /**
   * Deletes assets from the photo library
   * @param assets Array of assets to delete
   * @returns Promise resolving when deletion is complete
   */
  public static async deletePhotos(assets: MediaLibrary.Asset[]): Promise<void> {
    try {
      const hasPermission = await this.requestPermission();
      
      if (!hasPermission) {
        throw new Error('Photo library permission not granted');
      }

      await MediaLibrary.deleteAssetsAsync(assets);
    } catch (error) {
      throw new Error(`Failed to delete photos: ${error}`);
    }
  }

  /**
   * Gets all photos from the device library
   * @param options Options for fetching photos
   * @returns Promise resolving to array of assets
   */
  public static async getAllPhotos(options?: MediaLibrary.AssetsOptions): Promise<MediaLibrary.Asset[]> {
    try {
      const hasPermission = await this.requestPermission();
      
      if (!hasPermission) {
        throw new Error('Photo library permission not granted');
      }

      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [MediaLibrary.SortBy.creationTime],
        ...options
      });

      return assets;

    } catch (error) {
      throw new Error(`Failed to get photos: ${error}`);
    }
  }
}