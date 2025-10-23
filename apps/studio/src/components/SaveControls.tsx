import { Component, createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import '../styles/components/save-controls.css';
import { 
  hasChanges, 
  setHasChanges,
  clearChanges, 
  setNewPalette, 
  guidesVisible, 
  setGuidesVisible,
  globals,
  updateGlobalSetting,
  rings,
  palette,
  innerDot,
  backgroundColor,
  colorLock,
  setRings,
  setPalette,
  setInnerDot,
  setGlobals,
  setBackgroundColor,
  setColorLock,
  setGuidesVisible as setGuidesVisibleState
} from '../store/artwork';
import { SaveSlotGrid } from './SaveSlotGrid';
import type { Ring } from '../model/ring';

// Props interface
interface SaveControlsProps {
  getP: () => any; // p5 instance
  requestRedraw: () => void;
}

export const SaveControls: Component<SaveControlsProps> = (props) => {
  // Reactive values from store
  const [randomness, setRandomness] = createSignal(globals().randomness);
  const [strokeCount, setStrokeCount] = createSignal(globals().strokeCount);
  const [colorBleed, setColorBleed] = createSignal(globals().colorBleed);
  const [globalStrokeWidth, setGlobalStrokeWidth] = createSignal(globals().globalStrokeWidth);
  

  // Auto-rerender system
  const [countdown, setCountdown] = createSignal(0.8);
  const [isAutoRendering, setIsAutoRendering] = createSignal(true);
  let intervalId: ReturnType<typeof setInterval> | undefined;

  // Update local signals when store changes
  createEffect(() => {
    const currentGlobals = globals();
    setRandomness(currentGlobals.randomness);
    setStrokeCount(currentGlobals.strokeCount);
    setColorBleed(currentGlobals.colorBleed);
    setGlobalStrokeWidth(currentGlobals.globalStrokeWidth);
  });

  // Auto-rerender timer
  onMount(() => {
    const startTimer = () => {
      intervalId = setInterval(() => {
        setCountdown(prev => {
          const newCount = prev - 0.1;
          if (newCount <= 0) {
            // Time to rerender
            performRerender();
            return 0.8; // Reset countdown
          }
          return newCount;
        });
      }, 100);
    };

    startTimer();
  });

  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  // Handlers
  const performRerender = () => {
    if (hasChanges()) {
      // Update all particles' stroke data before redrawing
      const p = props.getP();
      if (p) {
        // Get current rings and update their particles
        const currentRings = rings();
        currentRings.forEach((ring: Ring) => {
          if (!ring.isSolidRing) {
            ring.updateParticles(p);
          }
        });
      }
      clearChanges();
      props.requestRedraw();
    }
  };

  const toggleAutoRendering = () => {
    setIsAutoRendering(!isAutoRendering());
    if (isAutoRendering()) {
      // Pausing - clear interval
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    } else {
      // Resuming - restart timer
      intervalId = setInterval(() => {
        setCountdown(prev => {
          const newCount = prev - 0.1;
          if (newCount <= 0) {
            performRerender();
            return 0.8;
          }
          return newCount;
        });
      }, 100);
    }
  };

  const manualRerender = () => {
    performRerender();
    setCountdown(0.8); // Reset countdown
  };

  const handleNewPalette = () => {
    const p = props.getP();
    if (p) {
      setNewPalette(p);
    }
  };


  const handleGuidesToggle = (checked: boolean) => {
    setGuidesVisible(checked);
    props.requestRedraw();
  };

  const handleRandomnessChange = (value: number) => {
    setRandomness(value);
    updateGlobalSetting('randomness', value);
  };

  const handleStrokeCountChange = (value: number) => {
    setStrokeCount(value);
    updateGlobalSetting('strokeCount', value);
  };

  const handleColorBleedChange = (value: number) => {
    setColorBleed(value);
    updateGlobalSetting('colorBleed', value);
  };

  const handleGlobalStrokeWidthChange = (value: number) => {
    setGlobalStrokeWidth(value);
    updateGlobalSetting('globalStrokeWidth', value);
  };

  // Get current artwork state for save slots
  const getCurrentArtworkState = () => ({
    rings: rings(),
    palette: palette(),
    innerDot: innerDot(),
    globals: globals(),
    guidesVisible: guidesVisible(),
    backgroundColor: backgroundColor(),
    colorLock: colorLock(),
    hasChanges: hasChanges()
  });

  // Handle loading from save slot
  const handleLoadFromSlot = (savedState: any) => {
    // Set palette FIRST so rings can access it when they're loaded
    if (savedState.palette) setPalette(savedState.palette);
    if (savedState.backgroundColor) setBackgroundColor(savedState.backgroundColor);
    if (savedState.colorLock) setColorLock(savedState.colorLock);
    if (savedState.globals) setGlobals(savedState.globals);
    if (savedState.guidesVisible !== undefined) setGuidesVisibleState(savedState.guidesVisible);
    
    // Set rings AFTER palette is available
    if (savedState.rings) setRings(savedState.rings);
    if (savedState.innerDot) setInnerDot(savedState.innerDot);
    
    // Update particles to use the new palette
    const p = props.getP();
    if (p && savedState.rings) {
      const currentRings = rings();
      currentRings.forEach(ring => {
        if (!ring.isSolidRing) {
          ring.updateParticles(p);
        }
      });
    }
    
    // Update local signals
    if (savedState.globals) {
      setRandomness(savedState.globals.randomness);
      setStrokeCount(savedState.globals.strokeCount);
      setColorBleed(savedState.globals.colorBleed);
      setGlobalStrokeWidth(savedState.globals.globalStrokeWidth || 0);
    }
    
    // Trigger redraw
    props.requestRedraw();
  };

  return (
    <div class="save-controls">
      {/* Save Slot Grid */}
      <SaveSlotGrid 
        getP={() => props.getP()}
        getCurrentState={getCurrentArtworkState}
        onLoad={handleLoadFromSlot}
      />

      {/* Manual Render Controls */}
      <div class="manual-render-section">
        <div class="render-controls">
          <button
            onClick={toggleAutoRendering}
            class={`toggle-button ${isAutoRendering() ? 'paused' : 'running'}`}
            title={isAutoRendering() ? 'Pause auto-rerender' : 'Resume auto-rerender'}
          >
            {isAutoRendering() ? '⏸️' : '▶️'}
          </button>
          
          <button
            onClick={manualRerender}
            class="manual-rerender-btn"
            title="Render now"
          >
            🔄
          </button>
        </div>
      </div>

      {/* New Palette Button */}
      <button
        onClick={handleNewPalette}
        class="action-button"
      >
        New Palette
      </button>



      {/* Show Guides Checkbox */}
      <label class="guides-checkbox">
        <input
          type="checkbox"
          checked={guidesVisible()}
          onChange={(e) => handleGuidesToggle(e.currentTarget.checked)}
        />
        Show Guides
      </label>

      {/* Global Randomness Control */}
      <div class="control-section">
        <label class="control-label">
          Randomness: {randomness().toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="0.35"
          step="0.01"
          value={randomness()}
          onChange={(e) => handleRandomnessChange(Number(e.currentTarget.value))}
          class="control-range"
        />
      </div>

      {/* Global Stroke Count Control */}
      <div class="control-section">
        <label class="control-label">
          Stroke Count: {strokeCount()}
        </label>
        <input
          type="range"
          min="6"
          max="50"
          step="1"
          value={strokeCount()}
          onChange={(e) => handleStrokeCountChange(Number(e.currentTarget.value))}
          class="control-range"
        />
      </div>

      {/* Global Color Bleed Control */}
      <div class="control-section">
        <label class="control-label">
          Color Bleed: {colorBleed().toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={colorBleed()}
          onChange={(e) => handleColorBleedChange(Number(e.currentTarget.value))}
          class="control-range"
        />
      </div>

      {/* Global Stroke Width Control */}
      <div class="control-section">
        <label class="control-label">
          Global Stroke Width: {globalStrokeWidth().toFixed(1)}
        </label>
        <input
          type="range"
          min="-5"
          max="35"
          step="0.1"
          value={globalStrokeWidth()}
          onChange={(e) => handleGlobalStrokeWidthChange(Number(e.currentTarget.value))}
          class="control-range"
        />
        <div class="control-description">
          <small>Adds/subtracts from all stroke widths</small>
        </div>
      </div>
    </div>
  );
};
