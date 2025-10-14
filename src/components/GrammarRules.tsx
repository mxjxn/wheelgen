import { Component } from 'solid-js';

interface GrammarRulesProps {
  onExampleClick?: (example: string) => void;
}

export const GrammarRules: Component<GrammarRulesProps> = (props) => {
  const handleExampleClick = (example: string) => {
    if (props.onExampleClick) {
      props.onExampleClick(example);
    }
  };

  const symbols = [
    { pattern: 'd', description: 'Diamond' },
    { pattern: 'h', description: 'Horizontal hook' },
    { pattern: 'l', description: 'L-stroke' },
    { pattern: 'v', description: 'Vertical hook' },
    { pattern: 'x', description: 'Empty space' },
    { pattern: '-', description: 'Solid ring' },
  ];

  const examples = [
    { pattern: 'd', description: 'Single diamond' },
    { pattern: 'd2', description: 'Two diamonds' },
    { pattern: 'D', description: 'Rotated diamond' },
    { pattern: 'dx', description: 'Diamond with space' },
    { pattern: 'd2h2', description: 'Two diamonds, two hooks' },
    { pattern: 'lVh', description: 'L-stroke, rotated hook, horizontal hook' },
  ];

  const ExampleCard: Component<{ pattern: string; description: string }> = (exampleProps) => (
    <div 
      class="example-card"
      onClick={() => handleExampleClick(exampleProps.pattern)}
      title={`Click to use: ${exampleProps.pattern}`}
    >
      <div class="example-pattern">{exampleProps.pattern}</div>
      <div class="example-description">{exampleProps.description}</div>
    </div>
  );

  return (
    <div class="grammar-rules-simple">
      <div class="grammar-header">
        <h2>Grammar Rules</h2>
        <p>Create patterns using calligraphic symbols and simple rules.</p>
      </div>

      {/* Symbols */}
      <div class="grammar-section">
        <h3>Symbols</h3>
        <div class="symbols-grid">
          {symbols.map(symbol => (
            <div class="symbol-card">
              <div class="symbol-pattern">{symbol.pattern}</div>
              <div class="symbol-description">{symbol.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div class="grammar-section">
        <h3>Rules</h3>
        <div class="rules-list">
          <div class="rule-item">
            <strong>Numbers:</strong> Add after symbol to repeat (e.g., <code>d2</code> = two diamonds)
          </div>
          <div class="rule-item">
            <strong>Uppercase:</strong> Rotates symbol 90° (e.g., <code>D</code> = rotated diamond)
          </div>
          <div class="rule-item">
            <strong>Combine:</strong> Chain symbols together (e.g., <code>d2h2</code> = two diamonds, two hooks)
          </div>
        </div>
      </div>

      {/* Examples */}
      <div class="grammar-section">
        <h3>Examples</h3>
        <div class="examples-grid">
          {examples.map(example => (
            <ExampleCard pattern={example.pattern} description={example.description} />
          ))}
        </div>
      </div>
    </div>
  );
};
