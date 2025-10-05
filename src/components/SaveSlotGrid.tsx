import { Component, createSignal, createEffect, For } from 'solid-js';
import { saveSlotService, type SaveSlot } from '../store/saveSlots';
import { ArtworkState } from '../store/artwork';
import type p5 from 'p5';

interface SaveSlotGridProps {
  getP: () => p5;
  getCurrentState: () => ArtworkState;
  onLoad: (state: Partial<ArtworkState>) => void;
}

export const SaveSlotGrid: Component<SaveSlotGridProps> = (props) => {
  const [slots, setSlots] = createSignal<SaveSlot[]>([]);
  const [savingSlot, setSavingSlot] = createSignal<number | null>(null);
  const [loadingSlot, setLoadingSlot] = createSignal<number | null>(null);

  // Load slots on mount
  createEffect(() => {
    setSlots(saveSlotService.getAllSlots());
  });

  const handleSave = async (slotId: number) => {
    setSavingSlot(slotId);
    
    try {
      const p = props.getP();
      const state = props.getCurrentState();
      
      // Generate thumbnail if p5 canvas is available
      let thumbnail = '';
      if (p && p.canvas) {
        thumbnail = saveSlotService.generateThumbnail(p.canvas as HTMLCanvasElement);
      }
      
      const success = saveSlotService.saveToSlot(slotId, state, thumbnail);
      if (success) {
        // Update slots
        setSlots(saveSlotService.getAllSlots());
        console.log(`✅ Saved to slot ${slotId}`);
      } else {
        console.error(`❌ Failed to save to slot ${slotId}`);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSavingSlot(null);
    }
  };

  const handleLoad = async (slotId: number) => {
    setLoadingSlot(slotId);
    
    try {
      const p = props.getP();
      const savedState = saveSlotService.loadFromSlot(slotId, p);
      
      if (savedState) {
        props.onLoad(savedState);
        console.log(`✅ Loaded from slot ${slotId}`);
      } else {
        console.error(`❌ No data in slot ${slotId}`);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoadingSlot(null);
    }
  };

  const handleClear = (slotId: number) => {
    if (confirm(`Clear slot ${slotId}? This cannot be undone.`)) {
      saveSlotService.clearSlot(slotId);
      setSlots(saveSlotService.getAllSlots());
    }
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5);
  };

  return (
    <div class="save-slot-grid">
      <h3 class="section-title">Save Slots</h3>
      <div class="slot-grid">
        <For each={slots()}>
          {(slot) => (
            <div class="slot-container">
              <div 
                class={`slot ${slot.timestamp > 0 ? 'has-data' : 'empty'}`}
                onClick={() => slot.timestamp > 0 ? handleLoad(slot.id) : null}
              >
                {/* Thumbnail or placeholder */}
                <div class="slot-thumbnail">
                  {slot.thumbnail ? (
                    <img src={slot.thumbnail} alt={`Slot ${slot.id}`} />
                  ) : slot.timestamp > 0 ? (
                    <div class="thumbnail-placeholder">📁</div>
                  ) : (
                    <div class="thumbnail-placeholder">📄</div>
                  )}
                </div>

                {/* Slot info */}
                <div class="slot-info">
                  <div class="slot-name">{slot.name}</div>
                  <div class="slot-date">{formatDate(slot.timestamp)}</div>
                </div>

                {/* Loading/Saving indicators */}
                {savingSlot() === slot.id && (
                  <div class="slot-indicator saving">💾</div>
                )}
                {loadingSlot() === slot.id && (
                  <div class="slot-indicator loading">⏳</div>
                )}
              </div>

              {/* Slot actions */}
              <div class="slot-actions">
                <button
                  class="slot-btn save-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave(slot.id);
                  }}
                  disabled={savingSlot() !== null}
                  title="Save current artwork"
                >
                  💾
                </button>
                
                {slot.timestamp > 0 && (
                  <button
                    class="slot-btn clear-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear(slot.id);
                    }}
                    disabled={savingSlot() !== null}
                    title="Clear slot"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
