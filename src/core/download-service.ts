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
      link.href = canvas.toDataURL('image/png', 1.0); // PNG is always lossless
      
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
      link.href = canvas.toDataURL('image/jpeg', quality);
      
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
