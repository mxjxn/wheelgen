import { Component, createEffect, createSignal, onMount, onCleanup } from 'solid-js';
import { 
  hasChanges, 
  setHasChanges,
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
import { runQuickColorDiagnostic } from '../core/color-diagnostic';
import { runSimpleColorTest } from '../core/simple-color-test';
import { SimpleColorTest } from './SimpleColorTest';
import { generateDirectRgbPalette } from '../core/color';

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
  const [globalStrokeWidth, setGlobalStrokeWidth] = createSignal(globals().globalStrokeWidth);
  
  // Inner dot controls
  const [innerDotVisible, setInnerDotVisible] = createSignal(innerDot().visible);
  const [innerDotRadius, setInnerDotRadius] = createSignal(innerDot().radius);
  const [innerDotColor1Index, setInnerDotColor1Index] = createSignal(innerDot().color1Index);
  const [innerDotColor2Index, setInnerDotColor2Index] = createSignal(innerDot().color2Index);
  const [innerDotGradientStop, setInnerDotGradientStop] = createSignal(innerDot().gradientStop);
  const [innerDotMaxRadius, setInnerDotMaxRadius] = createSignal(innerDot().maxRadius);

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
    
    // Update inner dot signals
    const currentInnerDot = innerDot();
    setInnerDotVisible(currentInnerDot.visible);
    setInnerDotRadius(currentInnerDot.radius);
    setInnerDotColor1Index(currentInnerDot.color1Index);
    setInnerDotColor2Index(currentInnerDot.color2Index);
    setInnerDotGradientStop(currentInnerDot.gradientStop);
    setInnerDotMaxRadius(currentInnerDot.maxRadius);
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
    <div class="ring-control">
      {/* Simple Color Test */}
      <SimpleColorTest 
        getP={() => props.getP()}
        requestRedraw={props.requestRedraw}
      />

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

      {/* Color Diagnostic Button */}
      <button
        onClick={() => {
          const p = props.getP();
          if (p) {
            runQuickColorDiagnostic(p);
          }
        }}
        class="action-button diagnostic-button"
        title="Run color diagnostic to identify UI vs P5 rendering mismatches"
      >
        🔍 Color Diagnostic
      </button>

      {/* Simple Color Test Button */}
      <button
        onClick={() => {
          const p = props.getP();
          if (p) {
            runSimpleColorTest(p);
          }
        }}
        class="action-button simple-test-button"
        title="Test simple direct color rendering without conversions"
      >
        🎨 Simple Color Test
      </button>

      {/* New Palette Button */}
      <button
        onClick={handleNewPalette}
        class="action-button"
      >
        New Palette
      </button>

      {/* Test Direct RGB Palette Button */}
      <button
        onClick={() => {
          const p = props.getP();
          if (p) {
            console.log('=== TESTING DIRECT RGB PALETTE ===');
            const newPalette = generateDirectRgbPalette(p);
            console.log('Generated new palette with', newPalette.length, 'colors');
            
            // Test each color
            newPalette.forEach((color, index) => {
              p.colorMode(p.RGB, 255);
              const r = p.red(color);
              const g = p.green(color);
              const b = p.blue(color);
              console.log(`Color ${index}: rgb(${r}, ${g}, ${b})`);
            });
            
            p.colorMode(p.HSB, 360, 100, 100);
            console.log('=== END DIRECT RGB TEST ===');
          }
        }}
        class="action-button test-palette-button"
        title="Test the new direct RGB palette generation"
      >
        🧪 Test Direct RGB Palette
      </button>

      {/* Randomize Button */}
      <button
        onClick={handleRandomize}
        class="action-button"
      >
        Randomize
      </button>

      {/* Inner Dot Controls */}
      <div class="control-section">
        <h4 class="section-title">Center Dot</h4>
        
        {/* Visibility Toggle */}
        <label class="guides-checkbox">
          <input
            type="checkbox"
            checked={innerDotVisible()}
            onChange={(e) => {
              setInnerDotVisible(e.target.checked);
              setInnerDot({ ...innerDot(), visible: e.target.checked });
              setHasChanges(true);
              props.requestRedraw();
            }}
          />
          Show Center Dot
        </label>

        {innerDotVisible() && (
          <>
            {/* Radius Control */}
            <div class="control-group">
              <label class="control-label">Radius</label>
              <input
                type="range"
                min="0"
                max={innerDotMaxRadius()}
                step="0.1"
                value={innerDotRadius()}
                onInput={(e) => {
                  const value = parseFloat(e.target.value);
                  setInnerDotRadius(value);
                  setInnerDot({ ...innerDot(), radius: value });
                  setHasChanges(true);
                  props.requestRedraw();
                }}
                class="control-range"
              />
              <div class="control-description">
                <small>{innerDotRadius().toFixed(1)} / {innerDotMaxRadius().toFixed(1)}</small>
              </div>
            </div>

            {/* Max Radius Control */}
            <div class="control-group">
              <label class="control-label">Max Radius</label>
              <input
                type="range"
                min="1"
                max="50"
                step="0.5"
                value={innerDotMaxRadius()}
                onInput={(e) => {
                  const value = parseFloat(e.target.value);
                  setInnerDotMaxRadius(value);
                  setInnerDot({ ...innerDot(), maxRadius: value });
                  // Adjust current radius if it exceeds new max
                  if (innerDotRadius() > value) {
                    setInnerDotRadius(value);
                    setInnerDot({ ...innerDot(), radius: value, maxRadius: value });
                  } else {
                    setInnerDot({ ...innerDot(), maxRadius: value });
                  }
                  setHasChanges(true);
                  props.requestRedraw();
                }}
                class="control-range"
              />
              <div class="control-description">
                <small>{innerDotMaxRadius().toFixed(1)}</small>
              </div>
            </div>

            {/* Color 1 Index */}
            <div class="control-group">
              <label class="control-label">Color 1 Index</label>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={innerDotColor1Index()}
                onInput={(e) => {
                  const value = parseInt(e.target.value);
                  setInnerDotColor1Index(value);
                  setInnerDot({ ...innerDot(), color1Index: value });
                  setHasChanges(true);
                  props.requestRedraw();
                }}
                class="control-range"
              />
              <div class="control-description">
                <small>Palette Color {innerDotColor1Index()}</small>
              </div>
            </div>

            {/* Color 2 Index */}
            <div class="control-group">
              <label class="control-label">Color 2 Index</label>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={innerDotColor2Index()}
                onInput={(e) => {
                  const value = parseInt(e.target.value);
                  setInnerDotColor2Index(value);
                  setInnerDot({ ...innerDot(), color2Index: value });
                  setHasChanges(true);
                  props.requestRedraw();
                }}
                class="control-range"
              />
              <div class="control-description">
                <small>Palette Color {innerDotColor2Index()}</small>
              </div>
            </div>

            {/* Gradient Stop */}
            <div class="control-group">
              <label class="control-label">Gradient Stop</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={innerDotGradientStop()}
                onInput={(e) => {
                  const value = parseFloat(e.target.value);
                  setInnerDotGradientStop(value);
                  setInnerDot({ ...innerDot(), gradientStop: value });
                  setHasChanges(true);
                  props.requestRedraw();
                }}
                class="control-range"
              />
              <div class="control-description">
                <small>{(innerDotGradientStop() * 100).toFixed(0)}%</small>
              </div>
            </div>
          </>
        )}
      </div>

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
