import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
  onCleanup,
} from "solid-js";
import {
  rings,
  updateRingPattern,
  updateRing,
  markChanges,
  palette,
  setStrokeColorAssignment,
  colorAssignment,
} from "../store/artwork";
import { colorToRgbString, batchConvertColorsToRgb } from "../core/color";

// Props interface
interface RingsControlsProps {
  getP: () => any; // p5 instance
  requestRedraw: () => void;
}

// Component for individual ring controls
const RingControl: Component<{
  index: number;
  getP: () => any;
  requestRedraw: () => void;
}> = (props) => {
  // Get the ring from the store to ensure reactivity
  const storeRing = createMemo(() => {
    const storeRings = rings();
    const ring = storeRings[props.index];
    return ring;
  });

  const [grammarString, setGrammarString] = createSignal(
    storeRing()?.grammarString || ""
  );
  const [isVisible, setIsVisible] = createSignal(storeRing()?.visible || false);
  const [isUpdating, setIsUpdating] = createSignal(false);

  // Update local state when ring changes
  createEffect(() => {
    const ring = storeRing();
    if (ring) {
      setGrammarString(ring.grammarString || "");
      setIsVisible(ring.visible);
    }
  });

  // Handle grammar input changes (only updates local state, no rendering)
  const handleGrammarInput = (newGrammar: string) => {
    // Update text input immediately for responsive typing
    setGrammarString(newGrammar);
  };

  // Handle grammar submission (triggers actual rendering)
  const handleGrammarSubmit = () => {
    const currentGrammar = grammarString().trim();
    
    // Show updating indicator
    setIsUpdating(true);
    
    // Trigger the actual render
    const p = props.getP();
    if (p) {
      updateRingPattern(props.index, currentGrammar, p);
      props.requestRedraw();
    }
    setIsUpdating(false);
  };

  // Handle Enter key press
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGrammarSubmit();
    }
  };

  const handleVisibilityChange = (checked: boolean) => {
    setIsVisible(checked);
    updateRing(props.index, { visible: checked });
    markChanges();
  };

  return (
    <div class="ring-control">
        {/* Ring Header */}
        <div class="ring-header">
          <span>Ring {props.index}</span>
          <div class="ring-header-controls">
            <label class="ring-visibility">
              <input
                type="checkbox"
                checked={isVisible()}
                onChange={(e) =>
                  handleVisibilityChange(e.currentTarget.checked)
                }
              />
              Visible
            </label>
          </div>
        </div>

        {/* Grammar Input */}
        <div class="grammar-row">
          <span>Grammar:</span>
          <div class="grammar-input-container">
            <input
              value={grammarString()}
              onInput={(e) => handleGrammarInput(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              class="grammar-input"
              placeholder="Enter grammar (e.g., d3h2v)"
            />
            <button
              onClick={handleGrammarSubmit}
              class="grammar-submit-btn"
              title="Apply grammar changes"
            >
              ✓
            </button>
            <Show when={isUpdating()}>
              <span class="updating-indicator">⟳</span>
            </Show>
          </div>
        </div>

        {/* Symbol Controls */}
        <SymbolControls
          ringIndex={props.index}
          grammarString={grammarString()}
          getP={props.getP}
          requestRedraw={props.requestRedraw}
        />
    </div>
  );
};

// Component for symbol-specific controls
const SymbolControls: Component<{
  ringIndex: number;
  grammarString: string;
  getP: () => any;
  requestRedraw: () => void;
}> = (props) => {
  // Get the ring from the store to ensure reactivity
  const ring = createMemo(() => {
    const storeRings = rings();
    const ring = storeRings[props.ringIndex];
    return ring;
  });

  // Get grammar string directly from the store ring for better reactivity
  const grammarString = createMemo(() => {
    const storeRing = ring();
    const grammar = storeRing?.grammarString || "";
    return grammar;
  });

  // Parse the grammar string directly to determine available symbols
  const availableSymbols = createMemo(() => {
    const grammar = grammarString()?.trim();
    if (!grammar || grammar === "" || grammar === "-") return [];

    // Parse the grammar string to get unique symbols (excluding 'x')
    const symbols = new Set<string>();
    let i = 0;
    while (i < grammar.length) {
      const raw = grammar[i];
      let numStr = "";
      let j = i + 1;
      while (
        j < grammar.length &&
        !Number.isNaN(Number(grammar[j])) &&
        grammar[j] !== " "
      ) {
        numStr += grammar[j];
        j++;
      }

      const baseChar = raw.toLowerCase();
      if ("dhlv".includes(baseChar)) {
        symbols.add(baseChar);
      }
      i = j;
    }

    return Array.from(symbols);
  });

  // Group symbols by base character and rotation
  const symbolGroups = createMemo(() => {
    const groups = new Map<string, { rotated: boolean; count: number }>();
    const grammar = grammarString()?.trim();
    
    
    if (!grammar || grammar === "" || grammar === "-") return groups;

    let i = 0;
    while (i < grammar.length) {
      const raw = grammar[i];
      let numStr = "";
      let j = i + 1;
      while (
        j < grammar.length &&
        !Number.isNaN(Number(grammar[j])) &&
        grammar[j] !== " "
      ) {
        numStr += grammar[j];
        j++;
      }

      const isUpper = raw === raw.toUpperCase() && raw !== raw.toLowerCase();
      const baseChar = raw.toLowerCase();


      if ("dhlv".includes(baseChar)) {
        const repeat = numStr === "" ? 1 : parseInt(numStr, 10);
        const key = `${baseChar}${isUpper ? "R" : "N"}`;
        if (groups.has(key)) {
          groups.get(key)!.count += repeat;
        } else {
          groups.set(key, { rotated: isUpper, count: repeat });
        }
      }
      i = j;
    }

    return groups;
  });

  // Check if ring is solid
  const isSolidRing = createMemo(() => {
    const grammar = grammarString()?.trim();
    const isSolid = grammar === "-";
    return isSolid;
  });

  return (
    <Show
      when={Boolean(ring()?.visible)}
    >
      <div>
        {/* Solid Ring Controls */}
        <Show when={isSolidRing()}>
          <SolidRingControls ring={ring()} />
        </Show>

        {/* Symbol-specific Controls */}
        <Show
          when={!isSolidRing() && availableSymbols().length > 0 && grammarString()?.trim()}
        >
        <For each={Array.from(symbolGroups().entries())}>
          {([key, info]) => (
            <SymbolGroupControls
              ring={ring()}
              symbolKey={key}
              info={info}
              ringIndex={props.ringIndex}
              getP={props.getP}
              requestRedraw={props.requestRedraw}
            />
          )}
        </For>
        </Show>
      </div>
    </Show>
  );
};

// Component for solid ring controls
const SolidRingControls: Component<{ ring: any }> = (props) => {
  const opts = createMemo(() => {
    if (!props.ring.getShapeOptionsFor) return null;
    return props.ring.getShapeOptionsFor("solid");
  });

  return (
    <Show when={opts()}>
      <div class="symbol-controls">
        <div class="symbol-group-header">Controls for Solid Ring</div>
        <For each={Object.keys(opts() || {})}>
          {(paramKey) => (
            <ParameterSlider
              ring={props.ring}
              paramKey={paramKey}
              param={opts()![paramKey]}
              requestRedraw={() => {}}
            />
          )}
        </For>
      </div>
    </Show>
  );
};

// Component for symbol group controls
const SymbolGroupControls: Component<{
  ring: any;
  symbolKey: string;
  info: { rotated: boolean; count: number };
  ringIndex: number;
  getP: () => any;
  requestRedraw: () => void;
}> = (props) => {
  const baseChar = () => props.symbolKey.charAt(0);
  
  const opts = createMemo(() => {
    if (!props.ring?.getShapeOptionsFor) return null;

    // Make this memo reactive to grammar changes by accessing the grammar string
    const grammar = props.ring.grammarString;
    
    // Ensure the ring has shape options for this symbol
    const symbol = baseChar();
    const shapeOptions = props.ring.getShapeOptionsFor(symbol);

    // If shape options don't exist, create default ones
    if (!shapeOptions && grammar) {
      // This is a fallback - the ring should have shape options set up by setPattern
      return getDefaultShapeOptions(symbol);
    }

    return shapeOptions;
  });

  const rotationText = () => (props.info.rotated ? " (Rotated)" : "");
  const countText = () => (props.info.count > 1 ? ` ×${props.info.count}` : "");

  return (
    <Show when={opts()}>
      <div class="symbol-controls">
        <div class="symbol-group-header">
          Controls for {baseChar().toUpperCase()}
          {rotationText()}
          {countText()}
        </div>
        <For each={Object.keys(opts() || {})}>
          {(paramKey) => (
            <ParameterSlider
              ring={props.ring}
              paramKey={paramKey}
              param={opts()![paramKey]}
              requestRedraw={props.requestRedraw}
            />
          )}
        </For>
        
        {/* Stroke Color Control */}
        <Show when={props.ring}>
          <StrokeColorControl
            strokeType={baseChar() as 'd' | 'l' | 'h' | 'v' | '-'}
            ringIndex={props.ringIndex}
            getP={props.getP}
            requestRedraw={props.requestRedraw}
          />
        </Show>
      </div>
    </Show>
  );
};

// Component for individual parameter sliders
const ParameterSlider: Component<{
  ring: any;
  paramKey: string;
  param: { min: number; max: number; value: number } | undefined;
  requestRedraw: () => void;
}> = (props) => {
  const [value, setValue] = createSignal(props.param?.value ?? 0);

  createEffect(() => {
    if (props.param) {
      setValue(props.param.value);
    }
  });

  const handleChange = (newValue: number) => {
    setValue(newValue);
    if (props.param) {
      props.param.value = newValue;
    }
    markChanges();
    props.requestRedraw();
  };

  const min = () => props.param?.min ?? 0;
  const max = () => props.param?.max ?? 1;
  const step = () => {
    const delta = max() - min();
    return delta > 0 ? delta / 100 : 0.01;
  };

  return (
    <Show when={props.param}>
      <div class="symbol-control-row">
        <label class="symbol-label">
          {props.paramKey}: {value().toFixed(2)}
        </label>
        <input
          type="range"
          min={min()}
          max={max()}
          step={step()}
          value={value()}
          onChange={(e) => handleChange(Number(e.currentTarget.value))}
          class="symbol-slider"
        />
      </div>
    </Show>
  );
};

// Component for stroke color controls
const StrokeColorControl: Component<{
  strokeType: 'd' | 'l' | 'h' | 'v' | '-';
  ringIndex: number;
  getP: () => any;
  requestRedraw: () => void;
}> = (props) => {
  // Get current palette
  const currentPalette = createMemo(() => palette());
  
  // Cached palette colors for efficient rendering
  const paletteColors = createMemo(() => {
    const pal = currentPalette();
    
    if (!pal || pal.length === 0) {
      return [];
    }
    
    try {
      const p = props.getP();
      
      if (!p) {
        return [];
      }
      
      // Use batched conversion for better performance
      return batchConvertColorsToRgb(p, pal);
    } catch (error) {
      return pal.map(() => '#ffffff');
    }
  });

  // Get current color assignment for this stroke type
  const getCurrentColorIndex = createMemo(() => {
    try {
      const assignment = colorAssignment();
      const currentRings = rings();
      const ring = currentRings[props.ringIndex];
      
      if (!ring) return 0; // Default to first palette color
      
      // Check if there's a custom assignment
      const custom = assignment.customAssignments[props.ringIndex.toString()]?.[props.strokeType];
      if (custom !== undefined) {
        return custom;
      }
      
      // Default: use ring index % 4 (simple)
      return props.ringIndex % 4;
    } catch (error) {
      return 0; // Default to first palette color
    }
  });

  // Update color assignment
  const handleColorChange = (colorIndex: number) => {
    try {
      // Set specific color assignment
      setStrokeColorAssignment(props.ringIndex, props.strokeType, colorIndex);
      props.requestRedraw();
    } catch (error) {
    }
  };

  // Don't render if ring doesn't exist
  if (props.ringIndex < 0 || !rings()[props.ringIndex]) {
    return null;
  }

  return (
    <div class="stroke-color-control">
      <label class="stroke-color-label">
        {props.strokeType.toUpperCase()} Color:
      </label>
      <div class="stroke-color-swatches">
        {/* Palette color options */}
        <For each={paletteColors()}>
          {(backgroundColor, index) => {
            const colorLabel = String.fromCharCode(65 + index()); // A, B, C, D...
            return (
              <button
                class={`stroke-color-swatch ${getCurrentColorIndex() === index() ? 'selected' : ''}`}
                style={`background-color: ${backgroundColor}`}
                onClick={() => handleColorChange(index())}
                title={`Color ${colorLabel}`}
              >
                <span class="color-label">{colorLabel}</span>
              </button>
            );
          }}
        </For>
      </div>
    </div>
  );
};

// Main RingsControls component
export const RingsControls: Component<RingsControlsProps> = (props) => {
  // Sort rings from outer to inner (largest radius to smallest) - memoized for performance
  const sortedRings = createMemo(() => {
    const currentRings = rings();
    return [...currentRings].sort((a, b) => b.radius - a.radius);
  });

  return (
    <div class="rings-controls">
      <div class="rings-header">
        <h3 class="section-title">Ring Controls</h3>
      </div>
      <div class="rings-grid">
        <For each={sortedRings()}>
          {(ring) => (
            <RingControl
              index={rings().indexOf(ring)}
              getP={props.getP}
              requestRedraw={props.requestRedraw}
            />
          )}
        </For>
      </div>
    </div>
  );
};

// Export RingControl for use in App.tsx
export { RingControl };

// Helper function to create default shape options
function getDefaultShapeOptions(symbol: string) {
  const options: Record<string, { min: number; max: number; value: number }> = {
    strokeWidth: { min: 0.1, max: 2.0, value: 0.3 },
    rotation: { min: 0, max: Math.PI, value: 0 },
    size: { min: 0.5, max: 2.0, value: 1.0 },
  };
  if (symbol === "d") options.length = { min: 1, max: 3.0, value: 2.0 } as any;
  if (symbol === "h" || symbol === "v")
    options.curveIntensity = { min: -0.5, max: 1.5, value: 1 } as any;
  if (symbol === "l")
    options.upwardLength = { min: 1.5, max: 3.0, value: 2.0 } as any;
  return options;
}
