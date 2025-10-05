import { createSignal, createMemo, createEffect } from 'solid-js';
import type p5 from 'p5';
import { Ring } from '../model/ring';
import { generatePalette } from '../core/color';
import { defaultGrammars } from '../core/constants';
import { autosaveService } from './autosave';

// Types
export interface GlobalsState {
  randomness: number;
  strokeCount: number;
  colorBleed: number;
}

export interface InnerDotState {
  visible: boolean;
  radius: number;
  color1Index: number;
  color2Index: number;
  gradientStop: number; // 0..1
  maxRadius: number;
}

export interface ArtworkState {
  rings: Ring[];
  palette: p5.Color[];
  innerDot: InnerDotState;
  globals: GlobalsState;
  guidesVisible: boolean;
  hasChanges: boolean;
}

// Solid.js Signals
export const [rings, setRings] = createSignal<Ring[]>([]);
export const [palette, setPalette] = createSignal<p5.Color[]>([]);
export const [innerDot, setInnerDot] = createSignal<InnerDotState>({
  visible: false,
  radius: 0,
  color1Index: 0,
  color2Index: 1,
  gradientStop: 0.5,
  maxRadius: 0,
});
export const [globals, setGlobals] = createSignal<GlobalsState>({
  randomness: 0.0,
  strokeCount: 24,
  colorBleed: 0.3,
});
export const [guidesVisible, setGuidesVisible] = createSignal(true);
export const [hasChanges, setHasChanges] = createSignal(false);

// Computed values
export const availableRings = createMemo(() => 
  rings().filter(ring => ring.visible)
);

export const visibleRingsCount = createMemo(() => 
  availableRings().length
);

// Actions
export const updateRing = (index: number, updates: Partial<Ring>) => {
  const currentRings = rings();
  const updatedRings = [...currentRings];
  // Apply updates directly to the ring object instead of spreading
  Object.assign(updatedRings[index], updates);
  setRings(updatedRings);
  setHasChanges(true);
};

export const updateRingPattern = (index: number, pattern: string, p: p5) => {
  const currentRings = rings();
  const ring = currentRings[index];
  
  if (pattern === '') {
    ring.visible = false;
    ring.setPattern(p, '');
  } else {
    ring.setPattern(p, pattern);
    ring.visible = true;
  }
  
  // Force a new array reference to ensure reactivity
  setRings([...currentRings]);
  setHasChanges(true);
};

export const updateGlobalSetting = (key: keyof GlobalsState, value: number) => {
  const current = globals();
  setGlobals({ ...current, [key]: value });
  setHasChanges(true);
};

export const updateInnerDot = (updates: Partial<InnerDotState>) => {
  const current = innerDot();
  setInnerDot({ ...current, ...updates });
  setHasChanges(true);
};

export const setNewPalette = (p: p5) => {
  const newPalette = generatePalette(p);
  updatePaletteAndRings(newPalette, p);
};

// Unified function to update both palette and ring colors
export const updatePaletteAndRings = (newPalette: p5.Color[], p: p5) => {
  setPalette(newPalette);
  
  // Update ring colors
  const currentRings = rings();
  currentRings.forEach((ring, i) => 
    ring.updateColor(newPalette[i % newPalette.length] as p5.Color, p)
  );
  // Force a new array reference to ensure reactivity
  setRings([...currentRings]);
  setHasChanges(true);
};

export const toggleGuides = () => {
  setGuidesVisible(!guidesVisible());
};

export const markChanges = () => {
  setHasChanges(true);
};

export const clearChanges = () => {
  setHasChanges(false);
};

// Autosave integration
let p5Instance: p5 | null = null;

// Set p5 instance for autosave
export const setP5Instance = (p: p5) => {
  p5Instance = p;
};

// Get current artwork state for autosave
const getCurrentArtworkState = (): ArtworkState => ({
  rings: rings(),
  palette: palette(),
  innerDot: innerDot(),
  globals: globals(),
  guidesVisible: guidesVisible(),
  hasChanges: hasChanges()
});

// Autosave effect - triggers when hasChanges becomes true
createEffect(() => {
  if (hasChanges() && p5Instance) {
    autosaveService.scheduleSave(getCurrentArtworkState());
  }
});

// Load from autosave
export const loadFromAutosave = (p: p5): boolean => {
  const savedState = autosaveService.loadFromStorage(p);
  if (!savedState) return false;

  try {
    if (savedState.rings) setRings(savedState.rings);
    if (savedState.palette) setPalette(savedState.palette);
    if (savedState.innerDot) setInnerDot(savedState.innerDot);
    if (savedState.globals) setGlobals(savedState.globals);
    if (savedState.guidesVisible !== undefined) setGuidesVisible(savedState.guidesVisible);
    
    setHasChanges(false);
    autosaveService.clearRecoveryFlag();
    return true;
  } catch (error) {
    console.error('Failed to load from autosave:', error);
    return false;
  }
};

// Load from backup
export const loadFromBackup = (p: p5): boolean => {
  const savedState = autosaveService.loadFromBackup(p);
  if (!savedState) return false;

  try {
    if (savedState.rings) setRings(savedState.rings);
    if (savedState.palette) setPalette(savedState.palette);
    if (savedState.innerDot) setInnerDot(savedState.innerDot);
    if (savedState.globals) setGlobals(savedState.globals);
    if (savedState.guidesVisible !== undefined) setGuidesVisible(savedState.guidesVisible);
    
    setHasChanges(false);
    autosaveService.clearRecoveryFlag();
    return true;
  } catch (error) {
    console.error('Failed to load from backup:', error);
    return false;
  }
};

// Check for recovery data
export const hasRecoveryData = () => autosaveService.hasRecoveryData();

// Force save
export const forceSave = (): boolean => {
  if (!p5Instance) return false;
  return autosaveService.forceSave(getCurrentArtworkState());
};

// Clear all autosave data
export const clearAutosaveData = () => {
  autosaveService.clearAllData();
  setHasChanges(false);
};

// Get autosave info
export const getAutosaveInfo = () => autosaveService.getStorageInfo();

// Initialize artwork function
export const initializeArtwork = (p: p5) => {
  // Set p5 instance for autosave
  setP5Instance(p);
  
  const numRings = 10;
  const maxRadius = Math.min(p.width, p.height) / 2 * 0.85;
  const minRadius = 50;

  p.noiseSeed(p.random(1000));
  p.colorMode(p.HSB, 360, 100, 100);
  const newPalette = generatePalette(p);
  setPalette(newPalette);

  const newRings: Ring[] = [];
  for (let i = 0; i < numRings; i++) {
    const r = p.map(i, 0, numRings - 1, minRadius, maxRadius);
    const c = newPalette[i % newPalette.length] as p5.Color;
    const ring = new Ring(r, c, i);
    
    // Initialize 3 smallest rings invisible
    if (i < 3) {
      ring.visible = false;
      ring.setPattern(p, '');
    } else {
      // Randomly select a grammar instead of deterministic assignment
      const randomGrammarIndex = Math.floor(p.random(defaultGrammars.length));
      const grammar = defaultGrammars[randomGrammarIndex];
      ring.setPattern(p, grammar);
      ring.visible = true;
    }
    newRings.push(ring);
  }

  setRings(newRings);

  const innermostRing = newRings[newRings.length - 1];
  setInnerDot({
    visible: p.random() > 0.5,
    radius: p.random(10, innermostRing.radius * 0.8),
    color1Index: Math.floor(p.random(4)),
    color2Index: Math.floor(p.random(4)),
    gradientStop: p.random(0.3, 0.7),
    maxRadius: innermostRing.radius,
  });
};

// Randomize function
export const randomizeArtwork = (p: p5) => {
  initializeArtwork(p);
};
