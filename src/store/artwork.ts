import { createSignal, createMemo, createEffect } from 'solid-js';
import type p5 from 'p5';
import { Ring } from '../model/ring';
import { generatePalette, logPaletteColors } from '../core/color';
import { defaultGrammars } from '../core/constants';
import { clearLoggedGrammars, logRingStrokeData } from '../model/particle';
import { autosaveService } from './autosave';

// Types
export interface GlobalsState {
  randomness: number;
  strokeCount: number;
  colorBleed: number;
  globalStrokeWidth: number;
}

export interface InnerDotState {
  visible: boolean;
  radius: number;
  color1Index: number;
  color2Index: number;
  gradientStop: number; // 0..1
  maxRadius: number;
}

export interface ColorAssignmentState {
  mode: 'auto' | 'manual';
  strokeOffsets: {
    d: number;
    h: number;
    l: number;
    v: number;
    '-': number;
  };
  customAssignments: Record<string, Record<string, number>>; // ringIndex -> strokeType -> colorIndex
}

export interface ColorLockState {
  lockedColors: boolean[]; // Array indicating which colors are locked (true) or unlocked (false)
  customColors: Array<{ h: number; s: number; b: number } | null>; // Custom color values for locked positions
}

export interface ArtworkState {
  rings: Ring[];
  palette: p5.Color[];
  innerDot: InnerDotState;
  globals: GlobalsState;
  guidesVisible: boolean;
  hasChanges: boolean;
  backgroundColor: p5.Color | null;
  colorLock: ColorLockState;
}

// Solid.js Signals
export const [rings, setRingsOriginal] = createSignal<Ring[]>([]);

// Add debugging to track ring changes
export const setRings = (newRings: Ring[]) => {
  setRingsOriginal(newRings);
};
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
  globalStrokeWidth: 0.0,
});
export const [guidesVisible, setGuidesVisible] = createSignal(true);
export const [hasChanges, setHasChanges] = createSignal(false);
export const [backgroundColor, setBackgroundColor] = createSignal<p5.Color | null>(null);
export const [colorAssignment, setColorAssignment] = createSignal<ColorAssignmentState>({
  mode: 'auto',
  strokeOffsets: {
    d: 0,
    h: 0,
    l: 0,
    v: 0,
    '-': 0,
  },
  customAssignments: {},
});

export const [colorLock, setColorLock] = createSignal<ColorLockState>({
  lockedColors: [false, false, false, false], // Initially all colors unlocked
  customColors: [null, null, null, null], // No custom colors initially
});

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
  setRingsOriginal(updatedRings);
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
  setRingsOriginal([...currentRings]);
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
  // Don't create a new array reference - just mark changes to trigger render
  // The ring objects themselves have been updated, so we just need to trigger a redraw
  setHasChanges(true);
};

export const toggleGuides = () => {
  setGuidesVisible(!guidesVisible());
};

export const markChanges = () => {
  setHasChanges(true);
};

export const updateBackgroundColor = (h: number, s: number, b: number, p: p5) => {
  p.colorMode(p.HSB, 360, 100, 100);
  const color = p.color(h, s, b);
  setBackgroundColor(color);
  setHasChanges(true);
};

// Color assignment functions
// Simplified color assignment - just use palette colors directly
export const getStrokeColorIndex = (ringIndex: number, strokeType: 'd' | 'h' | 'l' | 'v' | '-'): number => {
  const assignment = colorAssignment();
  
  // Check if there's a custom assignment for this specific ring/stroke
  const custom = assignment.customAssignments[ringIndex.toString()]?.[strokeType];
  if (custom !== undefined) {
    return custom;
  }
  
  // Default: use ring index % palette length (simple)
  const defaultIndex = ringIndex % 4;
  return defaultIndex;
};

export const setStrokeColorAssignment = (ringIndex: number, strokeType: 'd' | 'h' | 'l' | 'v' | '-', colorIndex: number) => {
  
  const current = colorAssignment();
  const newCustomAssignments = { ...current.customAssignments };
  
  if (!newCustomAssignments[ringIndex.toString()]) {
    newCustomAssignments[ringIndex.toString()] = {};
  }
  
  newCustomAssignments[ringIndex.toString()][strokeType] = colorIndex;
  
  // Update assignments (no mode switching)
  setColorAssignment({
    ...current,
    customAssignments: newCustomAssignments,
  });
  
  // Update the ring's stroke colors and update particles
  const currentRings = rings();
  const ring = currentRings[ringIndex];
  if (ring) {
    if (!ring.strokeColors) {
      ring.strokeColors = {};
    }
    ring.strokeColors[strokeType] = colorIndex;
    
    
    // Update all particles for this stroke type to reflect the new color
    if (p5Instance) {
      ring.updateParticlesForStrokeType(strokeType, p5Instance);
    }
    
    // Force a new array reference to ensure reactivity
    setRingsOriginal([...currentRings]);
  }
  
  setHasChanges(true);
};

export const clearStrokeColorAssignment = (ringIndex: number, strokeType: 'd' | 'h' | 'l' | 'v' | '-') => {
  const current = colorAssignment();
  const newCustomAssignments = { ...current.customAssignments };
  
  if (newCustomAssignments[ringIndex.toString()]) {
    delete newCustomAssignments[ringIndex.toString()][strokeType];
    if (Object.keys(newCustomAssignments[ringIndex.toString()]).length === 0) {
      delete newCustomAssignments[ringIndex.toString()];
    }
  }
  
  // Check if we should switch back to auto mode
  const hasAnyCustomAssignments = Object.keys(newCustomAssignments).length > 0;
  const newMode = hasAnyCustomAssignments ? 'manual' : 'auto';
  
  setColorAssignment({
    ...current,
    mode: newMode,
    customAssignments: newCustomAssignments,
  });
  
  // Update the ring's stroke colors and update particles
  const currentRings = rings();
  const ring = currentRings[ringIndex];
  if (ring && ring.strokeColors) {
    delete ring.strokeColors[strokeType];
    // Force a new array reference to ensure reactivity
    setRingsOriginal([...currentRings]);
  }
  
  setHasChanges(true);
};

export const setColorAssignmentMode = (mode: 'auto' | 'manual') => {
  setColorAssignment(prev => ({ ...prev, mode }));
  setHasChanges(true);
};

// Color lock management functions
export const toggleColorLock = (index: number) => {
  const current = colorLock();
  const newLockedColors = [...current.lockedColors];
  newLockedColors[index] = !newLockedColors[index];
  
  setColorLock({
    ...current,
    lockedColors: newLockedColors,
  });
  setHasChanges(true);
};

export const setCustomColor = (index: number, color: { h: number; s: number; b: number } | null) => {
  const current = colorLock();
  const newCustomColors = [...current.customColors];
  newCustomColors[index] = color;
  
  setColorLock({
    ...current,
    customColors: newCustomColors,
  });
  setHasChanges(true);
};

export const isColorLocked = (index: number): boolean => {
  return colorLock().lockedColors[index] || false;
};

export const getCustomColor = (index: number): { h: number; s: number; b: number } | null => {
  return colorLock().customColors[index] || null;
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

export const getP5Instance = (): p5 | null => {
  return p5Instance;
};

// Get current artwork state for autosave
const getCurrentArtworkState = (): ArtworkState => ({
  rings: rings(),
  palette: palette(),
  innerDot: innerDot(),
  globals: globals(),
  guidesVisible: guidesVisible(),
  hasChanges: hasChanges(),
  backgroundColor: backgroundColor() || null,
  colorLock: colorLock(),
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
    // Set palette and other state FIRST so rings can access it when they're loaded
    if (savedState.palette) setPalette(savedState.palette);
    if (savedState.backgroundColor) setBackgroundColor(savedState.backgroundColor);
    if (savedState.colorLock) setColorLock(savedState.colorLock);
    if (savedState.globals) setGlobals(savedState.globals);
    if (savedState.guidesVisible !== undefined) setGuidesVisible(savedState.guidesVisible);
    
    // Set rings AFTER palette is available
    if (savedState.rings) setRingsOriginal(savedState.rings);
    if (savedState.innerDot) setInnerDot(savedState.innerDot);
    
    // Update particles to use the new palette
    if (savedState.rings) {
      const currentRings = rings();
      currentRings.forEach(ring => {
        if (!ring.isSolidRing) {
          ring.updateParticles(p);
        }
      });
    }
    
    setHasChanges(false);
    autosaveService.clearRecoveryFlag();
    return true;
  } catch (error) {
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
  
  // Clear logged grammars for fresh color tracing
  clearLoggedGrammars();
  
  const numRings = 10;
  const maxRadius = Math.min(p.width, p.height) / 2 * 0.85;
  const minRadius = 50;

  p.noiseSeed(p.random(1000));
  p.colorMode(p.HSB, 360, 100, 100);
  const newPalette = generatePalette(p);
  setPalette(newPalette);
  
  // Log the generated palette colors
  logPaletteColors(p, newPalette);

  const newRings: Ring[] = [];
  for (let i = 0; i < numRings; i++) {
    const r = p.map(i, 0, numRings - 1, minRadius, maxRadius);
    const c = newPalette[i % newPalette.length] as p5.Color;
    const ring = new Ring(r, c, i);
    newRings.push(ring);
  }

  // Set rings BEFORE calling setPattern so particles can access them
  setRingsOriginal(newRings);

  // Now set patterns (which creates particles)
  for (let i = 0; i < numRings; i++) {
    const ring = newRings[i];
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
  }

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
  clearLoggedGrammars(); // Clear any existing logged data
  initializeArtwork(p);
};
