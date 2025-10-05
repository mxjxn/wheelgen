## WheelGen Migration Plan (from mono `index.html` to modular `app/`)

### Goals
- **Modularize** the p5 sketch, UI, and state into TypeScript modules
- **Preserve current behavior** while improving readability and extensibility
- **Enable iterative refactors** with working app at the end of each phase

### Target architecture
```
app/
  src/
    main.ts                # App bootstrapping
    styles/
      base.css
      control-panel.css
    core/
      p5-sketch.ts         # p5 instance setup (setup/draw/windowResized)
      constants.ts         # DIVISIONS, MIN_DIVISIONS, defaults
      color.ts             # palette generation, color helpers
      grammar.ts           # parseGrammar, strokeNames
      alphabet/
        diamond.ts         # drawCalligraphyDiamond
        h-hook.ts          # drawCalligraphyHorizontalHook
        v-hook.ts          # drawCalligraphyHook
        l-stroke.ts        # drawCalligraphyLStroke
        solid-ring.ts      # drawSolidRing
    model/
      types.ts             # TS types/interfaces used across
      ring.ts              # Ring class
      particle.ts          # Particle class
      inner-dot.ts         # InnerDot model + drawInnerDot
      state.ts             # AppState: rings, innerDot, globals, guides
    ui/
      index.ts             # buildUI entry & wiring
      control-panel.ts     # panel open/close + sections
      rings-controls.ts    # ring accordions & sliders
      inner-dot-controls.ts
      actions-controls.ts  # rerender, palette, randomize, guides
      widgets.ts           # minimal utilities for sliders/labels
```

### Dependencies
- **Add**: `p5` (runtime), `@types/p5` (dev) for TS types
- Keep **Vite + TypeScript** already present

### Migration strategy (phased)
1. **Phase 1 — Boot & Sketch shell** ✅
   - ✅ Install deps, set up `p5` in instance mode inside `src/core/p5-sketch.ts`
   - ✅ Render a blank canvas to confirm wiring
2. **Phase 2 — Port core models** ✅ (initial solid-ring rendering)
   - ✅ Move `Ring`, `Particle`, constants, and types into `model/` and `core/`
   - ✅ Keep draw functions temporarily inline (solid ring only)
3. **Phase 3 — Extract drawing alphabet** ✅
   - ✅ Move `drawCalligraphy*` and `drawSolidRing` into `core/alphabet/*`
   - ✅ Wire a symbol→drawFunction map in `grammar.ts`
4. **Phase 4 — Port grammar + palette + inner dot** ✅ (initial wiring)
   - ✅ Move `parseGrammar`, `strokeNames`, palette generation, `drawInnerDot`
   - ✅ Add simple `state` with rings/palette/innerDot/globals
5. **Phase 5 — Replace p5.dom UI with DOM UI** ✅ (initial actions)
   - ✅ Build basic actions panel (Rerender, New Palette, Randomize, Guides)
   - ☐ Mirror existing controls: grammar text, sliders, toggles, accordions
6. **Phase 6 — State & actions**
   - Centralize state (`AppState`) and actions (rerender, randomize, palette)
   - Remove remaining cross-file globals
7. **Phase 7 — Styling**
   - Move inline styles from old `index.html` into `styles/*.css`
8. **Phase 8 — Cleanup**
   - Delete legacy `index.html` logic once parity is confirmed

Each phase should keep the app runnable.

### Module mapping (from mono-file)
- **Globals** (`rings`, `palette`, `alphabet`, `globalRandomness`, `globalStrokeCount`, `globalColorBleed`, `guidesVisible`) → `model/state.ts`
- **Constants** (`DIVISIONS`, `MIN_DIVISIONS`, `defaultGrammars`) → `core/constants.ts`
- **Palette helpers** (`generatePalette`) → `core/color.ts`
- **Grammar** (`parseGrammar`, `strokeNames`) → `core/grammar.ts`
- **Alphabet** (`drawCalligraphyDiamond`, `HorizontalHook`, `Hook`, `LStroke`) → `core/alphabet/*.ts`
- **Solid ring** (`drawSolidRing`) → `core/alphabet/solid-ring.ts`
- **Inner dot** (`innerDot`, `drawInnerDot`) → `model/inner-dot.ts`
- **Classes** (`Ring`, `Particle`) → `model/ring.ts`, `model/particle.ts`
- **p5 lifecycle** (`setup`, `draw`, `windowResized`) → `core/p5-sketch.ts`
- **UI** (`buildUI`, sliders, accordions, events) → `ui/*`

### p5 usage
- Use **instance mode** (`new p5(sketch)`) to prevent globals and allow multiple canvases in future
- Provide `getSketch()` accessor if UI modules need typed helpers

### State management
- Single `AppState` object exported from `model/state.ts` with:
  - **globals**: `randomness`, `strokeCount`, `colorBleed`, `guidesVisible`
  - **rings**: `Ring[]` (ordered by radius)
  - **innerDot**: model
  - **palette**: p5 colors array
- Export **actions**: `initializeArtwork`, `setPalette`, `randomizeAll`, `markChanges`, `applyChanges`

### UI plan (DOM, no framework)
- Mirror existing control panel UX
- **Accordions** for grammar rules, per-ring controls, inner dot
- **Widgets**: slider with label, checkbox, button
- **Events** update state, set `hasChanges`, and enable Rerender button

### Typing & utilities
- Strongly type all option objects used by drawing functions
- Reuse shared `StrokeOptions` where possible; add symbol-specific option types

### Build & scripts
- `npm i p5 @types/p5 -D`
- Keep `dev`, `build`, `preview` scripts from Vite

### Acceptance criteria
- Canvas renders rings identical (or near-identical) to current `index.html`
- All controls work: visibility, grammar updates, sliders, randomness, stroke count, color bleed, guides, palette/randomize, inner dot
- No reliance on `p5.dom`; UI built with DOM APIs
- No inline `<style>`; styles live in `styles/*.css`

### Risks / notes
- p5 HSB/RGB mode switches must be localized per draw call to avoid shared state issues
- Ensure `instance`’s `p5` is passed where needed instead of importing global p5 types
- Performance: keep `noLoop()` + manual `redraw()` after changes; avoid reallocating particles excessively

### Checklists
- [x] Install `p5` and `@types/p5`
- [x] Create file structure
- [x] Boot p5 instance sketch
- [x] Port constants/types/state (initial skeleton)
- [x] Port Ring/Particle (solid ring rendering)
- [ ] Port alphabet drawing fns
- [ ] Port grammar + palette + inner dot
- [ ] Build UI (DOM) with parity
  - [x] Actions scaffold (rerender/palette/randomize/guides)
  - [ ] Grammar inputs per ring
  - [ ] Per-stroke sliders
  - [ ] Inner dot controls
- [ ] Move styles to CSS files
- [ ] Verify visual parity and controls
