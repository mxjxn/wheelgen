# Changelog

All notable changes to WheelGen will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Versioning system with semantic versioning
- Automated deployment with version tagging
- CHANGELOG.md for tracking updates

## [2.3.1] - 2024-12-19

### Changed
- **UI Reorganization**: Moved global controls (Randomness, Stroke Count, Color Bleed, Global Stroke Width) from Actions tab to Rings tab with compact horizontal layout
- **Randomize Button**: Converted randomize from tab to prominent header button with green styling for better accessibility
- **Tab Order**: Reorganized tabs to logical flow: Rings → Center → Color → Positioning → Save → Download → Performance
- **Tab Cleanup**: Removed redundant Grammar and Actions tabs (functionality integrated into other tabs)

### Fixed
- **Randomization Reactivity**: Fixed ring controls not updating after randomization - now all parameters update immediately
- **State Management**: Improved ring initialization order to ensure rings are fully configured before setting in store
- **UI Responsiveness**: Enhanced reactivity in ring controls to properly respond to store changes

### Improved
- **UX**: More intuitive tab organization and prominent randomize action
- **Performance**: Better state management reduces unnecessary re-renders
- **Responsive Design**: Added mobile-friendly CSS for compact global controls layout

## [2.0.1] - 2024-01-XX

### Added
- Versioning system with semantic versioning
- Automated deployment with version tagging
- CHANGELOG.md for tracking updates
- RELEASE_GUIDE.md for release management

## [2.0.0] - 2024-01-XX

### Added
- Complete rewrite from single HTML file to full SolidJS application
- Modern component architecture with TypeScript
- Advanced state management system
- Professional UI with tabbed interface
- Comprehensive control panels for all features
- GitHub Pages deployment system

### Changed
- **Major Architecture Overhaul**: Migrated from vanilla HTML/JS to SolidJS + TypeScript
- **Enhanced Performance**: Implemented deferred rendering and performance monitoring
- **Improved UX**: Professional interface with organized control panels
- **Better Code Organization**: Modular component structure with proper separation of concerns

### Features
- **Interactive Controls**: Real-time manipulation of ring patterns, colors, and stroke styles
- **Custom Grammar System**: Procedural generation using calligraphic alphabet elements
- **Color Management**: Advanced color palette system with HSL controls
- **Save System**: 3x3 slot grid with autosave functionality
- **Performance Optimized**: Smooth 60fps rendering with deferred rendering system
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## [0.1.0] - 2024-01-XX

### Added
- Initial release of WheelGen
- Interactive ring pattern controls
- Custom grammar system with calligraphic strokes
- Color management with HSL controls
- Save system with 3x3 slot grid
- Autosave functionality
- Performance monitoring
- Responsive design for desktop and mobile
- GitHub Pages deployment

### Features
- **Calligraphic Strokes**: Diamond, L-stroke, V-hook, H-hook, and solid ring patterns
- **Concentric Rings**: Layered ring system with customizable spacing and rotation
- **Color Palettes**: HSL-based color management with real-time preview
- **Particle Effects**: Dynamic particle systems for enhanced visual appeal
- **Export System**: Download artwork as high-resolution images

---

## How to Update This Changelog

When you release a new version, add a new section at the top under `[Unreleased]` and move the unreleased items to the new version section.

### Example:
```markdown
## [0.2.0] - 2024-01-XX

### Added
- New feature X
- New feature Y

### Changed
- Improved performance of ring rendering
- Updated color picker interface

### Fixed
- Bug fix for save system
- Mobile responsiveness improvements

## [Unreleased]

### Added
- Future feature in development
```
