import type p5 from 'p5';
import { ArtworkState } from './artwork';
import { Ring } from '../model/ring';

// Save slot data structure
export interface SaveSlot {
  id: number;
  name: string;
  timestamp: number;
  thumbnail?: string; // Base64 encoded thumbnail
  data: SerializedArtwork;
}

export interface SerializedArtwork {
  version: string;
  timestamp: number;
  rings: SerializedRing[];
  palette: SerializedColor[];
  innerDot: {
    visible: boolean;
    radius: number;
    color1Index: number;
    color2Index: number;
    gradientStop: number;
    maxRadius: number;
  };
  globals: {
    randomness: number;
    strokeCount: number;
    colorBleed: number;
    globalStrokeWidth: number;
  };
  guidesVisible: boolean;
  backgroundColor: SerializedColor | null;
  colorLock: {
    lockedColors: boolean[];
    customColors: Array<{ h: number; s: number; b: number } | null>;
  };
}

export interface SerializedRing {
  radius: number;
  ringIndex: number;
  visible: boolean;
  grammarString: string;
  isSolid: boolean;
  baseColor: SerializedColor;
  shapeOptions: Record<string, Record<string, { min: number; max: number; value: number }>>;
}

export interface SerializedColor {
  // RGB format (new, preferred)
  r?: number;
  g?: number;
  b?: number;
  a?: number;
  // HSB format (legacy, for backward compatibility)
  h?: number;
  s?: number;
  // Note: 'b' and 'a' are shared between formats
}

// Storage keys for each slot
const SLOT_KEYS = [
  'wheelgen_slot_1', 'wheelgen_slot_2', 'wheelgen_slot_3',
  'wheelgen_slot_4', 'wheelgen_slot_5', 'wheelgen_slot_6',
  'wheelgen_slot_7', 'wheelgen_slot_8', 'wheelgen_slot_9'
];


class SaveSlotService {
  private slots: SaveSlot[] = [];

  constructor() {
    this.loadAllSlots();
  }

  /**
   * Serialize p5.Color to compact format
   * FIXED: Store RGB values to avoid HSB round-trip precision loss
   */
  private serializeColor(color: p5.Color, p: p5): SerializedColor {
    // Store current color mode
    const currentMode = (p as any)._colorMode;
    const currentMaxes = (p as any)._colorMaxes;
    
    try {
      // Read RGB values directly to avoid conversion loss
      p.colorMode(p.RGB, 255);
      const r = p.red(color);
      const g = p.green(color);
      const b = p.blue(color);
      const a = p.alpha(color);
      
      // Restore original color mode
      if (currentMode === p.HSB) {
        if (currentMaxes && currentMaxes.length >= 3) {
          p.colorMode(p.HSB, currentMaxes[0], currentMaxes[1], currentMaxes[2]);
        } else {
          p.colorMode(p.HSB, 360, 100, 100);
        }
      } else {
        if (currentMaxes && currentMaxes.length >= 3) {
          p.colorMode(p.RGB, currentMaxes[0], currentMaxes[1], currentMaxes[2]);
        } else {
          p.colorMode(p.RGB, 255, 255, 255);
        }
      }
      
      // Store RGB values instead of HSB to avoid precision loss
      return { r, g, b, a };
    } catch (error) {
      return { r: 0, g: 0, b: 0, a: 255 };
    }
  }

  /**
   * Deserialize color back to p5.Color
   * FIXED: Use RGB values to avoid HSB round-trip precision loss
   */
  private deserializeColor(serialized: SerializedColor, p: p5): p5.Color {
    // Store current color mode
    const currentMode = (p as any)._colorMode;
    const currentMaxes = (p as any)._colorMaxes;
    
    try {
      // Create color directly from RGB values to avoid any conversion loss
      p.colorMode(p.RGB, 255);
      const color = p.color(
        serialized.r ?? 0, 
        serialized.g ?? 0, 
        serialized.b ?? 0, 
        serialized.a ?? 255
      );
      
      // Restore original color mode
      if (currentMode === p.HSB) {
        if (currentMaxes && currentMaxes.length >= 3) {
          p.colorMode(p.HSB, currentMaxes[0], currentMaxes[1], currentMaxes[2]);
        } else {
          p.colorMode(p.HSB, 360, 100, 100);
        }
      } else {
        if (currentMaxes && currentMaxes.length >= 3) {
          p.colorMode(p.RGB, currentMaxes[0], currentMaxes[1], currentMaxes[2]);
        } else {
          p.colorMode(p.RGB, 255, 255, 255);
        }
      }
      
      return color;
    } catch (error) {
      // Fallback: try to handle legacy HSB format
      if ('h' in serialized && 's' in serialized && 'b' in serialized) {
        return p.color(
          serialized.h ?? 0, 
          serialized.s ?? 0, 
          serialized.b ?? 0, 
          serialized.a ?? 255
        );
      }
      return p.color(0, 0, 0, 255);
    }
  }

  /**
   * Serialize Ring object to compact format
   */
  private serializeRing(ring: Ring, p: p5): SerializedRing {
    return {
      radius: ring.radius,
      ringIndex: ring.ringIndex,
      visible: ring.visible,
      grammarString: ring.grammarString,
      isSolid: ring.isSolidRing,
      baseColor: this.serializeColor(ring.baseColor, p),
      shapeOptions: ring.getShapeOptionsFor ? 
        Object.keys(ring.getAvailableSymbols()).reduce((acc, symbol) => {
          acc[symbol] = ring.getShapeOptionsFor(symbol);
          return acc;
        }, {} as Record<string, Record<string, { min: number; max: number; value: number }>>) : {}
    };
  }

  /**
   * Deserialize Ring from compact format
   */
  private deserializeRing(serialized: SerializedRing, p: p5): Ring {
    const color = this.deserializeColor(serialized.baseColor, p);
    const ring = new Ring(serialized.radius, color, serialized.ringIndex);
    
    ring.visible = serialized.visible;
    ring.setPattern(p, serialized.grammarString);
    
    return ring;
  }

  /**
   * Serialize complete artwork state
   */
  private serializeArtwork(state: ArtworkState, p: p5): SerializedArtwork {
    return {
      version: '1.0',
      timestamp: Date.now(),
      rings: state.rings.map(ring => this.serializeRing(ring, p)),
      palette: state.palette.map(color => this.serializeColor(color, p)),
      innerDot: state.innerDot,
      globals: state.globals,
      guidesVisible: state.guidesVisible,
      backgroundColor: state.backgroundColor ? this.serializeColor(state.backgroundColor, p) : null,
      colorLock: state.colorLock
    };
  }

  /**
   * Deserialize artwork state
   */
  private deserializeArtwork(serialized: SerializedArtwork, p: p5): Partial<ArtworkState> {
    return {
      rings: serialized.rings.map(ring => this.deserializeRing(ring, p)),
      palette: serialized.palette.map(color => this.deserializeColor(color, p)),
      innerDot: serialized.innerDot,
      globals: serialized.globals,
      guidesVisible: serialized.guidesVisible,
      backgroundColor: serialized.backgroundColor ? this.deserializeColor(serialized.backgroundColor, p) : null,
      colorLock: serialized.colorLock
    };
  }

  /**
   * Load all slots from localStorage
   */
  private loadAllSlots(): void {
    this.slots = SLOT_KEYS.map((key, index) => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const slot = JSON.parse(data) as SaveSlot;
          return slot;
        } catch (error) {
          return this.createEmptySlot(index + 1);
        }
      }
      return this.createEmptySlot(index + 1);
    });
  }

  /**
   * Create empty slot
   */
  private createEmptySlot(id: number): SaveSlot {
    return {
      id,
      name: id === 1 ? 'Autosave' : `Slot ${id}`,
      timestamp: 0,
      data: {
        version: '1.0',
        timestamp: 0,
        rings: [],
        palette: [],
        innerDot: {
          visible: false,
          radius: 0,
          color1Index: 0,
          color2Index: 1,
          gradientStop: 0.5,
          maxRadius: 0,
        },
        globals: {
          randomness: 0.0,
          strokeCount: 24,
          colorBleed: 0.3,
          globalStrokeWidth: 0.0,
        },
        guidesVisible: true,
        backgroundColor: null,
        colorLock: {
          lockedColors: [false, false, false, false],
          customColors: [null, null, null, null]
        }
      }
    };
  }

  /**
   * Save artwork to slot
   */
  public saveToSlot(slotId: number, state: ArtworkState, p: p5, thumbnail?: string): boolean {
    if (slotId < 1 || slotId > 9) return false;

    try {
      const serialized = this.serializeArtwork(state, p);
      const slot: SaveSlot = {
        id: slotId,
        name: slotId === 1 ? 'Autosave' : `Slot ${slotId}`,
        timestamp: Date.now(),
        thumbnail,
        data: serialized
      };

      const key = SLOT_KEYS[slotId - 1];
      localStorage.setItem(key, JSON.stringify(slot));
      
      // Update in-memory cache
      this.slots[slotId - 1] = slot;
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load artwork from slot
   */
  public loadFromSlot(slotId: number, p: p5): Partial<ArtworkState> | null {
    if (slotId < 1 || slotId > 9) return null;

    const slot = this.slots[slotId - 1];
    if (!slot || slot.timestamp === 0) return null;

    try {
      return this.deserializeArtwork(slot.data, p);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if slot has saved data
   */
  public hasSlotData(slotId: number): boolean {
    if (slotId < 1 || slotId > 9) return false;
    const slot = this.slots[slotId - 1];
    return slot && slot.timestamp > 0;
  }

  /**
   * Get slot info
   */
  public getSlotInfo(slotId: number): SaveSlot | null {
    if (slotId < 1 || slotId > 9) return null;
    return this.slots[slotId - 1];
  }

  /**
   * Get all slots info
   */
  public getAllSlots(): SaveSlot[] {
    return [...this.slots];
  }

  /**
   * Clear slot
   */
  public clearSlot(slotId: number): boolean {
    if (slotId < 1 || slotId > 9) return false;

    const key = SLOT_KEYS[slotId - 1];
    localStorage.removeItem(key);
    this.slots[slotId - 1] = this.createEmptySlot(slotId);
    
    return true;
  }

  /**
   * Generate thumbnail from canvas
   */
  public generateThumbnail(canvas: HTMLCanvasElement): string {
    try {
      // Create a smaller thumbnail
      const thumbnailCanvas = document.createElement('canvas');
      const ctx = thumbnailCanvas.getContext('2d');
      if (!ctx) return '';

      const size = 64; // 64x64 thumbnail
      thumbnailCanvas.width = size;
      thumbnailCanvas.height = size;

      // Draw scaled version
      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, size, size);
      
      return thumbnailCanvas.toDataURL('image/png');
    } catch (error) {
      return '';
    }
  }

}

// Export singleton instance
export const saveSlotService = new SaveSlotService();
