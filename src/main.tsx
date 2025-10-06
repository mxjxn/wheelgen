import './style.css';
import { mountSketch } from './core/p5-sketch';
import { render } from 'solid-js/web';
import { App } from './components/App';
import { trackEvent, AnalyticsEvents } from './utils/analytics';

// Create the main app container
const appRoot = document.getElementById('app')!;

// Create the new layout structure
const appContainer = document.createElement('div');
appContainer.className = 'wheelgen-app';

// Create canvas container (responsive sizing)
const canvasContainer = document.createElement('div');
canvasContainer.className = 'canvas-container';

// Assemble the layout
appContainer.appendChild(canvasContainer);
appRoot.appendChild(appContainer);

// Mount p5 canvas to canvas container
const api = mountSketch(canvasContainer);

// Track app loaded
trackEvent(AnalyticsEvents.APP_LOADED, {
  timestamp: new Date().toISOString(),
  user_agent: navigator.userAgent,
});

// Track session start
trackEvent(AnalyticsEvents.SESSION_START);

// Track session end when user leaves
window.addEventListener('beforeunload', () => {
  trackEvent(AnalyticsEvents.SESSION_END);
});

// Wait for p5 instance to be ready before rendering the app
const waitForP5Instance = () => {
  const p5Instance = api.getP();
  if (p5Instance && p5Instance._renderer) {
    // Render Solid.js App component directly to the app container
    try {
      render(() => <App p5Instance={p5Instance} requestRedraw={api.redraw} />, appContainer);
    } catch (error) {
    }
  } else {
    setTimeout(waitForP5Instance, 50);
  }
};

waitForP5Instance();
