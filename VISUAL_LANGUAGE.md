# Visual Language Documentation

## Overview
This document describes the visual language of WheelGen, explaining how each stroke type works and what parameters control their appearance.

## Stroke Types

### 1. Diamond (d/D)
**Description**: A diamond-shaped stroke that creates angular, geometric forms.

**Parameters**:
- **strokeWidth** (0.1 - 2.0): Controls the thickness of the stroke lines
- **size** (0.5 - 2.0): Scales the overall size of the diamond
- **length** (1.0 - 3.0): Controls the horizontal stretch of the diamond
- **rotation** (0 - π): Rotates the diamond (0 = normal, π = 180°)

**Visual Effects**:
- `strokeWidth`: Thicker strokes create more prominent, bold diamonds
- `size`: Larger values make the diamond bigger, smaller values make it more delicate
- `length`: Higher values stretch the diamond horizontally, creating wider forms
- `rotation`: 180° rotation flips the diamond upside down

**Example**: `d2` creates two diamonds, `D` creates a rotated diamond

---

### 2. Horizontal Hook (h/H)
**Description**: A curved stroke that starts from the left and curves to the right, ending with a hook.

**Parameters**:
- **strokeWidth** (0.1 - 2.0): Controls the thickness of the stroke lines
- **size** (0.5 - 2.0): Scales the overall size of the hook
- **curveIntensity** (-0.5 - 1.5): Controls how much the curve bends
- **rotation** (0 - π): Rotates the hook (0 = normal, π = 180°)

**Visual Effects**:
- `strokeWidth`: Thicker strokes create more prominent hooks
- `size`: Larger values make the hook bigger, smaller values make it more delicate
- `curveIntensity`: 
  - Negative values create straighter, more angular forms
  - 0 creates a gentle curve
  - Positive values create more dramatic, hooked curves
- `rotation`: 180° rotation flips the hook direction

**Example**: `h2` creates two hooks, `H` creates a rotated hook

---

### 3. L-Stroke (l/L)
**Description**: A stroke that consists of a horizontal line with a diagonal stem extending downward.

**Parameters**:
- **strokeWidth** (0.1 - 2.0): Controls the thickness of the stroke lines
- **size** (0.5 - 2.0): Scales the overall size of the L-stroke
- **upwardLength** (1.5 - 3.0): Controls how long the diagonal stem is
- **rotation** (0 - π): Rotates the L-stroke (0 = normal, π = 180°)

**Visual Effects**:
- `strokeWidth`: Thicker strokes create more prominent L-forms
- `size`: Larger values make the L-stroke bigger, smaller values make it more delicate
- `upwardLength`: 
  - Lower values create shorter stems, more compact forms
  - Higher values create longer stems, more dramatic L-shapes
- `rotation`: 180° rotation flips the L-stroke upside down

**Example**: `l3` creates three L-strokes, `L` creates a rotated L-stroke

---

### 4. Vertical Hook (v/V)
**Description**: A curved stroke that starts from the top and curves to the right, ending with a hook.

**Parameters**:
- **strokeWidth** (0.1 - 2.0): Controls the thickness of the stroke lines
- **size** (0.5 - 2.0): Scales the overall size of the hook
- **curveIntensity** (-0.5 - 1.5): Controls how much the curve bends
- **rotation** (0 - π): Rotates the hook (0 = normal, π = 180°)

**Visual Effects**:
- `strokeWidth`: Thicker strokes create more prominent hooks
- `size`: Larger values make the hook bigger, smaller values make it more delicate
- `curveIntensity`: 
  - Negative values create straighter, more angular forms
  - 0 creates a gentle curve
  - Positive values create more dramatic, hooked curves
- `rotation`: 180° rotation flips the hook direction

**Example**: `v2` creates two hooks, `V` creates a rotated hook

---

### 5. Solid Ring (-)
**Description**: A solid, filled ring that creates a continuous circular form.

**Parameters**:
- **ringOpacity** (50 - 255): Controls the transparency of the ring

**Visual Effects**:
- `ringOpacity`: Lower values create more transparent, subtle rings
- Higher values create more opaque, prominent rings

---

### 6. Empty Space (x)
**Description**: Creates a gap in the pattern, useful for spacing and rhythm.

**Parameters**: None

**Visual Effects**: Creates visual breathing room between other elements

---

## Global Parameters

### Randomness (0.0 - 0.35)
Controls how much variation is applied to all stroke parameters. Higher values create more organic, less predictable forms.

### Stroke Count (6 - 50)
Controls how many individual stroke lines are used to create each symbol. Higher values create more detailed, textured strokes.

### Color Bleed (0.0 - 1.0)
Controls how much colors blend between adjacent rings. Higher values create more color mixing and transitions.

---

## Grammar Examples

### Basic Patterns
- `d`: Single diamond
- `h2`: Two horizontal hooks
- `l3`: Three L-strokes
- `v`: Single vertical hook

### Complex Patterns
- `d2h2`: Two diamonds followed by two hooks
- `lVh`: L-stroke, rotated vertical hook, horizontal hook
- `d3x2h`: Three diamonds, two spaces, one hook

### Rotation Examples
- `dHl`: Diamond, rotated horizontal hook, L-stroke
- `LxV`: Rotated L-stroke, space, rotated vertical hook

---

## Performance Notes

- **Rendering**: Changes to parameters are not applied until the "Rerender" button is pressed
- **Stroke Count**: Higher stroke counts create more detailed strokes but use more CPU
- **Randomness**: Higher randomness values require more computation per frame
- **Complex Grammars**: Longer grammar strings create more varied patterns but may impact performance

---

## Tips for Effective Use

1. **Start Simple**: Begin with basic patterns like `d` or `h` to understand the system
2. **Use Rotation**: Combine normal and rotated versions for variety
3. **Control Spacing**: Use `x` to create rhythm and breathing room
4. **Layer Effects**: Stack multiple rings with different grammars for complexity
5. **Experiment**: Try different parameter combinations to discover new forms
