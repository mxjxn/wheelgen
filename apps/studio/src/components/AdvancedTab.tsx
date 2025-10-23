import { Component, createSignal, onMount, onCleanup, Show } from 'solid-js';
import { getHybridRenderer, RenderingMode } from '../core/hybrid-renderer';
import { AdvancedEditor } from './AdvancedEditor';
import { devMode, toggleDevMode } from '../store/artwork';
import type p5 from 'p5';
import '../styles/components/performance-positioning-controls.css';
import '../styles/components/advanced-editor.css';

interface AdvancedTabProps {
  getP: () => p5 | null;
  requestRedraw: () => void;
}

export const AdvancedTab: Component<AdvancedTabProps> = (props) => {
  const [metrics, setMetrics] = createSignal<any>(null);
  const [renderingMode, setRenderingMode] = createSignal<RenderingMode>('auto');
  const [qualityLevel, setQualityLevel] = createSignal<'fast' | 'balanced' | 'high'>('balanced');
  const [pixelThreshold, setPixelThreshold] = createSignal(100);
  const [showAdvancedEditor, setShowAdvancedEditor] = createSignal(false);

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
    <div class="performance-controls">
      <Show when={devMode()}>
        <div class="performance-header">
          <h3 class="section-title">Performance Monitor</h3>
          <p class="section-description">Monitor rendering performance and configure rendering modes</p>
        </div>
        
        <div class="control-group">
          <label class="control-label">Rendering Mode:</label>
          <select
            value={renderingMode()}
            onChange={(e) => handleModeChange(e.target.value as RenderingMode)}
            class="control-select"
          >
            <option value="auto">Auto</option>
            <option value="pixel">Pixel Only</option>
            <option value="vector">Vector Only</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div class="control-group">
          <label class="control-label">Quality Level:</label>
          <select
            value={qualityLevel()}
            onChange={(e) => handleQualityChange(e.target.value as 'fast' | 'balanced' | 'high')}
            class="control-select"
          >
            <option value="fast">Fast</option>
            <option value="balanced">Balanced</option>
            <option value="high">High Quality</option>
          </select>
        </div>

        <div class="control-group">
          <label class="control-label">Pixel Threshold:</label>
          <input
            type="range"
            min="10"
            max="500"
            value={pixelThreshold()}
            onChange={(e) => handleThresholdChange(parseInt(e.target.value))}
            class="control-range"
          />
          <div class="control-description">
            <small>{pixelThreshold()}</small>
          </div>
        </div>

        <div class="control-buttons">
          <button onClick={resetMetrics} class="control-button">Reset Metrics</button>
          <button onClick={clearCaches} class="control-button">Clear Caches</button>
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
      </Show>

      {/* Advanced Editor Mode */}
      <div class="control-group">
        <div class="advanced-editor-section">
          <h3 class="section-title">Advanced Editor Mode</h3>
          <p class="section-description">
            Use the advanced pattern language to create complex artworks with a single document.
            Define rings, dot properties, and custom patterns using a powerful syntax.
          </p>
          
          <div class="editor-actions">
            <button 
              class="action-btn primary-btn"
              onClick={() => setShowAdvancedEditor(true)}
            >
              Enter Advanced Editor
            </button>
            
            <div class="editor-info">
              <h4>Features:</h4>
              <ul>
                <li>Document-based artwork definition</li>
                <li>Pattern commands: seq(), mir(), space()</li>
                <li>Element count control with :count syntax</li>
                <li>Custom variable definitions</li>
                <li>Real-time syntax validation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Show when={showAdvancedEditor()}>
        <AdvancedEditor
          onClose={() => setShowAdvancedEditor(false)}
          onApply={(document) => {
            console.log('Document applied:', document);
            setShowAdvancedEditor(false);
            props.requestRedraw();
          }}
          p5Instance={props.getP()}
        />
      </Show>

      {/* Dev Mode Toggle */}
      <div class="dev-mode-toggle">
        <button 
          class="dev-mode-button"
          onClick={toggleDevMode}
          title={devMode() ? "Hide dev tools" : "Show dev tools"}
        >
          {devMode() ? "🔧 Hide Dev Tools" : "🔧 Show Dev Tools"}
        </button>
      </div>
    </div>
  );
};