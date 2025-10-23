import { Component, createSignal, Show } from 'solid-js';
import { parsePattern, parseDocument } from '@pattern-lang/core';

interface GrammarTabProps {
  getP: () => any;
  requestRedraw: () => void;
}

export const GrammarTab: Component<GrammarTabProps> = (props) => {
  const [exampleInput, setExampleInput] = createSignal('');
  const [exampleResult, setExampleResult] = createSignal<any>(null);
  const [exampleError, setExampleError] = createSignal<string | null>(null);

  const handleExampleTest = (input: string) => {
    setExampleInput(input);
    setExampleError(null);
    setExampleResult(null);

    try {
      if (input.includes('rings:') || input.includes('variables:') || input.includes('palette:')) {
        const result = parseDocument(input);
        if (result.success) {
          setExampleResult(result.ast);
        } else {
          setExampleError(result.error?.message || 'Parse error');
        }
      } else {
        const result = parsePattern(input);
        if (result.success) {
          setExampleResult(result.ast);
        } else {
          setExampleError(result.error?.message || 'Parse error');
        }
      }
    } catch (error) {
      setExampleError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const symbols = [
    { pattern: 'd', description: 'Diamond' },
    { pattern: 'h', description: 'Hook' },
    { pattern: 'l', description: 'L-stroke' },
    { pattern: 'v', description: 'V-hook' },
    { pattern: 'x', description: 'Space' },
    { pattern: 'D', description: 'Rotated' },
    { pattern: 'H', description: 'Rotated' },
    { pattern: 'L', description: 'Rotated' },
    { pattern: 'V', description: 'Rotated' }
  ];

  const examples = [
    { input: 'd3h2', description: 'Three diamonds, two hooks' },
    { input: 'seq($dh, 3)', description: 'Sequence command' },
    { input: '@myPattern = seq($dh, 3)', description: 'Variable definition' },
    { input: 'A = triadic(baseHue: 180)', description: 'Color palette' }
  ];

  return (
    <div class="grammar-tab">
      {/* Symbols */}
      <div class="section">
        <h3>Symbols</h3>
        <div class="symbols-grid">
          {symbols.map(symbol => (
            <div class="symbol-item">
              <code>{symbol.pattern}</code>
              <span>{symbol.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div class="section">
        <h3>Rules</h3>
        <div class="rules">
          <div class="rule"><strong>Numbers:</strong> <code>d2</code> = two diamonds</div>
          <div class="rule"><strong>Uppercase:</strong> <code>D</code> = rotated diamond</div>
          <div class="rule"><strong>Sequences:</strong> <code>$dh2v</code> = pattern sequence</div>
          <div class="rule"><strong>Variables:</strong> <code>@name</code> = variable reference</div>
        </div>
      </div>

      {/* Commands */}
      <div class="section">
        <h3>Commands</h3>
        <div class="commands">
          <div class="command">
            <code>seq($pattern, count)</code> - Repeat pattern
          </div>
          <div class="command">
            <code>mir($pattern)</code> - Mirror pattern
          </div>
        </div>
      </div>

      {/* Colors */}
      <div class="section">
        <h3>Colors</h3>
        <div class="colors">
          <div class="color"><code>triadic(baseHue: 180)</code></div>
          <div class="color"><code>complementary(baseHue: 45)</code></div>
          <div class="color"><code>rgb(255, 128, 64)</code></div>
        </div>
      </div>

      {/* Examples */}
      <div class="section">
        <h3>Examples</h3>
        <div class="examples">
          {examples.map(example => (
            <div class="example" onClick={() => handleExampleTest(example.input)}>
              <code>{example.input}</code>
              <span>{example.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Test Area */}
      <div class="section test-section">
        <h3>Test Syntax</h3>
        <div class="test-container">
          <textarea
            value={exampleInput()}
            onInput={(e) => setExampleInput(e.currentTarget.value)}
            placeholder="Enter pattern or document syntax..."
            class="test-input"
          />
          <button 
            onClick={() => handleExampleTest(exampleInput())}
            class="test-button"
            disabled={!exampleInput().trim()}
          >
            Test
          </button>
        </div>
        
        <Show when={exampleError()}>
          <div class="test-error">Error: {exampleError()}</div>
        </Show>
        
        <Show when={exampleResult()}>
          <div class="test-success">✓ Valid syntax</div>
        </Show>
      </div>
    </div>
  );
};
