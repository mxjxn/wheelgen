import './style.css';
import { mountSketch } from './core/p5-sketch';
import { render } from 'solid-js/web';
import { App } from './components/App';

// Create the main app container
const appRoot = document.getElementById('app')!;

// Create the new layout structure
const appContainer = document.createElement('div');
appContainer.className = 'wheelgen-app';

// Create canvas container (full screen)
const canvasContainer = document.createElement('div');
canvasContainer.className = 'canvas-container';

// Create overlay controls container
const overlayContainer = document.createElement('div');
overlayContainer.className = 'overlay-container';

// Create toggle button (floating)
const toggleButton = document.createElement('button');
toggleButton.className = 'overlay-toggle';
toggleButton.innerHTML = '<span class="toggle-icon">⚙️</span>';
toggleButton.setAttribute('aria-label', 'Toggle Controls');

// Create controls overlay
const controlsOverlay = document.createElement('div');
controlsOverlay.className = 'controls-overlay';

const overlayContent = document.createElement('div');
overlayContent.className = 'overlay-content';

controlsOverlay.appendChild(overlayContent);

// Assemble the layout
appContainer.appendChild(canvasContainer);
appContainer.appendChild(overlayContainer);
overlayContainer.appendChild(toggleButton);
overlayContainer.appendChild(controlsOverlay);
appRoot.appendChild(appContainer);

// Mount p5 canvas to canvas container
const api = mountSketch(canvasContainer);

// Store p5 instance for component access
const p5Instance = api.getP();

// Overlay toggle functionality
let isOverlayVisible = false;
toggleButton.addEventListener('click', () => {
  isOverlayVisible = !isOverlayVisible;
  overlayContainer.classList.toggle('overlay-visible', isOverlayVisible);
  toggleButton.classList.toggle('toggle-active', isOverlayVisible);
  
  // No need to trigger windowResized for overlay toggle
  // The canvas size doesn't change, only the overlay visibility
});

// Keyboard shortcut for toggling overlay
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    isOverlayVisible = false;
    overlayContainer.classList.remove('overlay-visible');
    toggleButton.classList.remove('toggle-active');
  }
});

// Close overlay when clicking outside
controlsOverlay.addEventListener('click', (e) => {
  if (e.target === controlsOverlay) {
    isOverlayVisible = false;
    overlayContainer.classList.remove('overlay-visible');
    toggleButton.classList.remove('toggle-active');
  }
});

// Render Solid.js App component to overlay content
try {
  render(() => <App p5Instance={p5Instance} />, overlayContent);
} catch (error) {
  console.error('Error rendering Solid.js App:', error);
}
