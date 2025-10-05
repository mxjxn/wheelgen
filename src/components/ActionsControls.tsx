import { Component, createEffect, createSignal, onMount, onCleanup } from 'solid-js';
import { 
  hasChanges, 
  clearChanges, 
  setNewPalette, 
  randomizeArtwork, 
  guidesVisible, 
  setGuidesVisible,
  globals,
  updateGlobalSetting,
  rings,
  palette,
  innerDot,
  setRings,
  setPalette,
  setInnerDot,
  setGlobals,
  setGuidesVisible as setGuidesVisibleState
} from '../store/artwork';
import { SaveSlotGrid } from './SaveSlotGrid';
import type { Ring } from '../model/ring';

// Props interface
interface ActionsControlsProps {
  getP: () => any; // p5 instance
  requestRedraw: () => void;
}

export const ActionsControls: Component<ActionsControlsProps> = (props) => {
  // Reactive values from store
  const [randomness, setRandomness] = createSignal(globals().randomness);
  const [strokeCount, setStrokeCount] = createSignal(globals().strokeCount);
  const [colorBleed, setColorBleed] = createSignal(globals().colorBleed);

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

  const handleRandomize = () => {
    const p = props.getP();
    if (p) {
      randomizeArtwork(p);
      // Trigger a redraw to show the randomized artwork
      props.requestRedraw();
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

  // Get current artwork state for save slots
  const getCurrentArtworkState = () => ({
    rings: rings(),
    palette: palette(),
    innerDot: innerDot(),
    globals: globals(),
    guidesVisible: guidesVisible(),
    hasChanges: hasChanges()
  });

  // Handle loading from save slot
  const handleLoadFromSlot = (savedState: any) => {
    if (savedState.rings) setRings(savedState.rings);
    if (savedState.palette) setPalette(savedState.palette);
    if (savedState.innerDot) setInnerDot(savedState.innerDot);
    if (savedState.globals) setGlobals(savedState.globals);
    if (savedState.guidesVisible !== undefined) setGuidesVisibleState(savedState.guidesVisible);
    
    // Update local signals
    if (savedState.globals) {
      setRandomness(savedState.globals.randomness);
      setStrokeCount(savedState.globals.strokeCount);
      setColorBleed(savedState.globals.colorBleed);
    }
    
    // Trigger redraw
    props.requestRedraw();
  };

  return (
    <div class="ring-control">
      <h3 class="section-title">Actions</h3>
      
      {/* Save Slot Grid */}
      <SaveSlotGrid 
        getP={props.getP}
        getCurrentState={getCurrentArtworkState}
        onLoad={handleLoadFromSlot}
      />
      
      {/* Auto-rerender Controls */}
      <div class="auto-rerender-section">
        <div class="countdown-display">
          <span class="countdown-label">Next render:</span>
          <span class="countdown-timer">{countdown().toFixed(1)}s</span>
          <span class="changes-indicator" classList={{ 'has-changes': hasChanges() }}>
            {hasChanges() ? '●' : '○'}
          </span>
        </div>
        
        <div class="rerender-controls">
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

      {/* Randomize Button */}
      <button
        onClick={handleRandomize}
        class="action-button"
      >
        Randomize
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
    </div>
  );
};
