import type p5 from 'p5';
/**
 * Download service for exporting artwork from p5.js canvas
 *
 * Provides methods to download artwork in various formats (PNG, JPEG)
 * with customizable quality settings and filenames.
 */
export interface DownloadOptions {
    filename?: string;
    quality?: number;
    format?: 'png' | 'jpeg';
    addTimestamp?: boolean;
    cropMode?: 'full' | 'square';
    squareSize?: number;
}
export declare class DownloadService {
    /**
     * Download artwork as PNG (lossless)
     */
    static downloadPNG(p: p5, options?: DownloadOptions): boolean;
    /**
     * Download artwork as JPEG (lossy, smaller file size)
     */
    static downloadJPEG(p: p5, options?: DownloadOptions): boolean;
    /**
     * Download artwork with automatic format selection based on options
     */
    static downloadArtwork(p: p5, options?: DownloadOptions): boolean;
    /**
     * Generate filename with date if requested
     */
    private static generateFilename;
    /**
     * Get canvas dimensions for display purposes
     */
    static getCanvasInfo(p: p5): {
        width: number;
        height: number;
        aspectRatio: number;
    } | null;
    /**
     * Check if download is supported in current browser
     */
    static isDownloadSupported(): boolean;
    /**
     * Get estimated file size for different formats
     */
    static getEstimatedFileSize(p: p5, format: 'png' | 'jpeg', quality?: number): string;
    /**
     * Create a square crop from the center of the artwork
     */
    private static createSquareCrop;
    /**
     * Calculate optimal square size based on canvas dimensions
     */
    private static calculateOptimalSquareSize;
    /**
     * Get artwork bounds (useful for zoom controls)
     */
    static getArtworkBounds(p: p5): {
        centerX: number;
        centerY: number;
        maxRadius: number;
    } | null;
    /**
     * Estimate file size for download options
     */
    static estimateFileSize(p: p5 | null, options?: DownloadOptions): string;
    /**
     * Format bytes to human readable string
     */
    private static formatBytes;
}
export declare const downloadService: DownloadService;
