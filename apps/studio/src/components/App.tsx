import { Component, onMount, onCleanup, createSignal, Show } from 'solid-js';
import { hasChanges, initializeArtwork, clearChanges, forceSave, rings, randomizeArtwork, toggleDevMode } from '../store/artwork';
import { RingsControls } from './RingsControls';
import { ActionsControls } from './ActionsControls';
import { ColorManagementPanel } from './ColorManagementPanel';
import { CenterDotControls } from './CenterDotControls';
import { SaveControls } from './SaveControls';
import { GrammarRules } from './GrammarRules';
import { RecoveryModal, useRecovery } from './RecoveryModal';
import { StatusChips } from './StatusChips';
import { TabContainer, type Tab } from './TabContainer';
import { AdvancedTab } from './AdvancedTab';
import { DownloadTab } from './DownloadTab';
import { PositioningTab } from './PositioningTab';
import { deferredRenderManager } from '../core/deferred-render';
import type p5 from 'p5';
import '../styles/components/status-chips.css';
import '../styles/components/tab-container.css';
import '../styles/components/grammar-rules.css';
import '../styles/components/app.css';
import '../styles/components/performance-monitor.css';
import '../styles/components/download-button.css';
import '../styles/components/zoom-controls.css';
import '../styles/components/tab-integrations.css';

interface AppProps {
  p5Instance: p5;
  requestRedraw: () => void;
}

export const App: Component<AppProps> = (props) => {
  const { showRecovery, closeRecovery } = useRecovery(props.p5Instance);
  
  // UI state management
  const [showOverlay, setShowOverlay] = createSignal(false);
  const [scrollY, setScrollY] = createSignal(0);
  

  // Initialize artwork when component mounts - but only if not already initialized
  onMount(() => {
    // Wait for p5 instance to be ready
    const waitForP5 = () => {
      const p = props.p5Instance;
      if (p && p._renderer) {
        // Only initialize if rings array is empty
        const currentRings = rings();
        if (currentRings.length === 0) {
          initializeArtwork(p);
        } else {
        }
        
        // Set the actual render callback for deferred rendering
        deferredRenderManager.setRenderCallback(() => {
          if (p) {
            p.redraw();
          }
          // Clear changes after redraw
          if (hasChanges()) {
            clearChanges();
          }
        });
      } else {
        setTimeout(waitForP5, 100);
      }
    };
    
    waitForP5();

    // Handle scroll events to show/hide overlay
    const handleScroll = () => {
      const scroll = window.scrollY;
      setScrollY(scroll);
      setShowOverlay(scroll > 100); // Show overlay after scrolling down 100px
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);

    // Add keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S or Cmd+S for manual save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        const success = forceSave();
        if (success) {
        } else {
        }
      }
      // Ctrl+Shift+D or Cmd+Shift+D for dev mode toggle
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        toggleDevMode();
      }
      // Escape key to hide overlay
      if (event.key === 'Escape') {
        setShowOverlay(false);
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    });
  });

  const handleRequestRedraw = () => {
    // For immediate updates like color changes, use direct redraw
    if (props.p5Instance) {
      props.p5Instance.redraw();
    }
  };

  const handleRandomize = () => {
    if (props.p5Instance) {
      randomizeArtwork(props.p5Instance);
      handleRequestRedraw();
    }
  };

  // Toggle overlay visibility
  const toggleOverlay = () => {
    setShowOverlay(!showOverlay());
    if (!showOverlay()) {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div class="wheelgen-app">
      
      {/* Overlay UI that appears on scroll */}
      <Show when={showOverlay()}>
        <div class="overlay-ui">
          <div class="overlay-header">
            <h1>WheelGen Controls</h1>
            <div class="header-controls">
              <button 
                class="randomize-button" 
                onClick={handleRandomize}
                title="Randomize artwork"
              >
                🎲 Randomize
              </button>
              <button class="close-overlay" onClick={toggleOverlay} title="Close controls (Esc)">
                ✕
              </button>
            </div>
          </div>
          
          <div class="overlay-content">
            <TabContainer 
              tabs={[
                {
                  id: 'rings',
                  label: 'Rings',
                  icon: '⭕',
                  content: RingsControls,
                  props: {
                    getP: () => {
                      if (!props.p5Instance) {
                        return null;
                      }
                      return props.p5Instance;
                    },
                    requestRedraw: handleRequestRedraw
                  }
                },
                {
                  id: 'center-dot',
                  label: 'Center',
                  icon: '🔴',
                  content: CenterDotControls,
                  props: {
                    getP: () => {
                      if (!props.p5Instance) {
                        return null;
                      }
                      return props.p5Instance;
                    },
                    requestRedraw: handleRequestRedraw
                  }
                },
                {
                  id: 'colors',
                  label: 'Color',
                  icon: '🎨',
                  content: ColorManagementPanel,
                  props: {
                    getP: () => {
                      if (!props.p5Instance) {
                        return null;
                      }
                      return props.p5Instance;
                    },
                    requestRedraw: handleRequestRedraw
                  }
                },
                {
                  id: 'positioning',
                  label: 'Positioning',
                  icon: '🔍',
                  content: PositioningTab,
                  props: {
                    getP: () => {
                      if (!props.p5Instance) {
                        return null;
                      }
                      return props.p5Instance;
                    },
                    requestRedraw: handleRequestRedraw
                  }
                },
                {
                  id: 'save',
                  label: 'Save',
                  icon: '💾',
                  content: SaveControls,
                  props: {
                    getP: () => {
                      if (!props.p5Instance) {
                        return null;
                      }
                      return props.p5Instance;
                    },
                    requestRedraw: handleRequestRedraw
                  }
                },
                {
                  id: 'download',
                  label: 'Download',
                  icon: '📥',
                  content: DownloadTab,
                  props: {
                    getP: () => {
                      if (!props.p5Instance) {
                        return null;
                      }
                      return props.p5Instance;
                    },
                    requestRedraw: handleRequestRedraw
                  }
                },
                {
                  id: 'performance',
                  label: 'Advanced',
                  icon: '📊',
                  content: AdvancedTab,
                  props: {
                    getP: () => {
                      if (!props.p5Instance) {
                        return null;
                      }
                      return props.p5Instance;
                    },
                    requestRedraw: handleRequestRedraw
                  }
                }
              ]}
              defaultTab="rings"
            />
          </div>
        </div>
      </Show>
      
      {/* Floating toggle button */}
      <button 
        class={`overlay-toggle ${showOverlay() ? 'overlay-open' : 'overlay-closed'}`}
        onClick={toggleOverlay}
        title={showOverlay() ? 'Hide controls' : 'Show controls (scroll down)'}
      >
        <span class="toggle-icon">
          {showOverlay() ? '🎨' : '⚙️'}
        </span>
      </button>
      
      {/* Recovery Modal */}
      {showRecovery && (
        <RecoveryModal 
          p5Instance={props.p5Instance}
          onClose={closeRecovery}
        />
      )}
    </div>
  );
};
