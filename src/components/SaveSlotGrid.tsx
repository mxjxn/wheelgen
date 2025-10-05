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

  // Get autosave slot (slot 1)
  const autosaveSlot = () => slots().find(slot => slot.id === 1);
  
  // Get manual save slots (slots 2-9 with data)
  const savedSlots = () => slots().filter(slot => slot.timestamp > 0 && slot.id !== 1);
  
  // Get next available slot ID for "Save New" (excluding slot 1)
  const getNextAvailableSlotId = () => {
    const usedIds = savedSlots().map(slot => slot.id);
    for (let i = 2; i <= 9; i++) {
      if (!usedIds.includes(i)) {
        return i;
      }
    }
    return null; // All slots are used
  };

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
      
      const success = saveSlotService.saveToSlot(slotId, state, p, thumbnail);
      if (success) {
        // Update slots
        setSlots(saveSlotService.getAllSlots());
      } else {
      }
    } catch (error) {
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
      } else {
      }
    } catch (error) {
    } finally {
      setLoadingSlot(null);
    }
  };

  const handleSaveNew = async () => {
    const nextSlotId = getNextAvailableSlotId();
    if (nextSlotId) {
      await handleSave(nextSlotId);
    } else {
      alert('All 8 save slots are already used. Please clear a slot first.');
    }
  };

  const handleClear = (slotId: number) => {
    if (confirm(`Remove slot ${slotId} from the list? This cannot be undone.`)) {
      saveSlotService.clearSlot(slotId);
      setSlots(saveSlotService.getAllSlots());
    }
  };

  const handleClearAll = () => {
    const savedSlots = slots().filter(slot => slot.timestamp > 0 && slot.id !== 1);
    if (savedSlots.length === 0) {
      alert('No saved slots to clear.');
      return;
    }
    
    if (confirm(`Clear all ${savedSlots.length} saved slots? This cannot be undone.`)) {
      savedSlots.forEach(slot => saveSlotService.clearSlot(slot.id));
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
      <div class="section-header">
        <h3 class="section-title">
          Save Slots ({savedSlots().length}/8 saved)
        </h3>
        <div class="section-subtitle">
          Slot 1 is reserved for autosave
        </div>
        <div class="header-actions">
          <button
            class="save-new-btn"
            onClick={handleSaveNew}
            disabled={savingSlot() !== null || getNextAvailableSlotId() === null}
            title="Save current artwork to a new slot"
          >
            Save New
          </button>
          <button
            class="clear-all-btn"
            onClick={handleClearAll}
            disabled={savedSlots().length === 0}
            title="Remove all saved slots"
          >
            Clear All Saved
          </button>
        </div>
      </div>
      
      {/* Autosave Slot */}
      <div class="autosave-section">
        <h4 class="autosave-title">🔄 Autosave</h4>
        <div class="slot-grid autosave-grid">
          <div class="slot-container autosave-container">
            <div 
              class={`slot autosave-slot ${autosaveSlot()?.timestamp > 0 ? 'has-data' : 'empty'}`}
              onClick={() => autosaveSlot()?.timestamp > 0 && handleLoad(1)}
            >
              <div class="slot-thumbnail">
                {autosaveSlot()?.thumbnail ? (
                  <img src={autosaveSlot()!.thumbnail} alt="Autosave" />
                ) : (
                  <div class="thumbnail-placeholder">🔄</div>
                )}
              </div>
              
              <div class="slot-info">
                <div class="slot-name">Autosave</div>
                <div class="slot-date">{formatDate(autosaveSlot()?.timestamp || 0)}</div>
              </div>
              
              {savingSlot() === 1 && (
                <div class="slot-indicator saving">💾</div>
              )}
              {loadingSlot() === 1 && (
                <div class="slot-indicator loading">⏳</div>
              )}
            </div>
            
            <div class="slot-actions">
              <button
                class="slot-btn load-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (autosaveSlot()?.timestamp > 0) {
                    handleLoad(1);
                  }
                }}
                disabled={!autosaveSlot()?.timestamp || loadingSlot() !== null}
                title="Load autosave"
              >
                Load
              </button>
              
              <button
                class="slot-btn clear-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear(1);
                }}
                disabled={savingSlot() !== null}
                title="Clear autosave"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Manual Save Slots */}
      <div class="manual-save-section">
        <h4 class="manual-save-title">💾 Manual Saves</h4>
        <div class="slot-grid">
          <For each={savedSlots()}>
            {(slot) => (
              <div class="slot-container">
                {/* Main slot button - thumbnail takes up whole area */}
                <div 
                  class="slot has-data"
                  onClick={() => handleLoad(slot.id)}
                >
                  {/* Thumbnail or placeholder - fills entire slot */}
                  <div class="slot-thumbnail">
                    {slot.thumbnail ? (
                      <img src={slot.thumbnail} alt={`Slot ${slot.id}`} />
                    ) : (
                      <div class="thumbnail-placeholder">📁</div>
                    )}
                  </div>

                  {/* Slot info overlay */}
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

                {/* Action buttons below slot */}
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
                    Save
                  </button>
                  
                  <button
                    class="slot-btn clear-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear(slot.id);
                    }}
                    disabled={savingSlot() !== null}
                    title="Remove slot from list"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </For>
          
          {/* Show message when no slots are saved */}
          {savedSlots().length === 0 && (
            <div class="no-slots-message">
              <div class="no-slots-icon">📄</div>
              <div class="no-slots-text">No manual saves yet</div>
              <div class="no-slots-subtext">Click "Save New" to create your first save slot</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
