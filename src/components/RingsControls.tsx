import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
} from "solid-js";
import {
  rings,
  updateRingPattern,
  updateRing,
  markChanges,
} from "../store/artwork";
import { ActionsControls } from "./ActionsControls";

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
  console.log(`RingControl: Component rendered for ring ${props.index}`);

  // Get the ring from the store to ensure reactivity
  const storeRing = createMemo(() => {
    const storeRings = rings();
    const ring = storeRings[props.index];
    console.log(
      `RingControl: ring ${props.index} updated, grammar: "${ring?.grammarString}"`
    );
    return ring;
  });

  const [grammarString, setGrammarString] = createSignal(
    storeRing()?.grammarString || ""
  );
  const [isVisible, setIsVisible] = createSignal(storeRing()?.visible || false);
  const [isCollapsed, setIsCollapsed] = createSignal(true); // Start collapsed by default

  // Update local state when ring changes
  createEffect(() => {
    const ring = storeRing();
    if (ring) {
      setGrammarString(ring.grammarString || "");
      setIsVisible(ring.visible);
    }
  });

  const handleGrammarChange = (newGrammar: string) => {
    setGrammarString(newGrammar);
    const p = props.getP();
    if (p) {
      updateRingPattern(props.index, newGrammar.trim(), p);
      // Don't call requestRedraw here - let the auto-rerender handle it
    }
  };

  const handleVisibilityChange = (checked: boolean) => {
    setIsVisible(checked);
    updateRing(props.index, { visible: checked });
    markChanges();
  };

  return (
    <div class="ring-control">
      {/* Collapsed View */}
      <Show when={isCollapsed()}>
        <div class="ring-collapsed">
          <div class="ring-collapsed-header">
            <span class="ring-number">Ring {props.index}</span>
            <span class="ring-grammar-display">
              {grammarString() || "No grammar"}
            </span>
            <button
              onClick={() => setIsCollapsed(false)}
              class="expand-btn"
              title="Expand controls"
            >
              ▼
            </button>
          </div>
        </div>
      </Show>

      {/* Expanded View */}
      <Show when={!isCollapsed()}>
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
            <button
              onClick={() => setIsCollapsed(true)}
              class="collapse-btn"
              title="Collapse controls"
            >
              ▲
            </button>
          </div>
        </div>

        {/* Grammar Input */}
        <div class="grammar-row">
          <span>Grammar:</span>
          <input
            value={grammarString()}
            onInput={(e) => handleGrammarChange(e.currentTarget.value)}
            class="grammar-input"
            placeholder="Enter grammar (e.g., d3h2v)"
          />
        </div>

        {/* Symbol Controls */}
        <SymbolControls
          ringIndex={props.index}
          grammarString={grammarString()}
          requestRedraw={props.requestRedraw}
        />
      </Show>
    </div>
  );
};

// Component for symbol-specific controls
const SymbolControls: Component<{
  ringIndex: number;
  grammarString: string;
  requestRedraw: () => void;
}> = (props) => {
  console.log(`SymbolControls: Component rendered for ring ${props.ringIndex}`);

  // Get the ring from the store to ensure reactivity
  const ring = createMemo(() => {
    const storeRings = rings();
    const ring = storeRings[props.ringIndex];
    console.log(
      `SymbolControls: ring ${props.ringIndex} updated, grammar: "${ring?.grammarString}"`
    );
    return ring;
  });

  // Parse the grammar string directly to determine available symbols
  const availableSymbols = createMemo(() => {
    if (!props.grammarString) return [];

    const grammar = props.grammarString.trim();
    if (grammar === "" || grammar === "-") return [];

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

    const result = Array.from(symbols);
    console.log(
      `SymbolControls: availableSymbols for "${grammar}" = [${result.join(", ")}]`
    );
    return result;
  });

  // Group symbols by base character and rotation
  const symbolGroups = createMemo(() => {
    const groups = new Map<string, { rotated: boolean; count: number }>();

    if (!props.grammarString) return groups;

    const grammar = props.grammarString.trim();
    if (grammar === "" || grammar === "-") return groups;

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

    const result = groups;
    console.log(
      `SymbolControls: symbolGroups for "${grammar}" =`,
      Array.from(result.entries())
    );
    return result;
  });

  // Check if ring is solid
  const isSolidRing = createMemo(() => {
    const grammar = props.grammarString?.trim();
    const isSolid = grammar === "-";
    return isSolid;
  });

  return (
    <Show
      when={(() => {
        const condition = Boolean(
          ring()?.visible && props.grammarString?.trim()
        );
        console.log(
          `SymbolControls: Outer Show condition for ring ${props.ringIndex} = ${condition} (visible: ${ring()?.visible}, grammar: "${props.grammarString}")`
        );
        return condition;
      })()}
    >
      <div>
        {/* Solid Ring Controls */}
        <Show when={isSolidRing()}>
          <SolidRingControls ring={ring()} />
        </Show>

        {/* Symbol-specific Controls */}
        <Show
          when={(() => {
            const condition = !isSolidRing() && availableSymbols().length > 0;
            console.log(
              `SymbolControls: Inner Show condition for "${props.grammarString}" = ${condition} (isSolid: ${isSolidRing()}, symbols: ${availableSymbols().length})`
            );
            return condition;
          })()}
        >
          <For each={Array.from(symbolGroups().entries())}>
            {([key, info]) => (
              <SymbolGroupControls
                ring={ring()}
                symbolKey={key}
                info={info}
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
  requestRedraw: () => void;
}> = (props) => {
  const baseChar = () => props.symbolKey.charAt(0);
  const opts = createMemo(() => {
    if (!props.ring?.getShapeOptionsFor) return null;

    // Ensure the ring has shape options for this symbol
    const symbol = baseChar();
    const shapeOptions = props.ring.getShapeOptionsFor(symbol);

    // If shape options don't exist, create default ones
    if (!shapeOptions && props.ring.grammarString) {
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

// Main RingsControls component
export const RingsControls: Component<RingsControlsProps> = (props) => {
  // Sort rings from outer to inner (largest radius to smallest)
  const sortedRings = createMemo(() => {
    const currentRings = rings();
    return [...currentRings].sort((a, b) => b.radius - a.radius);
  });

  return (
    <div class="rings-section">
      <div>
        {/* Actions Controls as Header */}
        <ActionsControls
          getP={props.getP}
          requestRedraw={props.requestRedraw}
        />
      </div>
      <div>
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
