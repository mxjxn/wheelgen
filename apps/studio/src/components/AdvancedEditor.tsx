import { Component, createSignal, createEffect, Show, For } from 'solid-js';
import { parseDocument } from '@pattern-lang/core';
import { exportToDocument, applyDocument } from '../store/artwork';
import type { DocumentAST } from '@pattern-lang/core';
import type p5 from 'p5';

interface AdvancedEditorProps {
  onClose: () => void;
  p5Instance: p5;
  requestRedraw: () => void;
}

// Demo examples showcasing different features
const DEMO_EXAMPLES = [
  {
    name: "Basic Patterns",
    description: "Simple character sequences with different radii",
    document: `rings:
O(120.0, 16): $d
O(180.0, 32): $h
O(240.0, 48): $l
O(300.0, 64): $v

dot:
size: 80.0
visible: true`
  },
  {
    name: "Mirror & Sequence",
    description: "Advanced pattern functions with odd counts",
    document: `rings:
O(150.0, 21): mir($d)
O(200.0, 35): seq($dh, 3)
O(250.0, 49): mir(seq($lv, 2))
O(300.0, 63): seq(mir($d), 4)

dot:
size: 100.0
visible: true`
  },
  {
    name: "Mixed Patterns",
    description: "Combination of solid rings and complex patterns",
    document: `rings:
O(140.0, 0): -
O(200.0, 24): $Hxdx
O(260.0, 0): -
O(320.0, 40): seq($dhv, 2)
O(380.0, 56): mir($lx)

dot:
size: 120.0
visible: false`
  },
  {
    name: "Variables & Complex",
    description: "Custom variables with nested pattern functions",
    document: `rings:
O(160.0, 28): seq($dh, 2)
O(220.0, 42): mir(seq($lv, 2))
O(280.0, 56): seq(mir($d), 3)
O(340.0, 70): mir(seq($hv, 2))

variables:
@basePattern = seq($d, 2)
@complexPattern = mir(@basePattern)

dot:
size: 90.0
visible: true`
  }
];

export const AdvancedEditor: Component<AdvancedEditorProps> = (props) => {
  // Initialize with exported document
  const [document, setDocument] = createSignal(exportToDocument());
  const [validationError, setValidationError] = createSignal<string | null>(null);
  const [isValidating, setIsValidating] = createSignal(false);
  const [lastApplied, setLastApplied] = createSignal<string | null>(null);

  // Validate document on change
  createEffect(() => {
    const doc = document();
    if (doc.trim()) {
      setIsValidating(true);
      const result = parseDocument(doc);
      setIsValidating(false);
      
      if (!result.success) {
        setValidationError(result.error?.message || 'Invalid document syntax');
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  });

  // Add keyboard handler for Cmd+Enter
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  const handleApply = () => {
    if (!validationError()) {
      const result = applyDocument(document(), props.p5Instance);
      if (result.success) {
        setLastApplied(new Date().toLocaleTimeString());
        // Trigger redraw to update the artwork immediately
        props.requestRedraw();
        // Don't close the editor - keep it open for continued editing
      } else {
        setValidationError(result.error || 'Failed to apply document');
      }
    }
  };

  // Update Export button to re-export current state
  const handleExport = () => {
    setDocument(exportToDocument());
  };

  // Load example document
  const loadExample = (example: typeof DEMO_EXAMPLES[0]) => {
    setDocument(example.document);
    // Reset select to default option
    const select = document.querySelector('.examples-select') as HTMLSelectElement;
    if (select) {
      select.value = '-1';
    }
  };

  return (
    <div class="fullscreen-editor">
      {/* Status Bar */}
      <div class="editor-status-bar">
        <div class="status-left">
          <span class="status-item">
            <Show when={isValidating()} fallback="Ready">
              Validating...
            </Show>
          </span>
          <Show when={lastApplied()}>
            <span class="status-item success">
              Last applied: {lastApplied()}
            </span>
          </Show>
          <Show when={validationError()}>
            <span class="status-item error">
              Error: {validationError()}
            </span>
          </Show>
        </div>
        <div class="status-right">
          <select 
            class="examples-select"
            onChange={(e) => {
              const selectedIndex = parseInt(e.currentTarget.value);
              if (selectedIndex >= 0 && selectedIndex < DEMO_EXAMPLES.length) {
                loadExample(DEMO_EXAMPLES[selectedIndex]);
              }
            }}
            title="Load example patterns"
          >
            <option value="-1">📚 Examples</option>
            <For each={DEMO_EXAMPLES}>
              {(example, index) => (
                <option value={index()}>{example.name}</option>
              )}
            </For>
          </select>
          <button class="status-btn" onClick={handleExport} title="Export current state">
            Export
          </button>
          <button 
            class="status-btn primary" 
            onClick={handleApply}
            disabled={!!validationError()}
            title="Apply document (Cmd+Enter)"
          >
            Apply
          </button>
          <button class="status-btn" onClick={props.onClose} title="Close editor">
            Close
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div class="editor-main">
        <textarea
          value={document()}
          onInput={(e) => setDocument(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          class={`fullscreen-textarea ${validationError() ? 'error' : ''}`}
          placeholder="Enter document syntax... (Cmd+Enter to apply)"
          spellcheck={false}
        />
      </div>
    </div>
  );
};

function getDefaultDocument(): string {
  return `rings:
O(9, 128): seq($dh2v, 3)
O(4.7, 32): mir($d3x)

dot:
size: 0.5
visible: true

guides:
;; circular grid controls`;
}
