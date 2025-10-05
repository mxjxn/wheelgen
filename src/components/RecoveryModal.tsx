import { createSignal, createEffect, Show } from 'solid-js';
import type p5 from 'p5';
import { hasRecoveryData, loadFromAutosave, clearAutosaveData, getAutosaveInfo } from '../store/artwork';

interface RecoveryModalProps {
  p5Instance: p5;
  onClose: () => void;
}

export function RecoveryModal(props: RecoveryModalProps) {
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleLoadAutosave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const success = loadFromAutosave(props.p5Instance);
      if (success) {
        props.onClose();
      } else {
        setError('Failed to load autosave data');
      }
    } catch (err) {
      setError('Error loading autosave data');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    clearAutosaveData();
    props.onClose();
  };

  const storageInfo = getAutosaveInfo();

  return (
    <div class="recovery-modal-overlay">
      <div class="recovery-modal">
        <div class="recovery-header">
          <h2>🔄 Recover Your Work</h2>
          <p>We found saved progress from a previous session.</p>
        </div>

        <div class="recovery-content">
          <div class="recovery-info">
            <div class="info-item">
              <span class="label">Storage size:</span>
              <span class="value">{(storageInfo.size / 1024).toFixed(1)} KB</span>
            </div>
            <div class="info-item">
              <span class="label">Last saved:</span>
              <span class="value">
                {storageInfo.lastSave > 0 
                  ? new Date(storageInfo.lastSave).toLocaleString()
                  : 'Unknown'
                }
              </span>
            </div>
          </div>

          <Show when={error()}>
            <div class="error-message">
              {error()}
            </div>
          </Show>

          <div class="recovery-actions">
            <button 
              class="btn btn-primary"
              onClick={handleLoadAutosave}
              disabled={loading()}
            >
              {loading() ? 'Loading...' : '📁 Load Latest Save'}
            </button>

            <button 
              class="btn btn-danger"
              onClick={handleDiscard}
              disabled={loading()}
            >
              🗑️ Start Fresh
            </button>
          </div>
        </div>

        <div class="recovery-footer">
          <p class="help-text">
            💡 <strong>Tip:</strong> Your work is automatically saved as you create. 
            You can also manually save using Ctrl+S (Cmd+S on Mac).
          </p>
        </div>
      </div>
    </div>
  );
}

// Recovery hook for App component
export function useRecovery(p5Instance: p5) {
  const [showRecovery, setShowRecovery] = createSignal(false);

  createEffect(() => {
    if (hasRecoveryData()) {
      setShowRecovery(true);
    }
  });

  return {
    showRecovery: showRecovery(),
    closeRecovery: () => setShowRecovery(false)
  };
}
