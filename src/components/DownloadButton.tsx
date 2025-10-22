import { Component, createSignal, Show } from 'solid-js';
import type p5 from 'p5';
import { DownloadService, DownloadOptions } from '../core/download-service';

interface DownloadButtonProps {
  getP: () => p5 | null;
  className?: string;
}

export const DownloadButton: Component<DownloadButtonProps> = (props) => {
  const [isDownloading, setIsDownloading] = createSignal(false);
  const [showOptions, setShowOptions] = createSignal(false);
  const [downloadFormat, setDownloadFormat] = createSignal<'png' | 'jpeg'>('png');
  const [jpegQuality, setJpegQuality] = createSignal(0.9);
  const [customFilename, setCustomFilename] = createSignal('');
  const [cropMode, setCropMode] = createSignal<'full' | 'square'>('full');
  const [squareSize, setSquareSize] = createSignal(1024);

  const handleDownload = async (options: DownloadOptions = {}) => {
    const p = props.getP();
    if (!p || !p.canvas) {
      console.error('No p5 instance or canvas available');
      return;
    }

    setIsDownloading(true);
    
    try {
      const downloadOptions: DownloadOptions = {
        format: downloadFormat(),
        quality: downloadFormat() === 'jpeg' ? jpegQuality() : undefined,
        filename: customFilename() || undefined,
        addTimestamp: !customFilename(), // Only add timestamp if no custom filename
        cropMode: cropMode(),
        squareSize: cropMode() === 'square' ? squareSize() : undefined,
        ...options
      };

      const success = DownloadService.downloadArtwork(p, downloadOptions);
      
      if (success) {
        // Close options panel after successful download
        setShowOptions(false);
      } else {
        console.error('Download failed');
      }
      
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleQuickDownload = () => {
    handleDownload({ format: 'png' });
  };

  const getCanvasInfo = () => {
    const p = props.getP();
    if (!p) return null;
    return DownloadService.getCanvasInfo(p);
  };

  const getEstimatedSize = () => {
    const p = props.getP();
    if (!p) return 'Unknown';
    return DownloadService.getEstimatedFileSize(p, downloadFormat(), jpegQuality());
  };

  return (
    <div class={`download-button-container ${props.className || ''}`}>
      {/* Main download button */}
      <button
        onClick={handleQuickDownload}
        disabled={isDownloading()}
        class="download-button primary"
        title="Download artwork as PNG"
      >
        <Show when={isDownloading()} fallback="💾">
          ⏳
        </Show>
        <span>Download PNG</span>
      </button>

      {/* Options toggle button */}
      <button
        onClick={() => setShowOptions(!showOptions())}
        disabled={isDownloading()}
        class="download-button secondary"
        title="Download options"
      >
        ⚙️
      </button>

      {/* Options panel */}
      <Show when={showOptions()}>
        <div class="download-options-panel">
          <div class="options-header">
            <h4>Download Options</h4>
            <button
              onClick={() => setShowOptions(false)}
              class="close-options"
              title="Close options"
            >
              ×
            </button>
          </div>

          <div class="options-content">
            {/* Format selection */}
            <div class="option-group">
              <label>Format:</label>
              <div class="format-buttons">
                <button
                  onClick={() => setDownloadFormat('png')}
                  class={`format-button ${downloadFormat() === 'png' ? 'active' : ''}`}
                >
                  PNG (Lossless)
                </button>
                <button
                  onClick={() => setDownloadFormat('jpeg')}
                  class={`format-button ${downloadFormat() === 'jpeg' ? 'active' : ''}`}
                >
                  JPEG (Smaller)
                </button>
              </div>
            </div>

            {/* Crop mode selection */}
            <div class="option-group">
              <label>Crop Mode:</label>
              <div class="format-buttons">
                <button
                  onClick={() => setCropMode('full')}
                  class={`format-button ${cropMode() === 'full' ? 'active' : ''}`}
                >
                  Full Canvas
                </button>
                <button
                  onClick={() => setCropMode('square')}
                  class={`format-button ${cropMode() === 'square' ? 'active' : ''}`}
                >
                  Square Crop
                </button>
              </div>
            </div>

            {/* Square size selection */}
            <Show when={cropMode() === 'square'}>
              <div class="option-group">
                <label>Square Size:</label>
                <div class="format-buttons">
                  <button
                    onClick={() => setSquareSize(512)}
                    class={`format-button ${squareSize() === 512 ? 'active' : ''}`}
                  >
                    512px
                  </button>
                  <button
                    onClick={() => setSquareSize(1024)}
                    class={`format-button ${squareSize() === 1024 ? 'active' : ''}`}
                  >
                    1024px
                  </button>
                  <button
                    onClick={() => setSquareSize(2048)}
                    class={`format-button ${squareSize() === 2048 ? 'active' : ''}`}
                  >
                    2048px
                  </button>
                </div>
                <div class="format-buttons">
                  <button
                    onClick={() => setSquareSize(4096)}
                    class={`format-button ${squareSize() === 4096 ? 'active' : ''}`}
                  >
                    4096px
                  </button>
                  <button
                    onClick={() => setSquareSize(0)}
                    class={`format-button ${squareSize() === 0 ? 'active' : ''}`}
                  >
                    Auto
                  </button>
                </div>
              </div>
            </Show>

            {/* JPEG quality slider */}
            <Show when={downloadFormat() === 'jpeg'}>
              <div class="option-group">
                <label>Quality: {Math.round(jpegQuality() * 100)}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={jpegQuality()}
                  onInput={(e) => setJpegQuality(parseFloat(e.target.value))}
                  class="quality-slider"
                />
              </div>
            </Show>

            {/* Custom filename */}
            <div class="option-group">
              <label>Filename (optional):</label>
              <input
                type="text"
                placeholder="Leave empty for auto-generated name"
                value={customFilename()}
                onInput={(e) => setCustomFilename(e.target.value)}
                class="filename-input"
              />
            </div>

            {/* Canvas info */}
            <Show when={getCanvasInfo()}>
              <div class="canvas-info">
                <div class="info-row">
                  <span>Canvas:</span>
                  <span>{getCanvasInfo()!.width} × {getCanvasInfo()!.height}</span>
                </div>
                <div class="info-row">
                  <span>Estimated size:</span>
                  <span>{getEstimatedSize()}</span>
                </div>
              </div>
            </Show>

            {/* Download button */}
            <button
              onClick={() => handleDownload()}
              disabled={isDownloading()}
              class="download-button confirm"
            >
              <Show when={isDownloading()} fallback="💾">
                ⏳
              </Show>
              Download {downloadFormat().toUpperCase()}
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
};
