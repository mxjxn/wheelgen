import type p5 from 'p5';
import { ArtworkState, getP5Instance } from './artwork';
import { Ring } from '../model/ring';
import { saveSlotService } from './saveSlots';

// Efficient serialization format for artwork state
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

// Storage keys
const STORAGE_KEY = 'wheelgen_autosave';
const RECOVERY_KEY = 'wheelgen_recovery';

// Configuration
const AUTOSAVE_DELAY = 2000; // 2 seconds

class AutosaveService {
  private saveTimeout: number | null = null;
  private saveCount = 0;
  private lastSaveTime = 0;
  private isEnabled = true;

  constructor() {
    // Enable autosave by default
    this.isEnabled = true;
    
    // Check for recovery data on initialization
    this.checkForRecovery();
  }

  /**
   * Serialize p5.Color to a compact format
   */
  private serializeColor(color: p5.Color): SerializedColor {
    // p5.Color stores values in _getRed(), _getGreen(), _getBlue(), _getAlpha()
    // But we need HSB values since we're using HSB color mode
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
    
    // Restore shape options
    Object.keys(serialized.shapeOptions).forEach(symbol => {
      const options = serialized.shapeOptions[symbol];
      // This would need to be implemented in the Ring class
      // ring.setShapeOptions(symbol, options);
    });
    
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
   * Compress data using simple encoding
   */
  private compress(data: SerializedArtwork): string {
    // Use JSON with some optimizations
    const json = JSON.stringify(data);
    
    // Simple compression by removing unnecessary whitespace and using shorter keys
    return json
      .replace(/\s+/g, '') // Remove whitespace
      .replace(/"visible":/g, '"v":') // Shorter keys
      .replace(/"radius":/g, '"r":')
      .replace(/"grammarString":/g, '"g":')
      .replace(/"baseColor":/g, '"c":')
      .replace(/"shapeOptions":/g, '"o":')
      .replace(/"innerDot":/g, '"i":')
      .replace(/"globals":/g, '"gl":')
      .replace(/"guidesVisible":/g, '"gv":');
  }

  /**
   * Decompress data
   */
  private decompress(compressed: string): SerializedArtwork {
    // Restore full keys
    const restored = compressed
      .replace(/"v":/g, '"visible":')
      .replace(/"r":/g, '"radius":')
      .replace(/"g":/g, '"grammarString":')
      .replace(/"c":/g, '"baseColor":')
      .replace(/"o":/g, '"shapeOptions":')
      .replace(/"i":/g, '"innerDot":')
      .replace(/"gl":/g, '"globals":')
      .replace(/"gv":/g, '"guidesVisible":');
    
    return JSON.parse(restored);
  }

  /**
   * Save artwork state to autosave slot (slot 1)
   */
  private saveToStorage(state: ArtworkState): boolean {
    try {
      // Generate thumbnail if p5 canvas is available
      let thumbnail = '';
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (canvas) {
        thumbnail = saveSlotService.generateThumbnail(canvas);
      }
      
      // Save to slot 1 (autosave slot)
      const p5Instance = getP5Instance();
      if (!p5Instance) {
        return false;
      }
      const success = saveSlotService.saveToSlot(1, state, p5Instance, thumbnail);
      
      if (success) {
        this.lastSaveTime = Date.now();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Load artwork state from autosave slot (slot 1)
   */
  public loadFromStorage(p: p5): Partial<ArtworkState> | null {
    try {
      return saveSlotService.loadFromSlot(1, p);
    } catch (error) {
      return null;
    }
  }


  /**
   * Schedule autosave with debouncing
   */
  public scheduleSave(state: ArtworkState): void {
    if (!this.isEnabled) return;

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Set new timeout
    this.saveTimeout = window.setTimeout(() => {
      this.saveToStorage(state);
      this.saveTimeout = null;
    }, AUTOSAVE_DELAY);
  }

  /**
   * Force immediate save
   */
  public forceSave(state: ArtworkState): boolean {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    return this.saveToStorage(state);
  }

  /**
   * Check for recovery data and notify user
   */
  private checkForRecovery(): void {
    const hasAutosaveData = saveSlotService.hasSlotData(1);
    
    if (hasAutosaveData) {
      // Store recovery flag for UI to check
      localStorage.setItem(RECOVERY_KEY, 'true');
    }
  }

  /**
   * Check if recovery data exists
   */
  public hasRecoveryData(): boolean {
    return saveSlotService.hasSlotData(1);
  }

  /**
   * Clear recovery flag
   */
  public clearRecoveryFlag(): void {
    localStorage.removeItem(RECOVERY_KEY);
  }

  /**
   * Get last save time
   */
  public getLastSaveTime(): number {
    return this.lastSaveTime;
  }

  /**
   * Enable/disable autosave
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled && this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
  }

  /**
   * Clear all saved data
   */
  public clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RECOVERY_KEY);
    this.saveCount = 0;
    this.lastSaveTime = 0;
  }

  /**
   * Get storage usage info
   */
  public getStorageInfo(): { size: number; lastSave: number; autosaveSlot: number } {
    const autosaveSlotInfo = saveSlotService.getSlotInfo(1);
    const slotData = autosaveSlotInfo ? JSON.stringify(autosaveSlotInfo) : '';
    
    return {
      size: slotData.length,
      lastSave: this.lastSaveTime,
      autosaveSlot: 1
    };
  }
}

// Export singleton instance
export const autosaveService = new AutosaveService();
