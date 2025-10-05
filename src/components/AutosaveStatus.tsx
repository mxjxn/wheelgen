import { createSignal, createEffect, Show } from 'solid-js';
import { hasChanges, getAutosaveInfo } from '../store/artwork';

export function AutosaveStatus() {
  const [lastSaveTime, setLastSaveTime] = createSignal<number>(0);
  const [isSaving, setIsSaving] = createSignal(false);

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

  const getStatusText = () => {
    if (isSaving()) return 'Saving...';
    if (hasChanges()) return 'Unsaved changes';
    if (lastSaveTime() > 0) return 'All changes saved';
    return 'Ready';
  };

  const getStatusIcon = () => {
    if (isSaving()) return '⏳';
    if (hasChanges()) return '⚠️';
    if (lastSaveTime() > 0) return '✅';
    return '💾';
  };

  const getStatusClass = () => {
    if (isSaving()) return 'status-saving';
    if (hasChanges()) return 'status-unsaved';
    if (lastSaveTime() > 0) return 'status-saved';
    return 'status-ready';
  };

  return (
    <div class={`autosave-status ${getStatusClass()}`}>
      <span class="status-icon">{getStatusIcon()}</span>
      <span class="status-text">{getStatusText()}</span>
      <Show when={lastSaveTime() > 0 && !isSaving()}>
        <span class="status-time">
          {new Date(lastSaveTime()).toLocaleTimeString()}
        </span>
      </Show>
    </div>
  );
}
