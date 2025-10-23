import { Component, createSignal, onMount, onCleanup } from 'solid-js';
import { 
  hasChanges, 
  clearChanges, 
  setNewPalette, 
  guidesVisible, 
  setGuidesVisible,
  rings
} from '../store/artwork';
import type { Ring } from '../model/ring';
import '../styles/components/actions-controls.css';

// Props interface
interface ActionsControlsProps {
  getP: () => any; // p5 instance
  requestRedraw: () => void;
}

export const ActionsControls: Component<ActionsControlsProps> = (props) => {
  // Auto-rerender system
  const [isAutoRendering, setIsAutoRendering] = createSignal(true);
  let intervalId: ReturnType<typeof setInterval> | undefined;

  // Auto-rerender timer
  onMount(() => {
    const startTimer = () => {
      intervalId = setInterval(() => {
        performRerender();
      }, 800); // 800ms interval
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
        performRerender();
      }, 800);
    }
  };

  const manualRerender = () => {
    performRerender();
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


  return (
    <div class="ring-control">
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

    </div>
  );
};
