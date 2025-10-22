import type p5 from 'p5';

/**
 * Download service for exporting artwork from p5.js canvas
 * 
 * Provides methods to download artwork in various formats (PNG, JPEG)
 * with customizable quality settings and filenames.
 */

export interface DownloadOptions {
  filename?: string;
  quality?: number; // 0.0 to 1.0 for JPEG
  format?: 'png' | 'jpeg';
  addTimestamp?: boolean;
  cropMode?: 'full' | 'square';
  squareSize?: number; // Size of square crop in pixels
}

export class DownloadService {
  /**
   * Download artwork as PNG (lossless)
   */
  static downloadPNG(p: p5, options: DownloadOptions = {}): boolean {
    try {
      const canvas = p.canvas as HTMLCanvasElement;
      if (!canvas) {
        console.error('No canvas found');
        return false;
      }

      const filename = this.generateFilename(options, 'png');
      const link = document.createElement('a');
      
      link.download = filename;
      
      // Handle square crop if requested
      if (options.cropMode === 'square') {
        const croppedDataURL = this.createSquareCrop(canvas, options.squareSize);
        link.href = croppedDataURL;
      } else {
        link.href = canvas.toDataURL('image/png', 1.0); // PNG is always lossless
      }
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Downloaded: ${filename}`);
      return true;
    } catch (error) {
      console.error('PNG download failed:', error);
      return false;
    }
  }

  /**
   * Download artwork as JPEG (lossy, smaller file size)
   */
  static downloadJPEG(p: p5, options: DownloadOptions = {}): boolean {
    try {
      const canvas = p.canvas as HTMLCanvasElement;
      if (!canvas) {
        console.error('No canvas found');
        return false;
      }

      const quality = Math.max(0.1, Math.min(1.0, options.quality || 0.9));
      const filename = this.generateFilename(options, 'jpg');
      const link = document.createElement('a');
      
      link.download = filename;
      
      // Handle square crop if requested
      if (options.cropMode === 'square') {
        const croppedDataURL = this.createSquareCrop(canvas, options.squareSize, 'image/jpeg', quality);
        link.href = croppedDataURL;
      } else {
        link.href = canvas.toDataURL('image/jpeg', quality);
      }
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Downloaded: ${filename} (quality: ${quality})`);
      return true;
    } catch (error) {
      console.error('JPEG download failed:', error);
      return false;
    }
  }

  /**
   * Download artwork with automatic format selection based on options
   */
  static downloadArtwork(p: p5, options: DownloadOptions = {}): boolean {
    const format = options.format || 'png';
    
    switch (format) {
      case 'png':
        return this.downloadPNG(p, options);
      case 'jpeg':
        return this.downloadJPEG(p, options);
      default:
        console.error(`Unsupported format: ${format}`);
        return false;
    }
  }

  /**
   * Generate filename with timestamp if requested
   */
  private static generateFilename(options: DownloadOptions, extension: string): string {
    let filename = options.filename || 'wheelgen-artwork';
    
    // Add timestamp if requested or if no custom filename provided
    if (options.addTimestamp !== false && !options.filename) {
      const timestamp = new Date().toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, 19); // Remove milliseconds and timezone
      filename = `${filename}_${timestamp}`;
    }
    
    return `${filename}.${extension}`;
  }

  /**
   * Get canvas dimensions for display purposes
   */
  static getCanvasInfo(p: p5): { width: number; height: number; aspectRatio: number } | null {
    try {
      const canvas = p.canvas as HTMLCanvasElement;
      if (!canvas) return null;

      return {
        width: canvas.width,
        height: canvas.height,
        aspectRatio: canvas.width / canvas.height
      };
    } catch (error) {
      console.error('Failed to get canvas info:', error);
      return null;
    }
  }

  /**
   * Check if download is supported in current browser
   */
  static isDownloadSupported(): boolean {
    try {
      // Check if canvas.toDataURL is supported
      const canvas = document.createElement('canvas');
      const dataURL = canvas.toDataURL('image/png');
      return dataURL.startsWith('data:image/png');
    } catch (error) {
      return false;
    }
  }

  /**
   * Get estimated file size for different formats
   */
  static getEstimatedFileSize(p: p5, format: 'png' | 'jpeg', quality?: number): string {
    try {
      const canvas = p.canvas as HTMLCanvasElement;
      if (!canvas) return 'Unknown';

      const pixels = canvas.width * canvas.height;
      
      if (format === 'png') {
        // PNG is typically 1-3 bytes per pixel for artwork
        const estimatedBytes = pixels * 2;
        return this.formatBytes(estimatedBytes);
      } else {
        // JPEG compression varies significantly
        const compressionRatio = quality ? (1 - quality) * 0.8 + 0.1 : 0.2;
        const estimatedBytes = pixels * 3 * compressionRatio;
        return this.formatBytes(estimatedBytes);
      }
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Create a square crop from the center of the artwork
   */
  private static createSquareCrop(
    canvas: HTMLCanvasElement, 
    size?: number, 
    format: string = 'image/png', 
    quality?: number
  ): string {
    try {
      // Calculate optimal square size if not provided
      const squareSize = size || this.calculateOptimalSquareSize(canvas);
      
      // Create a new canvas for the square crop
      const cropCanvas = document.createElement('canvas');
      const ctx = cropCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D context');
      
      cropCanvas.width = squareSize;
      cropCanvas.height = squareSize;
      
      // Calculate center point
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const halfSize = squareSize / 2;
      
      // Draw the square crop from the center
      ctx.drawImage(
        canvas,
        centerX - halfSize, centerY - halfSize, squareSize, squareSize, // Source rectangle
        0, 0, squareSize, squareSize // Destination rectangle
      );
      
      // Return data URL
      return cropCanvas.toDataURL(format, quality);
    } catch (error) {
      console.error('Square crop failed:', error);
      // Fallback to full canvas
      return canvas.toDataURL(format, quality);
    }
  }

  /**
   * Calculate optimal square size based on canvas dimensions
   */
  private static calculateOptimalSquareSize(canvas: HTMLCanvasElement): number {
    // Use the smaller dimension to ensure the square fits
    const minDimension = Math.min(canvas.width, canvas.height);
    
    // Common square sizes for social media and printing
    const commonSizes = [512, 1024, 2048, 4096];
    
    // Find the largest common size that fits within the canvas
    for (let i = commonSizes.length - 1; i >= 0; i--) {
      if (commonSizes[i] <= minDimension) {
        return commonSizes[i];
      }
    }
    
    // If no common size fits, use 80% of the smaller dimension
    return Math.floor(minDimension * 0.8);
  }

  /**
   * Get artwork bounds (useful for zoom controls)
   */
  static getArtworkBounds(p: p5): { centerX: number; centerY: number; maxRadius: number } | null {
    try {
      // This would need to be implemented based on your artwork structure
      // For now, return canvas center as a fallback
      const canvas = p.canvas as HTMLCanvasElement;
      if (!canvas) return null;

      return {
        centerX: canvas.width / 2,
        centerY: canvas.height / 2,
        maxRadius: Math.min(canvas.width, canvas.height) / 2
      };
    } catch (error) {
      console.error('Failed to get artwork bounds:', error);
      return null;
    }
  }

  /**
   * Estimate file size for download options
   */
  static estimateFileSize(p: p5 | null, options: DownloadOptions = {}): string {
    if (!p || !p.canvas) return 'Unknown';
    
    const canvas = p.canvas as HTMLCanvasElement;
    let width = canvas.width;
    let height = canvas.height;
    
    // Adjust for square crop
    if (options.cropMode === 'square') {
      const squareSize = options.squareSize || this.calculateOptimalSquareSize(canvas);
      width = height = squareSize;
    }
    
    const pixelCount = width * height;
    
    if (options.format === 'jpeg') {
      // Rough estimate: JPEG compression ratio varies, but typically 10:1 to 20:1
      const quality = options.quality || 0.9;
      const compressionRatio = 15 * quality; // Higher quality = less compression
      const estimatedBytes = pixelCount * 3 / compressionRatio; // 3 bytes per pixel (RGB)
      return this.formatBytes(estimatedBytes);
    } else {
      // PNG: roughly 4 bytes per pixel (RGBA) with some compression
      const estimatedBytes = pixelCount * 3.5; // Slightly less than 4 due to compression
      return this.formatBytes(estimatedBytes);
    }
  }

  /**
   * Format bytes to human readable string
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance for convenience
export const downloadService = new DownloadService();
