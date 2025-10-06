// Analytics utility for tracking user interactions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackPageView = (pagePath: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-3YYLCLV0N0', {
      page_path: pagePath,
    });
  }
};

// Predefined events for your app
export const AnalyticsEvents = {
  // User engagement
  APP_LOADED: 'app_loaded',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  
  // Art creation
  ARTWORK_SAVED: 'artwork_saved',
  ARTWORK_LOADED: 'artwork_loaded',
  ARTWORK_EXPORTED: 'artwork_exported',
  
  // Controls usage
  RING_ADDED: 'ring_added',
  RING_REMOVED: 'ring_removed',
  COLOR_CHANGED: 'color_changed',
  PATTERN_CHANGED: 'pattern_changed',
  
  // Performance
  RENDER_TIME: 'render_time',
  CANVAS_RESIZE: 'canvas_resize',
} as const;
