import { Component, createEffect, createSignal, createMemo } from 'solid-js';
import { performanceMetrics, isRendering, lastRenderTime, queueSize } from '../core/deferred-render';

interface PerformanceMonitorProps {
  showDetails?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PerformanceMonitor: Component<PerformanceMonitorProps> = (props) => {
  const [showDetails, setShowDetails] = createSignal(props.showDetails || false);
  const [isVisible, setIsVisible] = createSignal(true);
  
  // Get performance metrics
  const metrics = createMemo(() => performanceMetrics());
  
  // Performance status color
  const getStatusColor = (renderTime: number) => {
    if (renderTime < 16) return '#4ade80'; // Green - good
    if (renderTime < 33) return '#fbbf24'; // Yellow - acceptable
    return '#ef4444'; // Red - slow
  };
  
  // Performance status text
  const getStatusText = (renderTime: number) => {
    if (renderTime < 16) return 'Fast';
    if (renderTime < 33) return 'OK';
    return 'Slow';
  };
  
  return (
    <div 
      class="performance-monitor"
      classList={{
        'top-left': props.position === 'top-left',
        'top-right': props.position === 'top-right',
        'bottom-left': props.position === 'bottom-left',
        'bottom-right': props.position === 'bottom-right'
      }}
    >
      {/* Main Status Indicator */}
      <div class="performance-status">
        <div 
          class="status-indicator"
          classList={{ 
            rendering: isRendering(),
            'has-queue': queueSize() > 0
          }}
          title={`${getStatusText(lastRenderTime())} - ${lastRenderTime().toFixed(1)}ms`}
        >
          {isRendering() ? '🔄' : queueSize() > 0 ? '⏳' : '✅'}
        </div>
        
        <div class="status-text">
          <span class="render-time" style={`color: ${getStatusColor(lastRenderTime())}`}>
            {lastRenderTime().toFixed(1)}ms
          </span>
          {queueSize() > 0 && (
            <span class="queue-count">
              +{queueSize()}
            </span>
          )}
        </div>
      </div>
      
      {/* Detailed Metrics (collapsible) */}
      <Show when={showDetails()}>
        <div class="performance-details">
          <div class="metric">
            <span class="metric-label">Avg:</span>
            <span class="metric-value">{metrics().averageRenderTime.toFixed(1)}ms</span>
          </div>
          
          <div class="metric">
            <span class="metric-label">Total:</span>
            <span class="metric-value">{metrics().totalRenders}</span>
          </div>
          
          <div class="metric">
            <span class="metric-label">Slow:</span>
            <span class="metric-value" style={`color: ${metrics().slowRenders > 0 ? '#ef4444' : '#4ade80'}`}>
              {metrics().slowRenders}
            </span>
          </div>
          
          <div class="metric">
            <span class="metric-label">Queue:</span>
            <span class="metric-value">{metrics().queueSize}</span>
          </div>
        </div>
      </Show>
      
      {/* Toggle Button */}
      <button 
        class="toggle-details"
        onClick={() => setShowDetails(!showDetails())}
        title={showDetails() ? 'Hide details' : 'Show details'}
      >
        {showDetails() ? '▲' : '▼'}
      </button>
      
      {/* Hide/Show Button */}
      <button 
        class="toggle-visibility"
        onClick={() => setIsVisible(!isVisible())}
        title={isVisible() ? 'Hide monitor' : 'Show monitor'}
      >
        {isVisible() ? '−' : '+'}
      </button>
    </div>
  );
};

// Mini performance indicator for corner display
export const MiniPerformanceIndicator: Component<{ position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }> = (props) => {
  const metrics = createMemo(() => performanceMetrics());
  
  const getIndicatorColor = (renderTime: number) => {
    if (renderTime < 16) return '#4ade80';
    if (renderTime < 33) return '#fbbf24';
    return '#ef4444';
  };
  
  return (
    <div 
      class="mini-performance-indicator"
      classList={{
        'top-left': props.position === 'top-left',
        'top-right': props.position === 'top-right',
        'bottom-left': props.position === 'bottom-left',
        'bottom-right': props.position === 'bottom-right'
      }}
      title={`Render: ${lastRenderTime().toFixed(1)}ms | Queue: ${queueSize()} | Status: ${isRendering() ? 'Rendering' : 'Idle'}`}
    >
      <div 
        class="indicator-dot"
        style={`background-color: ${getIndicatorColor(lastRenderTime())}`}
      />
      <span class="render-time">{lastRenderTime().toFixed(0)}ms</span>
    </div>
  );
};
