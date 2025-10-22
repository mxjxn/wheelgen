import { Component, createSignal, onMount, onCleanup, Show } from 'solid-js';
import { getHybridRenderer, RenderingMode } from '../core/hybrid-renderer';
import type p5 from 'p5';

interface PerformanceTabProps {
  getP: () => p5 | null;
  requestRedraw: () => void;
}

export const PerformanceTab: Component<PerformanceTabProps> = (props) => {
  console.log('PerformanceTab rendered');
  const [metrics, setMetrics] = createSignal<any>(null);
  const [renderingMode, setRenderingMode] = createSignal<RenderingMode>('auto');
  const [qualityLevel, setQualityLevel] = createSignal<'fast' | 'balanced' | 'high'>('balanced');
  const [pixelThreshold, setPixelThreshold] = createSignal(100);

  const hybridRenderer = getHybridRenderer();

  onMount(() => {
    const interval = setInterval(() => {
      const currentMetrics = hybridRenderer.getPerformanceMetrics();
      setMetrics(currentMetrics);
    }, 1000); // Update every second

    onCleanup(() => clearInterval(interval));
  });

  const handleModeChange = (mode: RenderingMode) => {
    setRenderingMode(mode);
    hybridRenderer.updateConfig({ mode });
  };

  const handleQualityChange = (quality: 'fast' | 'balanced' | 'high') => {
    setQualityLevel(quality);
    hybridRenderer.updateConfig({ qualityLevel: quality });
  };

  const handleThresholdChange = (threshold: number) => {
    setPixelThreshold(threshold);
    hybridRenderer.updateConfig({ pixelThreshold: threshold });
  };

  const resetMetrics = () => {
    hybridRenderer.resetMetrics();
    setMetrics(null);
  };

  const clearCaches = () => {
    hybridRenderer.clearCaches();
  };

  return (
    <div class="performance-tab">
      <div class="performance-controls">
        <div class="control-group">
          <label>Rendering Mode:</label>
          <select
            value={renderingMode()}
            onChange={(e) => handleModeChange(e.target.value as RenderingMode)}
          >
            <option value="auto">Auto</option>
            <option value="pixel">Pixel Only</option>
            <option value="vector">Vector Only</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div class="control-group">
          <label>Quality Level:</label>
          <select
            value={qualityLevel()}
            onChange={(e) => handleQualityChange(e.target.value as 'fast' | 'balanced' | 'high')}
          >
            <option value="fast">Fast</option>
            <option value="balanced">Balanced</option>
            <option value="high">High Quality</option>
          </select>
        </div>

        <div class="control-group">
          <label>Pixel Threshold:</label>
          <input
            type="range"
            min="10"
            max="500"
            value={pixelThreshold()}
            onChange={(e) => handleThresholdChange(parseInt(e.target.value))}
          />
          <span>{pixelThreshold()}</span>
        </div>

        <div class="control-buttons">
          <button onClick={resetMetrics}>Reset Metrics</button>
          <button onClick={clearCaches}>Clear Caches</button>
        </div>
      </div>

      <Show when={metrics()}>
        <div class="performance-metrics">
          <div class="metrics-section">
            <h4>Render Statistics</h4>
            <div class="metric-row">
              <span>Total Particles:</span>
              <span>{metrics()!.totalParticles}</span>
            </div>
            <div class="metric-row">
              <span>Pixel Renders:</span>
              <span>{metrics()!.pixelRenderCount}</span>
            </div>
            <div class="metric-row">
              <span>Vector Renders:</span>
              <span>{metrics()!.vectorRenderCount}</span>
            </div>
            <div class="metric-row">
              <span>Pixel Render %:</span>
              <span>{metrics()!.pixelRenderPercentage.toFixed(1)}%</span>
            </div>
          </div>

          <div class="metrics-section">
            <h4>Performance</h4>
            <div class="metric-row">
              <span>Avg Pixel Time:</span>
              <span>{metrics()!.averagePixelRenderTime.toFixed(2)}ms</span>
            </div>
            <div class="metric-row">
              <span>Avg Vector Time:</span>
              <span>{metrics()!.averageVectorRenderTime.toFixed(2)}ms</span>
            </div>
            <div class="metric-row">
              <span>Total Pixel Time:</span>
              <span>{metrics()!.pixelRenderTime.toFixed(2)}ms</span>
            </div>
            <div class="metric-row">
              <span>Total Vector Time:</span>
              <span>{metrics()!.vectorRenderTime.toFixed(2)}ms</span>
            </div>
          </div>

          <div class="metrics-section">
            <h4>Cache Statistics</h4>
            <div class="metric-row">
              <span>Cache Size:</span>
              <span>{metrics()!.cacheStats.size}</span>
            </div>
            <div class="metric-row">
              <span>Cache Hits:</span>
              <span>{metrics()!.cacheStats.hits}</span>
            </div>
            <div class="metric-row">
              <span>Cache Misses:</span>
              <span>{metrics()!.cacheStats.misses}</span>
            </div>
            <div class="metric-row">
              <span>Hit Rate:</span>
              <span>{(metrics()!.cacheStats.hitRate * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div class="metrics-section">
            <h4>Performance Analysis</h4>
            <div class="analysis">
              <Show when={metrics()!.pixelRenderPercentage > 80}>
                <div class="analysis-item success">
                  ✓ High pixel rendering usage - good for performance
                </div>
              </Show>
              <Show when={metrics()!.cacheStats.hitRate > 0.7}>
                <div class="analysis-item success">
                  ✓ Good cache hit rate - textures are being reused
                </div>
              </Show>
              <Show when={metrics()!.averagePixelRenderTime < metrics()!.averageVectorRenderTime}>
                <div class="analysis-item success">
                  ✓ Pixel rendering is faster than vector rendering
                </div>
              </Show>
              <Show when={metrics()!.totalParticles > 1000}>
                <div class="analysis-item warning">
                  ⚠ High particle count - consider optimizing artwork complexity
                </div>
              </Show>
              <Show when={metrics()!.cacheStats.hitRate < 0.3}>
                <div class="analysis-item warning">
                  ⚠ Low cache hit rate - many unique textures being generated
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};