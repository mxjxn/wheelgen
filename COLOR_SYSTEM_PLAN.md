# Color System Redesign Plan

## Current Issues
1. **No systematic color assignment** - Each stroke type can have individual colors
2. **Inconsistent color display** - Ring controls don't show correct colors
3. **Complex state management** - Hard to understand color flow
4. **No alternating pattern** - Complementary palettes don't alternate properly

## Proposed Solution: Wrapping Color Selection System

### Core Concept
- **Color Labels**: A, B, C, D (or more based on palette size)
- **Modulo Assignment**: `ringIndex % palette.length` determines base color
- **Alternating Pattern**: For complementary (2 colors), rings alternate A-B-A-B
- **Stroke Assignment**: Each stroke type gets a color offset from base

### Color Assignment Logic
```
Base Color Index = ringIndex % palette.length
Stroke Color Index = (Base Color Index + strokeOffset) % palette.length

For Complementary Palette (2 colors):
- Ring 0: Base A, strokes A, B, A, B...
- Ring 1: Base B, strokes B, A, B, A...
- Ring 2: Base A, strokes A, B, A, B...
- Ring 3: Base B, strokes B, A, B, A...
```

### Stroke Type Mapping
- **d** (diamond): Offset +0 (same as base)
- **h** (h-hook): Offset +1 
- **l** (l-stroke): Offset +2
- **v** (v-hook): Offset +3
- **-** (solid): Offset +0 (same as base)

### State Management
```typescript
interface ColorAssignment {
  mode: 'auto' | 'manual';
  baseColorIndex: number;
  strokeOffsets: {
    d: number;
    h: number; 
    l: number;
    v: number;
    '-': number;
  };
  customAssignments?: Record<string, number>; // For manual overrides
}
```

### UI Changes
1. **Color Management Panel**: Show A, B, C, D labels instead of numbers
2. **Ring Controls**: Show actual assigned colors, not just palette swatches
3. **Auto/Manual Toggle**: Switch between systematic and manual assignment
4. **Color Preview**: Show how colors will be assigned across rings

### Implementation Steps
1. Fix `getCurrentColorIndex()` bug in StrokeColorControl
2. Add color assignment state management
3. Implement wrapping color selection logic
4. Update UI to show A, B, C, D labels
5. Add auto/manual toggle
6. Test with different palette sizes (2, 3, 4 colors)

### Benefits
- **Predictable**: Easy to understand color flow
- **Scalable**: Works with any palette size
- **Visual**: Clear A, B, C, D labeling
- **Flexible**: Can override individual assignments when needed
