import { Component, createSignal, Show } from 'solid-js';
import type p5 from 'p5';
import { DownloadService, DownloadOptions } from '../core/download-service';

interface DownloadTabProps {
  getP: () => p5 | null;
  requestRedraw: () => void;
}

export const DownloadTab: Component<DownloadTabProps> = (props) => {
  console.log('DownloadTab rendered');
  const [isDownloading, setIsDownloading] = createSignal(false);
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
        addTimestamp: !customFilename(),
        cropMode: cropMode(),
        squareSize: cropMode() === 'square' ? squareSize() : undefined,
        ...options
      };

      const success = DownloadService.downloadArtwork(p, downloadOptions);
      
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div class="download-tab">
      <div class="download-options-panel">
        <div class="options-content">
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

          <Show when={downloadFormat() === 'jpeg'}>
            <div class="option-group">
              <label>Quality: {Math.round(jpegQuality() * 100)}%</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={jpegQuality()}
                onInput={(e) => setJpegQuality(parseFloat(e.target.value))}
              />
            </div>
          </Show>

          <div class="option-group">
            <label>Filename:</label>
            <input
              type="text"
              value={customFilename()}
              onInput={(e) => setCustomFilename(e.target.value)}
              placeholder="e.g., MyAwesomeArt"
            />
          </div>

          <div class="info-section">
            <div class="info-row">
              <span>Canvas Size:</span>
              <span>{props.getP()?.width}x{props.getP()?.height}px</span>
            </div>
            <div class="info-row">
              <span>Estimated File Size:</span>
              <span>{DownloadService.estimateFileSize(props.getP(), { format: downloadFormat(), quality: jpegQuality(), cropMode: cropMode(), squareSize: squareSize() })}</span>
            </div>
          </div>

          <button
            onClick={() => handleDownload()}
            disabled={isDownloading()}
            class="action-button primary"
          >
            {isDownloading() ? 'Downloading...' : 'Download Artwork'}
          </button>
        </div>
      </div>
    </div>
  );
};