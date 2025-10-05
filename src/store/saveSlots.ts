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
  };
  guidesVisible: boolean;
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
  h: number;
  s: number;
  b: number;
  a: number;
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
   */
  private serializeColor(color: p5.Color): SerializedColor {
    const h = color._getRed ? color._getRed() : 0;   // Hue in HSB mode
    const s = color._getGreen ? color._getGreen() : 0; // Saturation in HSB mode  
    const b = color._getBlue ? color._getBlue() : 0;   // Brightness in HSB mode
    const a = color._getAlpha ? color._getAlpha() : 255; // Alpha
    
    return { h, s, b, a };
  }

  /**
   * Deserialize color back to p5.Color
   */
  private deserializeColor(serialized: SerializedColor, p: p5): p5.Color {
    return p.color(serialized.h, serialized.s, serialized.b, serialized.a);
  }

  /**
   * Serialize Ring object to compact format
   */
  private serializeRing(ring: Ring): SerializedRing {
    return {
      radius: ring.radius,
      ringIndex: ring.ringIndex,
      visible: ring.visible,
      grammarString: ring.grammarString,
      isSolid: ring.isSolidRing,
      baseColor: this.serializeColor(ring.baseColor),
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
  private serializeArtwork(state: ArtworkState): SerializedArtwork {
    return {
      version: '1.0',
      timestamp: Date.now(),
      rings: state.rings.map(ring => this.serializeRing(ring)),
      palette: state.palette.map(color => this.serializeColor(color)),
      innerDot: state.innerDot,
      globals: state.globals,
      guidesVisible: state.guidesVisible
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
      guidesVisible: serialized.guidesVisible
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
          console.error(`Failed to load slot ${index + 1}:`, error);
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
      name: `Slot ${id}`,
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
        },
        guidesVisible: true
      }
    };
  }

  /**
   * Save artwork to slot
   */
  public saveToSlot(slotId: number, state: ArtworkState, thumbnail?: string): boolean {
    if (slotId < 1 || slotId > 9) return false;

    try {
      const serialized = this.serializeArtwork(state);
      const slot: SaveSlot = {
        id: slotId,
        name: `Slot ${slotId}`,
        timestamp: Date.now(),
        thumbnail,
        data: serialized
      };

      const key = SLOT_KEYS[slotId - 1];
      localStorage.setItem(key, JSON.stringify(slot));
      
      // Update in-memory cache
      this.slots[slotId - 1] = slot;
      
      console.log(`💾 Saved to slot ${slotId}`);
      return true;
    } catch (error) {
      console.error(`Failed to save to slot ${slotId}:`, error);
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
      console.error(`Failed to load from slot ${slotId}:`, error);
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
    
    console.log(`🗑️ Cleared slot ${slotId}`);
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
      console.error('Failed to generate thumbnail:', error);
      return '';
    }
  }
}

// Export singleton instance
export const saveSlotService = new SaveSlotService();
