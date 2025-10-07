import { Component, createSignal, createEffect, createMemo, Show } from 'solid-js';
import { hasChanges, getAutosaveInfo } from '../store/artwork';
import { performanceMetrics, isRendering, lastRenderTime, queueSize } from '../core/deferred-render';

interface StatusChipProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const StatusChips: Component<StatusChipProps> = (props) => {
  const [lastSaveTime, setLastSaveTime] = createSignal<number>(0);
  const [isSaving, setIsSaving] = createSignal(false);
  
  // Get performance metrics
  const metrics = createMemo(() => performanceMetrics());
  
  // Save status tracking
  createEffect(() => {
    const info = getAutosaveInfo();
    setLastSaveTime(info.lastSave);
  });

  // Simulate saving state when changes occur
  createEffect(() => {
    if (hasChanges()) {
      setIsSaving(true);
      // Clear saving state after a delay
      setTimeout(() => setIsSaving(false), 2000);
    }
  });

  // Save status helpers
  const getSaveStatus = () => {
    if (isSaving()) return { text: 'Saving...', icon: '⏳', color: '#f59e0b' };
    if (hasChanges()) return { text: 'Unsaved', icon: '⚠️', color: '#ef4444' };
    if (lastSaveTime() > 0) return { text: 'Saved', icon: '✅', color: '#4ade80' };
    return { text: 'Ready', icon: '💾', color: '#6b7280' };
  };

  // Render status helpers
  const getRenderStatus = () => {
    if (isRendering()) return { text: 'Rendering', icon: '🔄', color: '#3b82f6' };
    if (queueSize() > 0) return { text: `${queueSize()} queued`, icon: '⏳', color: '#f59e0b' };
    return { text: 'Idle', icon: '✅', color: '#4ade80' };
  };

  // Performance status helpers
  const getPerformanceStatus = () => {
    const renderTime = lastRenderTime();
    if (renderTime < 16) return { text: `${renderTime.toFixed(0)}ms`, color: '#4ade80' };
    if (renderTime < 33) return { text: `${renderTime.toFixed(0)}ms`, color: '#f59e0b' };
    return { text: `${renderTime.toFixed(0)}ms`, color: '#ef4444' };
  };

  return (
    <div 
      class="status-chips"
      classList={{
        'top-left': props.position === 'top-left',
        'top-right': props.position === 'top-right',
        'bottom-left': props.position === 'bottom-left',
        'bottom-right': props.position === 'bottom-right'
      }}
    >
      {/* Save Status Chip */}
      <div class="status-chip save-chip" style={`border-color: ${getSaveStatus().color}`}>
        <span class="chip-icon">{getSaveStatus().icon}</span>
        <span class="chip-text">{getSaveStatus().text}</span>
        <Show when={lastSaveTime() > 0 && !isSaving()}>
          <span class="chip-time">
            {new Date(lastSaveTime()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </Show>
      </div>

      {/* Render Status Chip */}
      <div class="status-chip render-chip" style={`border-color: ${getRenderStatus().color}`}>
        <span class="chip-icon">{getRenderStatus().icon}</span>
        <span class="chip-text">{getRenderStatus().text}</span>
        <Show when={isRendering()}>
          <div class="chip-spinner"></div>
        </Show>
      </div>

      {/* Performance Chip */}
      <div class="status-chip perf-chip" style={`border-color: ${getPerformanceStatus().color}`}>
        <span class="chip-icon">⚡</span>
        <span class="chip-text">{getPerformanceStatus().text}</span>
        <Show when={metrics().slowRenders > 0}>
          <span class="chip-warning">⚠</span>
        </Show>
      </div>
    </div>
  );
};

// Individual chip components for more granular control
export const SaveStatusChip: Component = () => {
  const [lastSaveTime, setLastSaveTime] = createSignal<number>(0);
  const [isSaving, setIsSaving] = createSignal(false);
  
  createEffect(() => {
    const info = getAutosaveInfo();
    setLastSaveTime(info.lastSave);
  });

  createEffect(() => {
    if (hasChanges()) {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 2000);
    }
  });

  const getStatus = () => {
    if (isSaving()) return { text: 'Saving...', icon: '⏳', color: '#f59e0b' };
    if (hasChanges()) return { text: 'Unsaved', icon: '⚠️', color: '#ef4444' };
    if (lastSaveTime() > 0) return { text: 'Saved', icon: '✅', color: '#4ade80' };
    return { text: 'Ready', icon: '💾', color: '#6b7280' };
  };

  const status = getStatus();

  return (
    <div class="status-chip save-chip" style={`border-color: ${status.color}`}>
      <span class="chip-icon">{status.icon}</span>
      <span class="chip-text">{status.text}</span>
      <Show when={lastSaveTime() > 0 && !isSaving()}>
        <span class="chip-time">
          {new Date(lastSaveTime()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </Show>
    </div>
  );
};

export const RenderStatusChip: Component = () => {
  const metrics = createMemo(() => performanceMetrics());
  
  const getStatus = () => {
    if (isRendering()) return { text: 'Rendering', icon: '🔄', color: '#3b82f6' };
    if (queueSize() > 0) return { text: `${queueSize()} queued`, icon: '⏳', color: '#f59e0b' };
    return { text: 'Idle', icon: '✅', color: '#4ade80' };
  };

  const status = getStatus();

  return (
    <div class="status-chip render-chip" style={`border-color: ${status.color}`}>
      <span class="chip-icon">{status.icon}</span>
      <span class="chip-text">{status.text}</span>
      <Show when={isRendering()}>
        <div class="chip-spinner"></div>
      </Show>
    </div>
  );
};

export const PerformanceChip: Component = () => {
  const metrics = createMemo(() => performanceMetrics());
  
  const getStatus = () => {
    const renderTime = lastRenderTime();
    if (renderTime < 16) return { text: `${renderTime.toFixed(0)}ms`, color: '#4ade80' };
    if (renderTime < 33) return { text: `${renderTime.toFixed(0)}ms`, color: '#f59e0b' };
    return { text: `${renderTime.toFixed(0)}ms`, color: '#ef4444' };
  };

  const status = getStatus();

  return (
    <div class="status-chip perf-chip" style={`border-color: ${status.color}`}>
      <span class="chip-icon">⚡</span>
      <span class="chip-text">{status.text}</span>
      <Show when={metrics().slowRenders > 0}>
        <span class="chip-warning">⚠</span>
      </Show>
    </div>
  );
};

