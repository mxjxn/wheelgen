import { Component, onMount, onCleanup } from 'solid-js';
import { hasChanges, initializeArtwork, clearChanges, forceSave } from '../store/artwork';
import { RingsControls } from './RingsControls';
import { RecoveryModal, useRecovery } from './RecoveryModal';
import { AutosaveStatus } from './AutosaveStatus';
import type p5 from 'p5';

interface AppProps {
  p5Instance: p5;
}

export const App: Component<AppProps> = (props) => {
  const { showRecovery, closeRecovery } = useRecovery(props.p5Instance);

  // Initialize artwork when component mounts
  onMount(() => {
    // Wait for p5 instance to be ready
    const waitForP5 = () => {
      const p = props.p5Instance;
      if (p && p._renderer) {
        initializeArtwork(p);
      } else {
        setTimeout(waitForP5, 100);
      }
    };
    
    waitForP5();

    // Add keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S or Cmd+S for manual save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        const success = forceSave();
        if (success) {
          console.log('💾 Artwork saved manually');
        } else {
          console.warn('⚠️ Failed to save artwork');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyDown);
    });
  });

  const handleRequestRedraw = () => {
    // Get the p5 instance and trigger a redraw
    const p = props.p5Instance;
    if (p) {
      p.redraw();
    }
    // Clear changes after redraw
    if (hasChanges()) {
      clearChanges();
    }
  };

  return (
    <>
      <div class="controls-container">
        {/* Ring Controls with Actions Header */}
        <RingsControls 
          getP={() => props.p5Instance}
          requestRedraw={handleRequestRedraw}
        />
      </div>
      
      {/* Recovery Modal */}
      {showRecovery && (
        <RecoveryModal 
          p5Instance={props.p5Instance}
          onClose={closeRecovery}
        />
      )}
      
      {/* Autosave Status */}
      <AutosaveStatus />
    </>
  );
};
