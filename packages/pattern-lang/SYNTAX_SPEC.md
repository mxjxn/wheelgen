# WheelGen Pattern Language Specification

## Overview

The WheelGen Pattern Language is a domain-specific language (DSL) designed for creating complex generative art patterns with concise, expressive syntax. It supports both individual pattern expressions and full document-based artwork definitions.

## Pattern Expressions

### Basic Symbols

The language supports five basic calligraphic symbols:

- `d` - Calligraphy Diamond
- `h` - Calligraphy Horizontal Hook  
- `l` - Calligraphy L-Stroke
- `v` - Calligraphy Vertical Hook
- `x` - Empty space/spacer
- `-` - Solid ring

### Symbol Modifiers

**Rotation**: Uppercase letters rotate symbols 90 degrees
- `D` - Rotated diamond
- `H` - Rotated horizontal hook
- `L` - Rotated L-stroke
- `V` - Rotated vertical hook

**Repetition**: Numbers after symbols repeat them
- `d3` - Three diamonds
- `h2` - Two horizontal hooks
- `D4` - Four rotated diamonds

### Pattern Sequences

Use `$` prefix to denote pattern sequences:

```javascript
$dh2v    // Diamond, horizontal hook, horizontal hook, vertical hook
$D3hL    // Rotated diamond (3x), horizontal hook, rotated L-stroke
$dx2h    // Diamond, space, space, horizontal hook
```

### Commands

#### seq() - Sequence Command

Sequences patterns together and repeats the full sequence:

```javascript
seq($d, $h, $l, 3)     // → dhldhldhl
seq($dh, $vl, 2)       // → dhvldhvl
seq($d2, $h, 4)        // → ddhddhddhddh
```

**Syntax**: `seq(pattern1, pattern2, ..., repeatCount)`
**Parameters**: 
- `pattern1, pattern2, ...` - Pattern expressions to sequence
- `repeatCount` - Number of times to repeat the full sequence

#### mir() - Mirror Command

Reverses the order of a pattern:

```javascript
mir($dhlv)    // → vlhd
mir($dh2)     // → hhd
mir($D3h)     // → hDDD
```

**Syntax**: `mir(pattern)`
**Parameters**:
- `pattern` - Pattern expression to mirror

#### space() - Spacing Command

Adds empty spaces between pattern elements:

```javascript
space($dhl, 2)     // → dxxhxxl
space($dh, 1)      // → dxh
space($d2h, 3)     // → dxxxdxxxh
```

**Syntax**: `space(pattern, spaceCount)`
**Parameters**:
- `pattern` - Pattern expression to space
- `spaceCount` - Number of spaces to add between each element

### Element Count Control

Use `:count` suffix to control total element count:

```javascript
seq($dh, 3):64      // Repeat dh pattern to fill 64 elements
mir($dhl):32        // Mirror pattern, repeat to fill 32 elements
space($dhl, 2):48   // Spaced pattern, repeat to fill 48 elements
```

**Behavior**:
- Pattern repeats to fill the specified count
- If pattern exceeds count, it truncates to exact count
- If pattern is shorter, it repeats until count is reached

## Document Syntax

### Document Structure

A complete WheelGen document defines an entire artwork:

```javascript
rings:
O(radius, elementCount): pattern_expression
O(radius, elementCount): pattern_expression

dot:
size: number
color: hex_color
visible: bool

guides:
;; circular grid controls

variables:
$myPattern = seq($dh, 3)
$complex = mir(space($myPattern, 2))
```

### Ring Definitions

Define rings with radius, element count, and pattern:

```javascript
rings:
O(9, 128): seq($dh2v, 3)
O(4.7, 32): mir($d3x)
O(2.1, 16): space($lvh, 1):64
```

**Syntax**: `O(radius, elementCount): pattern_expression`
**Parameters**:
- `radius` - Ring radius (decimal number)
- `elementCount` - Total number of elements in the ring
- `pattern_expression` - Pattern to use for the ring

### Dot Configuration

Configure the center dot:

```javascript
dot:
size: 0.5
color: #FF6B6B
visible: true
```

**Properties**:
- `size` - Dot size (0.0 to 1.0)
- `color` - Hex color code
- `visible` - Boolean visibility

### Variable Definitions

Define reusable patterns:

```javascript
variables:
$myStroke = seq($dh, 3)
$complex = mir(space($myStroke, 2))
$spiral = seq($d, $h, $l, $v, 4)
```

**Syntax**: `$variableName = pattern_expression`
**Usage**: Variables can be referenced in ring patterns:
```javascript
O(9, 128): $myStroke
O(4.7, 32): $complex:48
```

### Comments

Use `;;` for comments:

```javascript
rings:
O(9, 128): seq($dh2v, 3)    ;; Main pattern
O(4.7, 32): mir($d3x)       ;; Accent ring

;; This is a comment
dot:
size: 0.5
```

## Examples

### Basic Patterns

```javascript
// Simple patterns
d                    // Single diamond
d3h2                 // Three diamonds, two hooks
D                    // Rotated diamond
dxh                  // Diamond, space, hook
```

### Command Examples

```javascript
// Sequence command
seq($d, $h, 3)       // → dhldhldhl
seq($dh, $vl, 2)     // → dhvldhvl

// Mirror command  
mir($dhlv)           // → vlhd
mir($dh2)            // → hhd

// Spacing command
space($dhl, 2)       // → dxxhxxl
space($dh, 1)        // → dxh
```

### Element Count Examples

```javascript
seq($dh, 3):64       // Repeat dh pattern to fill 64 elements
mir($dhl):32         // Mirror pattern, repeat to fill 32 elements
space($dhl, 2):48    // Spaced pattern, repeat to fill 48 elements
```

### Complete Document Example

```javascript
rings:
O(9, 128): seq($dh2v, 3)
O(4.7, 32): mir($d3x)
O(2.1, 16): space($lvh, 1):64

dot:
size: 0.5
color: #FF6B6B
visible: true

guides:
;; circular grid controls

variables:
$myStroke = seq($dh, 3)
$complex = mir(space($myStroke, 2))
```

## Error Handling

The parser provides detailed error messages with position information:

```javascript
// Invalid syntax
seq($d, $h)          // Error: seq command requires at least 2 arguments
mir()                 // Error: mir command requires exactly 1 argument
space($d)             // Error: space command requires at least 2 arguments
```

## Future Extensions

### Planned Commands

- `alt()` - Alternate between patterns
- `rand()` - Randomize pattern order
- `incr()` - Incrementing counts
- `decr()` - Decrementing counts
- `wave()` - Wave pattern generation
- `mandala()` - Mandala pattern generation

### Planned Features

- Color definitions and gradients
- Animation keyframes
- Import/export libraries
- Preset templates
- Custom symbol definitions

## Implementation Notes

### Parser Architecture

The pattern language uses a recursive descent parser with:
- Lexer for tokenization
- Parser for AST generation
- Expander for pattern execution
- Document parser for full syntax

### Backward Compatibility

The system maintains full backward compatibility with existing grammar strings:
- Legacy patterns continue to work unchanged
- New syntax is detected automatically
- Fallback to legacy parser on errors

### Performance

- Patterns are parsed once and cached
- Element count expansion is optimized
- Real-time validation provides immediate feedback
- Document parsing is efficient for large artworks

## Migration Guide

### From Legacy Grammar

**Before**:
```javascript
d2h2l2v2x2d2h2l2v2x2d2h2l2v2x2
```

**After**:
```javascript
seq($d2h2l2v2x2, 3)
```

### Complex Pattern Simplification

**Before**:
```javascript
dhlvdlhvdlhvdlhvdlhvdlhvdlhvdlhvdlhvdlhvdlhvdlhv
```

**After**:
```javascript
seq($dhlv, 12)
```

### Element Count Control

**Before**: Manual calculation and repetition
**After**: `pattern:count` syntax

```javascript
seq($dh, 3):64    // Automatically fills 64 elements
```

This specification provides the foundation for creating complex, expressive generative art patterns with concise, readable syntax.
