# Design System Architecture

This document explains the structure and organization of the core design system in the `@core/` directory. The system is built around a calligraphic art generation engine that creates complex visual patterns using procedural drawing functions.

## Overview

The design system is organized into several key components:

1. **Grammar System** - Defines the visual language and symbol parsing
2. **Alphabet** - Individual drawing functions for each calligraphic symbol
3. **Color Management** - Handles color generation, conversion, and consistency
4. **Rendering Pipeline** - Manages drawing operations and performance
5. **Constants & Configuration** - Centralized system parameters

## Core Components

### 1. Grammar System (`grammar.ts`)

The grammar system defines the visual language used to generate artwork. It parses string-based instructions into drawable symbols.

**Key Concepts:**
- **Symbols**: Basic drawing units (`d`, `h`, `l`, `v`, `x`, `-`, `solid`)
- **Grammar Strings**: Text instructions like `"dx", "d", "dv", "-", "l", "h"`
- **Parsing**: Converts strings into `GrammarItem[]` with rotation flags

**Symbol Types:**
- `d` - Calligraphy Diamond
- `h` - Calligraphy Horizontal Hook  
- `l` - Calligraphy L-Stroke
- `v` - Calligraphy Hook (vertical)
- `x` - Spacer/empty
- `-` or `solid` - Solid Ring

**Grammar Parsing:**
```typescript
parseGrammar("dx2L3") // Returns array of GrammarItems with rotations
```

### 2. Alphabet System (`alphabet/`)

Each symbol has its own drawing function with consistent interfaces. All drawing functions follow the same pattern:

**Common Interface Pattern:**
```typescript
interface DrawOptions {
  w: number;           // Width
  h: number;           // Height  
  offsets: number[];   // Per-stroke position offsets
  saturations: { startAlpha: number; endAlpha: number }[]; // Alpha gradients
  colors?: p5.Color[]; // Optional per-stroke colors
  baseColor: p5.Color; // Fallback color
  strokeWidth?: number;
  segments?: number;   // Drawing resolution
  size?: number;       // Scale factor
  rotation?: number;   // Rotation angle
  progress?: number;   // Animation progress (0-1)
}
```

**Drawing Functions:**
- `drawCalligraphyDiamond()` - Diamond-shaped strokes
- `drawCalligraphyHorizontalHook()` - Curved horizontal strokes  
- `drawCalligraphyLStroke()` - L-shaped strokes with diagonal stems
- `drawCalligraphyHook()` - Vertical curved strokes
- `drawSolidRing()` - Concentric circular rings

**Key Features:**
- **Segmented Rendering**: Each stroke is broken into segments for smooth gradients
- **Color Mode Safety**: All functions handle RGB/HSB mode switching properly
- **Transform Support**: Rotation and scaling built into each function
- **Progress Animation**: Partial drawing support for animations

### 3. Color Management System

The color system handles the complex task of generating, converting, and maintaining color consistency across different rendering contexts.

#### Core Color Functions (`color.ts`)

**Primary Functions:**
- `generatePalette()` - Main palette generation entry point
- `generateDirectRgbPalette()` - RGB-based palette generation (recommended)
- `createHSBColor()` - Safe HSB color creation with grayscale fallback
- `colorToRgbString()` - UI-safe color conversion
- `hsbToRgb()` - HSB to RGB conversion with saturation handling

**Color Mode Management:**
The system carefully manages p5.js color modes to prevent conversion artifacts:
```typescript
// Store current mode
const currentMode = (p as any)._colorMode;
const currentMaxes = (p as any)._colorMaxes;

// Perform operations in RGB mode
p.colorMode(p.RGB, 255);
// ... color operations ...

// Restore original mode
p.colorMode(currentMode, ...currentMaxes);
```

#### Alternative Palette Systems

**Simple Palette (`simple-palette.ts`):**
- Pure RGB colors for testing and debugging
- Predictable, consistent color values
- Built-in consistency testing

**Direct RGB Palette (`direct-rgb-palette.ts`):**
- Extended palette with more color options
- Direct RGB generation to avoid conversion issues
- Comprehensive color management utilities

#### Color Diagnostics (`color-diagnostic.ts`)

Advanced debugging system for color consistency:
- Tests palette color accuracy
- Validates UI vs P5 rendering consistency  
- Performs round-trip conversion tests
- Identifies color bleeding and conversion artifacts

### 4. Rendering Pipeline

#### P5 Sketch Management (`p5-sketch.ts`)

**Main Responsibilities:**
- Canvas setup and management
- Full-screen responsive rendering
- Store integration for reactive updates
- Guide system for development
- Ring and inner dot rendering coordination

**Key Features:**
- **Reactive Rendering**: Automatically updates when store values change
- **Full-Screen Canvas**: Adapts to window dimensions
- **Guide System**: Visual development aids (64-division grid)
- **Performance Logging**: Tracks rendering performance

#### Deferred Rendering (`deferred-render.ts`)

Performance optimization system that batches and schedules render operations:

**Render Operation Types:**
- `palette` - Color palette changes
- `ring` - Ring geometry updates  
- `stroke` - Individual stroke modifications
- `global` - System-wide changes
- `ui` - User interface updates

**Priority System:**
- `high` - 16ms delay (~60fps)
- `normal` - 50ms delay (20fps)  
- `low` - 200ms delay (5fps)

**Performance Monitoring:**
- Tracks render times and success rates
- Identifies slow operations
- Provides real-time performance metrics

### 5. Constants & Configuration (`constants.ts`)

**System Parameters:**
- `DIVISIONS = 64` - Default ring division count
- `MIN_DIVISIONS = 32` - Minimum allowed divisions
- `defaultGrammars` - Predefined grammar strings for testing

## Data Flow

### 1. Grammar Processing
```
Grammar String → parseGrammar() → GrammarItem[] → Drawing Functions
```

### 2. Color Generation  
```
Random Seed → generateDirectRgbPalette() → p5.Color[] → Drawing Functions
```

### 3. Rendering Pipeline
```
Store Changes → DeferredRenderManager → P5 Sketch → Canvas Output
```

### 4. Drawing Execution
```
GrammarItem + Options → Alphabet Function → Segmented Strokes → Canvas
```

## Key Design Principles

### 1. **Modularity**
Each drawing function is self-contained with consistent interfaces. New symbols can be added by implementing the standard `DrawOptions` interface.

### 2. **Color Safety**
All color operations preserve and restore p5.js color modes to prevent rendering artifacts and ensure UI consistency.

### 3. **Performance Optimization**
- Deferred rendering prevents excessive redraws
- Segmented drawing allows for smooth animations
- Priority-based scheduling optimizes user experience

### 4. **Extensibility**
- Grammar system can be extended with new symbols
- Drawing functions support custom parameters
- Color system supports multiple palette strategies

### 5. **Debugging Support**
- Comprehensive color diagnostics
- Performance monitoring
- Visual guide system for development

## Integration Points

### With Store System
- Reactive updates from Solid.js stores
- Automatic re-rendering on state changes
- Performance metrics integration

### With UI Components  
- Color management panel integration
- Real-time preview updates
- Control parameter synchronization

### With Model Layer
- Ring and particle system integration
- Geometry calculation coordination
- Animation progress tracking

## Future Improvement Areas

1. **Drawing Function Optimization**
   - More precise geometric calculations
   - Better stroke quality and consistency
   - Enhanced parameter control

2. **Color System Enhancement**
   - Advanced color harmony algorithms
   - Better conversion accuracy
   - Expanded palette options

3. **Performance Improvements**
   - GPU acceleration for complex drawings
   - Optimized rendering pipelines
   - Better memory management

4. **Extensibility**
   - Plugin system for custom symbols
   - Advanced grammar features
   - Custom rendering backends

This architecture provides a solid foundation for creating complex, procedural calligraphic artwork while maintaining performance, consistency, and extensibility.
